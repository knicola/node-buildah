import { Cron } from 'croner'
import { Frequency } from './frequency'

export interface ScheduleOptions {
    schedule?: string
    before?: TaskFn
    after?: TaskFn
    onSuccess?: (result: any) => any
    onFailure?: (error: any) => any
    onError?: (error: any) => any
    delay?: number
    startAt?: Date | string | number
    overlap?: boolean
    maxRuns?: number
}
type DefaultOptions = 'overlap' | 'delay'
type Options = ScheduleOptions & Required<Pick<ScheduleOptions, DefaultOptions>>

export type TaskFn = (...args: any[]) => Promise<any> | any
export interface Task {
    handler: TaskFn
}

export class Schedule extends Frequency {
    protected $task: TaskFn
    protected $options: Options
    protected $croner?: Cron

    constructor (task: TaskFn | Task, options?: ScheduleOptions) {
        super()

        this.$task = typeof task !== 'function'
            ? task.handler.bind(task)
            : task

        this.$options = {
            ...options,
            delay: Math.max(0, options?.delay ?? 0),
            overlap: options?.overlap ?? false,
        }
    } // constructor()

    public start (): void {
        if (! this.$croner?.isRunning) {
            this.$croner = new Cron(this.$expression.toString(), this.$execute.bind(this), {
                timezone: this.$timezone,
                catch: (err) => { void this.$invoke(this.$options.onError, err) },
                maxRuns: this.$getMaxRuns(),
                startAt: this.$getStartAt(),
            })
        }
    } // start()

    public stop (): void {
        this.$croner?.stop()
    } // stop()

    public delay (delay: number): this {
        this.$options.delay = delay
        return this
    } // delay()

    public overlap (): this {
        this.$options.overlap = true
        return this
    } // overlap()

    public startAt (date: Date | string | number): void {
        this.$options.startAt = date
        this.start()
    } // startAt()

    protected $getStartAt (): Date | undefined {
        if (this.$options.startAt) {
            return new Date(new Date(this.$options.startAt).getTime() + this.$options.delay)
        }

        if (this.$options.delay > 0) {
            return new Date(Date.now() + this.$options.delay)
        }
    } // $getStartAt()

    protected $getMaxRuns (): number | undefined {
        if (this.$options.maxRuns && this.$options.maxRuns > 0 && this.$options.maxRuns < Infinity) {
            return this.$options.maxRuns
        }
    } // $getMaxRuns()

    protected async $execute (): Promise<any> {
        await this.$invoke(this.$options.before)
        let result: any
        try {
            result = await this.$invoke(this.$task)
        } catch (error) {
            await this.$invoke(this.$options.onFailure, error)
        }
        await this.$invoke(this.$options.onSuccess, result)
        await this.$invoke(this.$options.after)
    } // $execute()

    protected async $invoke<T extends TaskFn> (fn?: T, ...args: Parameters<T>): Promise<ReturnType<T> | undefined> {
        if (typeof fn === 'function') {
            return await Promise.resolve(fn(...args))
        }
    } // $invoke()
} // class

export function schedule (task: TaskFn | Task, options?: ScheduleOptions): Schedule {
    return new Schedule(task, options)
} // schedule()
