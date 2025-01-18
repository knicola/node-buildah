import type { XBackoff } from './xbackoff'
import { xbackoff } from './xbackoff'
import { delay } from './delay'
export { AbortError } from './delay'

/**
 * The task to retry
 *
 * @param currentAttempt The current attempt number (starting from 0)
 */
export type RetryTask<T> = (currentAttempt: number) => T

/**
 * The options to use when creating a {@link Retry} instance
 */
export interface RetryOptions {
    /**
     * The maximum amount of times to retry {@link RetryTask}
     *
     * @default 5
     */
    retries?: number
    /**
     * The exponential factor to use
     *
     * @default 2
     */
    factor?: number
    /**
     * The minimum number of milliseconds to start with
     *
     * @default 1000
     */
    minTimeout?: number
    /**
     * The maximum number of milliseconds between two retries
     *
     * @default 60e3
     */
    maxTimeout?: number
    /**
     * Randomize the timeouts
     * @see https://en.wikipedia.org/wiki/Exponential_backoff#Collision_avoidance
     *
     * @default false
     */
    randomize?: boolean
} // RetryOptions

type Options = Required<RetryOptions>

/**
 * Assert the options
 *
 * @param options The options to assert
 * @throws {@link !TypeError} If the options are invalid
 * @internal
 */
export function assertOptions (options: Options): asserts options is Options {
    options.retries = parseInt(`${options.retries}`, 10)
    if (isNaN(options.retries) || options.retries < 0) {
        throw new TypeError('Options.retries must be a positive integer')
    }

    options.factor = parseInt(`${options.factor}`, 10)
    if (isNaN(options.factor) || options.factor < 0) {
        throw new TypeError('Options.factor must be a positive integer')
    }

    options.minTimeout = parseInt(`${options.minTimeout}`, 10)
    if (isNaN(options.minTimeout) || options.minTimeout < 0) {
        throw new TypeError('Options.minTimeout must be a positive integer')
    }

    options.maxTimeout = parseInt(`${options.maxTimeout}`, 10)
    if (isNaN(options.maxTimeout) || options.maxTimeout < 0) {
        throw new TypeError('Options.maxTimeout must be a positive integer')
    }

    if (options.minTimeout > options.maxTimeout) {
        throw new TypeError('Options.maxTimeout must be greater than Options.minTimeout')
    }

    if (! ['boolean', 'undefined'].includes(typeof options.randomize)) {
        throw new TypeError('Options.randomize must be a boolean')
    }
} // assertOptions()

/**
 * Retry a task
 */
export class Retry<T> {
    // options
    protected _task: RetryTask<T>
    protected _opts: Options
    protected _backoffTimeout: XBackoff
    // session
    protected _attempts: number
    protected _runningTask?: Promise<Awaited<T>>
    protected _abortController?: AbortController

    /**
     * @param task The task to retry
     * @param options The options to use
     * @throws {@link !TypeError} If the parameters are invalid
     */
    constructor (task: RetryTask<T>, options?: RetryOptions) {
        if (! task) {
            throw new TypeError('Parameter "task" is required')
        }

        if (typeof task !== 'function') {
            throw new TypeError('Parameter "task" must be a function')
        }

        this._task = task

        // set default options
        this._opts = {
            retries: options?.retries ?? 5,
            factor: options?.factor ?? 2,
            minTimeout: options?.minTimeout ?? 1e3,
            maxTimeout: options?.maxTimeout ?? 60e3,
            randomize: options?.randomize ?? false,
        }
        assertOptions(this._opts)

        // backoff time generator
        this._backoffTimeout = xbackoff(this._opts)

        // session
        this._attempts = 0
    } // constructor()

    /**
     * The options of the retry operation
     */
    public get options (): Options {
        return this._opts
    } // options

    /**
     * Determine whether the task is running or not
     */
    public get isRunning (): boolean {
        return this._runningTask !== undefined
    } // isRunning

    /**
     * Run the task
     *
     * @returns The result of the task
     * @throws {@link AbortError}
     * @throws {@link Error} If the task fails and the retry limit is reached
     */
    public async run (): Promise<Awaited<T>> {
        return await this._run()
    } // run()

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    public async then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: Awaited<T>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): Promise<TResult1 | TResult2> {
        return await this._run()
            .then(onfulfilled)
            .catch(onrejected)
    } // then()

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    public async catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): Promise<T | TResult> {
        return await this._run()
            .catch(onrejected)
    } // catch()

    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    public async finally (onfinally?: (() => void) | undefined | null): Promise<T> {
        return await this._run()
            .finally(onfinally)
    } // finally()

    /**
     * Abort the task
     * @remarks
     * If the task is not running, this method does nothing.
     * If the task is running, it will be aborted and the
     * promise returned by {@link Retry.run()} will be
     * rejected with an {@link AbortError}.
     */
    public abort (): void {
        this._abortController?.abort()
        this._runningTask = undefined
    } // abort()

    /**
     * Run the task
     * @returns The result of the task
     * @throws {@link AbortError}
     * @throws {@link Error} If the task fails and the retry limit is reached
     */
    protected async _run (): Promise<Awaited<T>> {
        if (! this._runningTask) {
            this._attempts = 0
            this._abortController = new AbortController()
            this._runningTask = this._exec(this._abortController.signal)
                .finally(() => (this._runningTask = undefined))
        }
        return await this._runningTask
    } // _run()

    /**
     * Execute the task
     * @param signal The abort signal
     * @returns The result of the task
     * @throws {@link AbortError}
     * @throws {@link Error} If the task fails and the retry limit is reached
     */
    protected async _exec (signal: AbortSignal): Promise<any> {
        try {
            return await Promise.resolve(this._task(this._attempts++))
        } catch (err) {
            const reachedLimit = this._attempts > this._opts.retries
            if (reachedLimit) {
                throw err
            }
            await delay(
                this._backoffTimeout(this._attempts),
                signal,
            )
            return await this._exec(signal)
        }
    } // _exec()
} // class

/**
 * Create a new {@link Retry} instance
 *
 * @param task The task to retry
 * @param options The options to use
 * @returns A new {@link Retry} instance
 * @throws {@link !TypeError} If the options are invalid
 */
export function retry<T> (task: RetryTask<T>, options?: RetryOptions): Retry<T> {
    return new Retry(task, options)
} // retry()
