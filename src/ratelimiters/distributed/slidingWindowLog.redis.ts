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

export interface RedisSlidingWindowLogPolicyOptions extends RedisRateLimiterOptions {}
export class RedisSlidingWindowLogPolicy extends RedisRateLimiterPolicy<RedisSlidingWindowLogPolicyOptions> {
    protected readonly name = 'SlidingWindowLog'
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
