import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'
import type { Redis } from 'ioredis'

const REDIS_LUA_SCRIPT = `
local key = KEYS[1]
local weight = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local interval = tonumber(ARGV[4])

redis.call("ZREMRANGEBYSCORE", key, 0, timestamp - interval)

local total_weight = redis.call("ZCARD", key)

if total_weight >= capacity then
    return -1
end

redis.call("ZADD", key, timestamp, timestamp)
redis.call("EXPIRE", key, interval)

return capacity - (total_weight + weight)
`

export interface SlidingWindowLog {
    weight: number
    timestamp: number
}
export interface RedisSlidingWindowLogPolicyOptions extends DistributedRateLimiterOptions<Redis> {}
export class SlidingWindowLogPolicy implements RateLimiterPolicy {
    private readonly client: Redis & {
        slidingWindowLog: (subject: string, weight: number, timestamp: number, capacity: number, interval: number) => Promise<number>
    }

    constructor (
        private readonly options: RedisSlidingWindowLogPolicyOptions,
    ) {
        this.client = options.client as any
    }

    public async setup (): Promise<void> {
        if (! ['connect', 'ready'].includes(this.client.status)) {
            await this.client.connect()
        }

        this.client.defineCommand('slidingWindowLog', {
            numberOfKeys: 1,
            lua: REDIS_LUA_SCRIPT,
        })
    }

    public async teardown (): Promise<void> {
        await this.client.quit()
    }

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        return await this.client.slidingWindowLog(
            subject,
            weight,
            timestamp,
            this.options.capacity,
            this.options.interval,
        )
    }
}
