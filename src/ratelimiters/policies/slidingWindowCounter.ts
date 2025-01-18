import type { RateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'

export interface SlidingWindowCounter {
    weight: number
    timestamp: number
}
export interface SlidingWindowCounterPolicyOptions extends RateLimiterOptions<SlidingWindowCounter> {}
export class SlidingWindowCounterPolicy implements RateLimiterPolicy {
    constructor (
        private readonly options: SlidingWindowCounterPolicyOptions,
    ) {}

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        const record = await this.options.store.get(subject)

        if (! record) {
            await this.options.store.set(subject, { weight, timestamp }, this.options.interval)
            return this.options.capacity - weight
        }

        const totalWeight = record.weight * Math.exp((record.timestamp - timestamp) / this.options.interval) + weight

        if (totalWeight <= this.options.capacity) {
            await this.options.store.set(subject, { weight: totalWeight, timestamp }, this.options.interval)
            return this.options.capacity - totalWeight
        }

        return -1
    }
}
