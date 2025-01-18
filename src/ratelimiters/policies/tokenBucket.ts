import type { RateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'

export interface TokenBucket {
    weight: number
    timestamp: number
}
export interface TokenBucketPolicyOptions extends RateLimiterOptions<TokenBucket> {
    /** The refill rate in weight per interval */
    refill?: number
}
export class TokenBucketPolicy implements RateLimiterPolicy {
    constructor (
        private readonly options: TokenBucketPolicyOptions,
    ) {}

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        const record = await this.options.store.get(subject)

        const { refill = 1 } = this.options

        if (! record) {
            await this.options.store.set(subject, { weight, timestamp }, this.options.interval)
            return this.options.capacity - weight
        }

        // Calculate refill amount
        const elapsedTime = timestamp - record.timestamp
        const refillWeight = Math.floor((refill * elapsedTime) / this.options.interval)

        // Recalculate current weight
        const newWeight = Math.min(this.options.capacity, record.weight + refillWeight)
        const currentWeight = newWeight - weight

        if (currentWeight >= 0) {
            await this.options.store.set(subject, { weight: currentWeight, timestamp }, this.options.interval)
            return this.options.capacity - currentWeight
        }

        return -1
    }
}
