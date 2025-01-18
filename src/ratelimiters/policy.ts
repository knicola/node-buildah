export interface Store<K = string, V = any> {
    get: (key: K) => V | undefined | Promise<V | undefined>
    set: (key: K, value: V, ttl?: number) => void | Promise<void>
}

export type Subject = string

export interface RateLimiterOptions<T = any> {
    /** The weight of each request */
    weight?: number
    /** The capacity of the rate limiter */
    capacity: number
    /** The time interval in milliseconds */
    interval: number
    /** The store to use */
    store: Store<Subject, T>
}

export type Remaining = number

export interface RateLimiterPolicy {
    setup? (): Promise<void>
    check (subject: string, weight?: number, timestamp?: number): Promise<Remaining>
    teardown? (): Promise<void>
}

export abstract class AbstractPolicy<T extends RateLimiterOptions> {
    constructor (
        protected readonly options: T,
    ) {}
}
