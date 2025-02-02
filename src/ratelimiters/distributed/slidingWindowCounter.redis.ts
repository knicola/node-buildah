import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'
import type { Redis } from 'ioredis'

const REDIS_LUA_SCRIPT = `
local key = KEYS[1]
local weight = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local interval = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "w", "t")

if not data then
    redis.call("HMSET", key, "w", weight, "t", timestamp)
    redis.call("PEXPIRE", key, interval)
    return capacity - weight
end

local record_weight = tonumber(data[1])
local record_timestamp = tonumber(data[2])

local decayed_weight = math.ceil(record_weight * math.exp((record_timestamp - timestamp) / interval))
local total_weight = decayed_weight + weight

if total_weight >= capacity then
    return -1
end

redis.call("HMSET", key, "w", total_weight, "t", timestamp)
redis.call("PEXPIRE", key, interval)

return capacity - total_weight
`

export interface SlidingWindowCounter {
    weight: number
    timestamp: number
}
export interface RedisSlidingWindowCounterPolicyOptions extends DistributedRateLimiterOptions<Redis> {}
export class SlidingWindowCounterPolicy implements RateLimiterPolicy {
    private readonly client: Redis & {
        slidingWindowCounter: (subject: string, weight: number, timestamp: number, capacity: number, interval: number) => Promise<number>
    }

    constructor (
        private readonly options: RedisSlidingWindowCounterPolicyOptions,
    ) {
        this.client = options.client as any
    }

    public async setup (): Promise<void> {
        if (! ['connect', 'ready'].includes(this.client.status)) {
            await this.client.connect()
        }

        this.client.defineCommand('slidingWindowCounter', {
            numberOfKeys: 1,
            lua: REDIS_LUA_SCRIPT,
        })
    }

    public async teardown (): Promise<void> {
        await this.client.quit()
    }

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        return await this.client.slidingWindowCounter(
            subject,
            weight,
            timestamp,
            this.options.capacity,
            this.options.interval,
        )
    }
}
