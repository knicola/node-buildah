import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'
import type { Redis } from 'ioredis'

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

export interface RedisTokenBucketPolicyOptions extends DistributedRateLimiterOptions<Redis> {
    /** The refill rate in weight per interval */
    refill: number
}
export class RedisTokenBucketPolicy implements RateLimiterPolicy {
    private readonly client: Redis & {
        tokenBucket: (subject: string, weight: number, timestamp: number, capacity: number, interval: number, refill: number) => Promise<number>
    }

    constructor (
        private readonly options: RedisTokenBucketPolicyOptions,
    ) {
        this.client = options.client as any
    }

    public async setup (): Promise<void> {
        if (! ['connect', 'connecting', 'ready'].includes(this.client.status)) {
            await this.client.connect()
        }

        this.client.defineCommand('tokenBucket', {
            numberOfKeys: 1,
            lua: REDIS_LUA_SCRIPT,
        })
    }

    public async teardown (): Promise<void> {
        await this.client.quit()
    }

    public async check (subject: string, weight: number = this.options.weight ?? 1, timestamp = getMilliseconds()): Promise<Remaining> {
        return await this.client.tokenBucket(
            subject,
            weight,
            timestamp,
            this.options.capacity,
            this.options.interval,
            this.options.refill,
        )
    }
}
