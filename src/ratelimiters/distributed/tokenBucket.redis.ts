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
local refill = tonumber(ARGV[5])

if weight > capacity then
    return -1
end

local data = redis.call('HMGET', key, 'weight', 'timestamp')

if not data then
    local remaining_weight = capacity - weight
    redis.call('HMSET', key, 'weight', remaining_weight, 'timestamp', timestamp)
    redis.call('PEXPIRE', key, interval)
    return remaining_weight
end

local data_weight = tonumber(data[1])
local data_timestamp = tonumber(data[2])

local elapsed_time = timestamp - data_timestamp
local refill_weight = math.floor(elapsed_time * refill / interval)

local current_weight = math.min(capacity, data_weight + refill_weight)
local remaining_weight = current_weight - weight

if remaining_weight < 0 then
    return -1
end

redis.call('HMSET', key, 'weight', remaining_weight, 'timestamp', data_timestamp)
redis.call('PEXPIRE', key, interval)

return remaining_weight
`

export interface RedisTokenBucketPolicyOptions extends RedisRateLimiterOptions {
    /** The refill rate in weight per interval */
    refill: number
}
export class RedisTokenBucketPolicy extends RedisRateLimiterPolicy<RedisTokenBucketPolicyOptions> {
    protected readonly name = 'TokenBucket'
    protected readonly lua = REDIS_LUA_SCRIPT

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        return this.client[this.name](
            subject,
            weight,
            timestamp,
            this.options.capacity,
            this.options.interval,
            this.options.refill,
        )
    }
}
