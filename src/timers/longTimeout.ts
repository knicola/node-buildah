import type { TimerOptions } from 'timers'
import { MAX_INTERVAL } from './constants'
import type { Callback } from './timer.abstract'
import { LongTimer } from './timer.abstract'

export class LongTimeout extends LongTimer {
    protected scheduleNext (): void {
        if (this.timer) return

        if (this.remaining <= MAX_INTERVAL) {
            this.timer = setTimeout(() => {
                this.timer = undefined
                this.callback()
            }, this.remaining)
        } else {
            this.remaining -= MAX_INTERVAL
            this.timer = setTimeout(() => this.scheduleNext(), MAX_INTERVAL)
        }

        if (this.options.ref) this.timer.ref()
        else this.timer.unref()
    }
}

export function setLongTimeout (callback: Callback, interval: number, options?: TimerOptions): LongTimeout {
    return new LongTimeout(callback, interval, options)
}

export function clearLongTimeout (timer: LongTimeout): void {
    timer.clear()
}
