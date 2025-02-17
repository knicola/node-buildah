export interface CacheOptions {
    ttl?: number
}

export interface CacheItem<K, V> {
    key: K
    value: V
    ttl?: number
}

export interface CacheContext<K, V> {
    map: Map<K, CacheItem<K, V>>
    ttl?: number
}

export function createItem<K, V> (key: K, value: V, ttl?: number): CacheItem<K, V> {
    return { key, value, ttl }
}

export function createContext<K, V> (options: CacheOptions): CacheContext<K, V> {
    return {
        map: new Map<K, CacheItem<K, V>>(),
        ttl: options.ttl,
    }
}

export function createTTLCache<K, V> (options: CacheOptions) {
    const cache = createContext<K, V>(options)
    return {
        get: get.bind(null, cache),
        set: set.bind(null, cache),
        delete: remove.bind(null, cache),
        clear: clear.bind(null, cache),
        evict: evict.bind(null, cache),
    }
}
export type TTLCache<K, V> = ReturnType<typeof createTTLCache<K, V>>

export function get<K, V> (ctx: CacheContext<K, V>, key: K): V | null {
    const item = ctx.map.get(key)
    if (! item) return null
    if (item.ttl && item.ttl < Date.now()) {
        ctx.map.delete(key)
        return null
    }
    return item.value
}

export function set<K, V> (ctx: CacheContext<K, V>, key: K, value: V, ttl?: number) {
    const existing = ctx.map.get(key)

    if (existing) {
        existing.value = value
        existing.ttl = ttl ?? ctx.ttl
        return
    }

    ctx.map.set(key, createItem(key, value, ttl ?? ctx.ttl))
}

export function remove<K, V> (ctx: CacheContext<K, V>, key: K) {
    ctx.map.delete(key)
}

export function clear<K, V> (ctx: CacheContext<K, V>) {
    ctx.map.clear()
}

export function evict<K, V> (ctx: CacheContext<K, V>) {
    const now = Date.now()
    for (const [key, item] of ctx.map) {
        if (item.ttl && item.ttl < now) {
            ctx.map.delete(key)
        }
    }
}
