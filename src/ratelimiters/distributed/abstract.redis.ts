import type Redis from 'ioredis'
import type { DistributedRateLimiterOptions, RateLimiterPolicy, Remaining } from '../policy'

export interface RedisRateLimiterOptions extends DistributedRateLimiterOptions<Redis> {}

export abstract class RedisRateLimiterPolicy<T extends RedisRateLimiterOptions> implements RateLimiterPolicy {
    protected abstract readonly name: string
    protected readonly numberOfKeys: number = 1
    protected abstract readonly lua: string
    protected readonly client: Redis
    protected readonly options: T

    constructor (options: T) {
        this.options = options
        this.client = options.client
    }

    public async setup (): Promise<void> {
        if (! ['connect', 'connecting', 'ready'].includes(this.client.status)) {
            await this.client.connect()
        }

        this.client.defineCommand(this.name, {
            numberOfKeys: 1,
            lua: this.lua,
        })
    }

    public abstract check (subject: string, weight: number): Promise<Remaining>

    public async peek (subject: string): Promise<Remaining> {
        return await this.check(subject, 0)
    }

    public async teardown (): Promise<void> {
        await this.client.quit()
    }
}
