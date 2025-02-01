import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import type { Redis } from 'ioredis'

const REDIS_LUA_SCRIPT = `
local subject = KEYS[1]
local weight = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local interval = tonumber(ARGV[3])

local total_weight = tonumber(redis.call('GET', subject) or '0')

if total_weight >= capacity then
    return -1
end

redis.call('INCRBY', subject, weight)

if total_weight == 0 then
    redis.call('EXPIRE', subject, interval)
end

return capacity - total_weight - weight
`

export interface FixedWindowCounter {
    weight: number
    timestamp: number
}
export interface RedisFixedWindowCounterPolicyOptions extends DistributedRateLimiterOptions<Redis> {}
export class FixedWindowCounterPolicy implements RateLimiterPolicy {
    private readonly client: Redis & {
        fixedWindowCounter: (subject: string, weight: number, capacity: number, interval: number) => Promise<number>
    }

    constructor (
        private readonly options: RedisFixedWindowCounterPolicyOptions,
    ) {
        this.client = options.client as any
    }

    public async setup (): Promise<void> {
        if (! ['connect', 'ready'].includes(this.client.status)) {
            await this.client.connect()
        }

        this.client.defineCommand('fixedWindowCounter', {
            numberOfKeys: 1,
            lua: REDIS_LUA_SCRIPT,
        })
    }

    public async check (subject: string, weight: number = this.options.weight ?? 1): Promise<Remaining> {
        return await this.client.fixedWindowCounter(
            subject,
            weight,
            this.options.capacity,
            this.options.interval,
        )
    }
}
