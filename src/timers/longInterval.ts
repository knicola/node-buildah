import type { Callback } from './timer.abstract'
import { LongTimer } from './timer.abstract'
import { MAX_INTERVAL } from './constants'

export class LongInterval extends LongTimer {
    constructor (callback: Callback, interval: number) {
        super(callback, interval)
        this.scheduleNext()
    }

    protected scheduleNext (): void {
        if (this.timer) return

        if (this.remaining <= MAX_INTERVAL) {
            this.timer = setTimeout(() => {
                this.scheduleNext()
                this.callback()
                this.remaining = this.interval
            }, this.remaining)
        } else {
            const remainingTime = this.remaining - MAX_INTERVAL
            this.timer = setTimeout(() => {
                this.remaining = remainingTime
                this.scheduleNext()
            }, MAX_INTERVAL)
        }

        if (this.options.ref) this.timer.ref()
        else this.timer.unref()
    }
}

export function setLongInterval (callback: Callback, interval: number): LongInterval {
    return new LongInterval(callback, interval)
}

export function clearLongInterval (timer: LongInterval): void {
    timer.clear()
}
