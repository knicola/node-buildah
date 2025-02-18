import type { Remaining } from '../policy'
import type { RedisRateLimiterOptions } from './abstract.redis'
import { RedisRateLimiterPolicy } from './abstract.redis'

const REDIS_LUA_SCRIPT = /* lua */`
local subject = KEYS[1]
local weight = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local interval = tonumber(ARGV[3])

local current_weight = tonumber(redis.call('GET', subject)) or 0
if current_weight + weight > capacity then
    return -1
end

redis.call('INCRBY', subject, weight)
if current_weight == 0 then
    redis.call('PEXPIRE', subject, interval)
end

return capacity - current_weight - weight
`

export interface RedisFixedWindowCounterPolicyOptions extends RedisRateLimiterOptions {}
export class RedisFixedWindowCounterPolicy extends RedisRateLimiterPolicy<RedisFixedWindowCounterPolicyOptions> {
    protected readonly name = 'FixedWindowCounter'
    protected readonly lua = REDIS_LUA_SCRIPT

    public async check (subject: string, weight: number = this.options.weight ?? 1): Promise<Remaining> {
        return this.client[this.name](
            subject,
            weight,
            this.options.capacity,
            this.options.interval,
        )
    }
}
