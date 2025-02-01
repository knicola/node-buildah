import type { MemoryRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'

export interface FixedWindowCounter {
    weight: number
    timestamp: number
}
export interface FixedWindowCounterPolicyOptions extends MemoryRateLimiterOptions<FixedWindowCounter> {}
export class FixedWindowCounterPolicy implements RateLimiterPolicy {
    constructor (
        private readonly options: FixedWindowCounterPolicyOptions,
    ) {}

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        const entry = await this.options.store.get(subject)

        if (! entry || entry.timestamp + this.options.interval <= timestamp) {
            await this.options.store.set(subject, { weight, timestamp }, this.options.interval)
            return this.options.capacity - weight
        }

        if (entry.weight + weight <= this.options.capacity) {
            entry.weight += weight
            await this.options.store.set(subject, entry, this.options.interval)
            return this.options.capacity - entry.weight
        }

        return -1
    }
}
