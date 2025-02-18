import type { Remaining } from '../policy'
import { getMilliseconds } from '../clock'
import type { RedisRateLimiterOptions } from './abstract.redis'
import { RedisRateLimiterPolicy } from './abstract.redis'

const REDIS_LUA_SCRIPT = /* lua */`
local key = KEYS[1]
local weight = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local interval = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "w", "t")
local record_weight = tonumber(data[1]) or 0
local record_timestamp = tonumber(data[2]) or timestamp

local time_diff = timestamp - record_timestamp
local decayed_weight = record_weight - math.max(0, record_weight * time_diff / interval)
local total_weight = decayed_weight + weight

if total_weight >= capacity then
    return -1
end

redis.call("HMSET", key, "w", total_weight, "t", timestamp)
redis.call("PEXPIRE", key, interval)

return capacity - total_weight
`

export interface RedisSlidingWindowCounterPolicyOptions extends RedisRateLimiterOptions {}
export class RedisSlidingWindowCounterPolicy extends RedisRateLimiterPolicy<RedisSlidingWindowCounterPolicyOptions> {
    protected readonly name = 'SlidingWindowCounter'
    protected readonly lua = REDIS_LUA_SCRIPT

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        return this.client[this.name](
            subject,
            weight,
            timestamp,
            this.options.capacity,
            this.options.interval,
        )
    }
}
