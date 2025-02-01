export interface Store<K = string, V = any> {
    get: (key: K) => V | undefined | Promise<V | undefined>
    set: (key: K, value: V, ttl?: number) => void | Promise<void>
}

export type Subject = string

export interface RateLimiterOptions {
    /** The weight of each request */
    weight?: number
    /** The capacity of the rate limiter */
    capacity: number
    /** The time interval in milliseconds */
    interval: number
}

export interface MemoryRateLimiterOptions<T = any> extends RateLimiterOptions {
    /** The memory store to use */
    store: Store<Subject, T>
}

export interface DistributedRateLimiterOptions<T = any> extends RateLimiterOptions {
    /** The distributed store client to use */
    client: T
}

/**
 * The remaining requests
 * @remarks
 * - If the value is negative, the request is denied
 */
export type Remaining = number

export interface RateLimiterPolicy {
    setup? (): Promise<void>
    check (subject: string, weight?: number, timestamp?: number): Promise<Remaining>
    teardown? (): Promise<void>
}
