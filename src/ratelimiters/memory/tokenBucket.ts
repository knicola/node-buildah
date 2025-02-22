import type { MemoryRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'

export interface TokenBucket {
    weight: number
    timestamp: number
}
export interface TokenBucketPolicyOptions extends MemoryRateLimiterOptions<TokenBucket> {
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
            const remainingWeight = this.options.capacity - weight
            await this.options.store.set(subject, { weight: remainingWeight, timestamp }, this.options.interval)
            return remainingWeight >= 0 ? remainingWeight : -1
        }

        // Calculate refill amount
        const elapsedTime = timestamp - record.timestamp
        const refillWeight = Math.floor(refill * elapsedTime / this.options.interval)

        // Recalculate remaining weight
        const currentWeight = Math.min(this.options.capacity, record.weight + refillWeight)
        const remainingWeight = currentWeight - weight

        if (remainingWeight < 0) {
            return -1
        }

        await this.options.store.set(subject, { weight: remainingWeight, timestamp }, this.options.interval)

        return remainingWeight
    }
}
