import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'
import type { Redis } from 'ioredis'

const REDIS_LUA_SCRIPT = `
local key = KEYS[1]
local weight = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local interval = tonumber(ARGV[4])

if weight > capacity then
    return -1
end

redis.call("ZREMRANGEBYSCORE", key, 0, timestamp - interval)

local current_weight = 0
local logs = redis.call("ZRANGE", key, 0, -1, "WITHSCORES")

for i = 1, #logs, 2 do
    current_weight = current_weight + logs[i]
end

if current_weight + weight > capacity then
    return -1
end

redis.call("ZADD", key, timestamp, weight)
redis.call("EXPIRE", key, interval)

return capacity - (current_weight + weight)
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
