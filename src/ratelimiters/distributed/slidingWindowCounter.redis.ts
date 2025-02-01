import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'
import { getMilliseconds } from '../clock'
import type { Redis } from 'ioredis'

const REDIS_LUA_SCRIPT = `
local key = KEYS[1]
local weight = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local interval = tonumber(ARGV[4])

local record = redis.call("GET", key)
local record_weight = 0
local record_timestamp = 0

if record then
    local delimiter_position = string.find(record, ":")
    if delimiter_position then
        record_weight = tonumber(string.sub(record, 1, delimiter_position - 1))
        record_timestamp = tonumber(string.sub(record, delimiter_position + 1))
    end
end

local decayed_weight = math.ceil(record_weight * math.exp((record_timestamp - timestamp) / interval))
local total_weight = decayed_weight + weight

if total_weight <= capacity then
    local new_record = tostring(total_weight) .. ":" .. tostring(timestamp)
    redis.call("SET", key, new_record, "PX", interval)
    return capacity - total_weight
end

return -1
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
        await this.options.client.quit()
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
