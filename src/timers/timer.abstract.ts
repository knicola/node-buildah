import type { TimerOptions } from 'timers'

export type Callback = (...args: any[]) => void

export abstract class LongTimer {
    protected timer?: NodeJS.Timeout
    protected interval: number
    protected remaining: number
    protected options: TimerOptions
    protected callback: Callback

    constructor (callback: Callback, interval: number, options?: TimerOptions) {
        this.callback = callback
        this.interval = interval
        this.remaining = interval
        this.options = { ...options }
    }

    protected abstract scheduleNext (): void

    public ref (): void {
        this.options.ref = true
    }

    public unref (): void {
        this.options.ref = false
    }

    public hasRef (): boolean {
        return !! this.options.ref
    }

    public refresh (): void {
        if (this.timer) clearTimeout(this.timer)
        this.remaining = this.interval
        this.scheduleNext()
    }

    public clear (): void {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = undefined
        }
    }
}
