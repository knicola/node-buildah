/**
 * The task to repeat
 */
export type RepeatTask = () => any

/**
 * Called once at the start of the task
 */
export type OnStart = () => any

/**
 * Called once after {@link RepeatOptions.maxRuns} is reached
 */
export type OnComplete = () => any

/**
 * Called once after {@link RepeatOptions.maxFailures} is reached
 * @param err The error thrown
 */
export type OnFail = (err: Error) => any

/**
 * Called whenever {@link RepeatTask} throws an error
 * @param err The error thrown
 * @param count The consecutive number of errors
 * @param exit Whether the task will exit after this error
 */
export type OnError = (err: Error, count: number, exit: boolean) => any

/**
 * The options to use when creating a {@link Repeat} instance
 */
export interface RepeatOptions {
    /**
     * The number of milliseconds to wait between each repetition
     */
    interval?: number
    /**
     * Start the repeat operation immediately after {@link Repeat} is created,
     * otherwise wait until {@link Repeat.start} is called
     *
     * @default true
     */
    startOnInit?: boolean
    /**
     * Run task immediately after {@link Repeat.start} is called, otherwise wait
     * until the first timeout is reached
     *
     * @default true
     */
    runOnStart?: boolean
    /**
     * Called once at the start of the operation
     */
    onStart?: OnStart
    /**
     * The maximum number of repetitions to perform before terminating
     *
     * @remarks
     * If set, {@link onComplete} will be called once after the last repetition
     *
     * @default Infinity
     */
    maxRuns?: number
    /**
     * Called once after {@link maxRuns} is reached
     */
    onComplete?: OnComplete
    /**
     * The maximum number of consecutive failures to allow before terminating
     * the operation
     *
     * @remarks
     * If set, {@link onFail} will be called once after the last failed repetition
     *
     * @default Infinity
     */
    maxFailures?: number
    /**
     * Called once after {@link maxFailures} is reached
     */
    onFail?: OnFail
    /**
     * Called whenever {@link RepeatTask} throws an error
     */
    onError?: OnError
} // RepeatOptions

type DefaultOptions = 'interval' | 'startOnInit' | 'runOnStart' | 'maxRuns' | 'maxFailures'
type Options = RepeatOptions & Required<Pick<RepeatOptions, DefaultOptions>>

/**
 * Parse the input to an integer
 *
 * @param input The input to parse
 * @returns The parsed integer
 * @internal
 */
function integer (input: any): number {
    return input === Infinity ? input : parseInt(input, 10)
}

/**
 * Assert the options
 *
 * @param options The options to assert
 * @throws {@link TypeError} If the options are invalid
 * @internal
 */
export function assertOptions (options: Options): void {
    if (options.onStart && typeof options.onStart !== 'function') {
        throw new TypeError('Options.onStart must be a function')
    }

    options.interval = integer(options.interval)
    if (isNaN(options.interval) || options.interval < 0) {
        throw new TypeError('Options.interval must be a positive integer')
    }

    if (options.onError && typeof options.onError !== 'function') {
        throw new TypeError('Options.onError must be a function')
    }

    options.maxRuns = integer(options.maxRuns)
    if (isNaN(options.maxRuns) || options.maxRuns < 0) {
        throw new TypeError('Options.maxRuns must be a positive integer')
    }

    if (options.onComplete && typeof options.onComplete !== 'function') {
        throw new TypeError('Options.onComplete must be a function')
    }

    options.maxFailures = integer(options.maxFailures)
    if (isNaN(options.maxFailures) || options.maxFailures < 0) {
        throw new TypeError('Options.maxFailures must be a positive integer')
    }

    if (options.onFail && typeof options.onFail !== 'function') {
        throw new TypeError('Options.onFail must be a function')
    }

    if (typeof options.runOnStart !== 'boolean') {
        throw new TypeError('Options.runOnStart must be a boolean')
    }

    if (typeof options.startOnInit !== 'boolean') {
        throw new TypeError('Options.startOnInit must be a boolean')
    }
} // assertOptions()

/**
 * A class that repeats a task at a given interval
 */
export class Repeat {
    // options
    protected _task: RepeatTask
    protected _opts: Options
    // session
    protected _timer?: ReturnType<typeof setTimeout>
    protected _firstRun: boolean = true
    protected _running: boolean = false
    protected _errorCounter: number = 0
    protected _successCounter: number = 0

    /**
     * Create a new {@link Repeat} instance
     *
     * @param task The task function to repeat
     * @param options Options
     */
    constructor (task: RepeatTask, options?: RepeatOptions)
    /**
     * Create a new {@link Repeat} instance
     *
     * @param task The task function to repeat
     * @param timeout The number of milliseconds to wait between repeats
     * @param options Options
     */
    constructor (task: RepeatTask, timeout: number, options?: RepeatOptions)
    constructor (task: RepeatTask, timeoutOrOptions?: number | RepeatOptions, maybeOptions?: RepeatOptions) {
        const { timeout, options } = typeof timeoutOrOptions === 'number'
            ? { timeout: timeoutOrOptions, options: maybeOptions }
            : { timeout: undefined, options: timeoutOrOptions }

        if (! task) {
            throw new TypeError('Parameter "task" is required')
        }

        if (typeof task !== 'function') {
            throw new TypeError('Parameter "task" must be a function')
        }

        this._task = task

        // set default options
        this._opts = {
            ...options,
            interval: timeout ?? options?.interval ?? 3000,
            startOnInit: options?.startOnInit ?? true,
            runOnStart: options?.runOnStart ?? true,
            maxRuns: options?.maxRuns ?? Infinity,
            maxFailures: options?.maxFailures ?? Infinity,
        }

        assertOptions(this._opts)

        if (this._opts.startOnInit) {
            this.start()
        }
    } // constructor()

    /**
     * Start the task
     */
    public start (): this {
        if (! this._running) {
            this._running = true
            this._successCounter = 0
            this._errorCounter = 0
            void this._exec()
        }
        return this
    } // start ()

    /**
     * Stop the task
     */
    public stop (): this {
        this._running = false
        clearTimeout(this._timer)
        return this
    } // stop ()

    /**
     * Determine whether the task is running or not
     */
    public get isRunning (): boolean {
        return this._running
    } // isRunning()

    protected async _exec (): Promise<void> {
        if (this._firstRun) {
            await call(this._opts.onStart)
        }

        try {
            if (this._opts.runOnStart || ! this._firstRun) {
                await call(this._task)

                this._successCounter += 1
                this._errorCounter = 0
            }
            this._firstRun = false
        } catch (err) {
            this._errorCounter += 1
            const shouldFail = this._errorCounter >= this._opts.maxFailures
            await call(this._opts.onError, err as Error, this._errorCounter, shouldFail)
            if (shouldFail) {
                this._running = false
                await call(this._opts.onFail, err as Error)
                return
            }
        }

        const shouldSucceed = this._successCounter >= this._opts.maxRuns
        if (shouldSucceed) {
            this._running = false
            await call(this._opts.onComplete)
            return
        }

        this._timer = setTimeout(() => { void this._exec() }, this._opts.interval)
    } // _exec()
} // class

/**
 * Create a new {@link Repeat} instance
 *
 * @param task The task function to repeat
 * @param options Options
 * @returns A new {@link Repeat} instance
 */
export function repeat (task: RepeatTask, options?: RepeatOptions): Repeat
/**
 * Create a new {@link Repeat} instance
 *
 * @param task The task function to repeat
 * @param timeout The time in milliseconds to wait before the next run
 * @param options Options
 * @returns A new {@link Repeat} instance
 */
export function repeat (task: RepeatTask, timeout: number, options?: RepeatOptions): Repeat
export function repeat (task: RepeatTask, timeoutOrOptions?: number | RepeatOptions, maybeOptions?: RepeatOptions): Repeat {
    return new Repeat(task, timeoutOrOptions as any, maybeOptions)
}

/**
 * A task function
 */
type CallTaskFn = (...args: any[]) => any

/**
 * Call a task function
 * @param task Task function
 * @param args Arguments to pass to the task function
 * @returns The return value of the task function or undefined if the task is not a function
 * @example
 * await call(task, arg1, arg2) //=> Promise<ReturnType<typeof task>>
 * await call(undefined, arg1, arg2) //=> undefined
 */
async function call<T extends CallTaskFn> (task?: T, ...args: Parameters<T>): Promise<ReturnType<T> | undefined> {
    if (typeof task === 'function') {
        try {
            return await Promise.resolve(task(...args))
        } catch (error) {
            return await Promise.reject(error)
        }
    }
}
