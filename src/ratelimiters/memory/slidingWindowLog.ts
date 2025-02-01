import type { MemoryRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'

export interface SlidingWindowLog {
    logs: Array<{ weight: number, timestamp: number }>
}
export interface SlidingWindowLogPolicyOptions extends MemoryRateLimiterOptions<SlidingWindowLog> {}
export class SlidingWindowLogPolicy implements RateLimiterPolicy {
    constructor (
        private readonly options: SlidingWindowLogPolicyOptions,
    ) {}

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        const record = await this.options.store.get(subject)

        if (! record) {
            await this.options.store.set(subject, {
                logs: [{ timestamp, weight }],
            }, this.options.interval)
            return this.options.capacity - weight
        }

        record.logs = record.logs.filter(log => log.timestamp >= timestamp - this.options.interval)
        const totalWeight = record.logs.reduce((acc, log) => acc + log.weight, 0) + weight

        if (totalWeight <= this.options.capacity) {
            record.logs.push({ timestamp, weight })
            await this.options.store.set(subject, record, this.options.interval)
            return this.options.capacity - totalWeight
        }

        return -1
    }
}
