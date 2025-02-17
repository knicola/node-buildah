export interface CacheOptions {
    capacity: number
}

export class LRUCache<K, V> {
    protected map: Map<K, V>
    protected capacity: number

    constructor (options: CacheOptions) {
        this.map = new Map()
        this.capacity = options.capacity
    }

    public get (key: K): V | null {
        return this.map.get(key) || null
    }

    public set (key: K, value: V) {
        const existing = this.map.get(key)
        if (existing) this.map.delete(key)
        if (this.map.size >= this.capacity) this.evict()
        this.map.set(key, value)
    }

    public delete (key: K) {
        this.map.delete(key)
    }

    public clear () {
        this.map.clear()
    }

    public evict (count: number = 1) {
        const keys = this.map.keys()
        for (let i = 0; i < count; i++) {
            const { done, value } = keys.next()
            if (done) break
            this.map.delete(value)
        }
    }
}
