import type { Store } from '../policy'
import { getMilliseconds } from '../clock'

interface StoreEntry<V> {
    value: V
    expiresAt?: number
}

interface InternalStore<K, V> extends Map<K, StoreEntry<V>> {}

export class MemoryStore<K, V> implements Store<K, V> {
    private current: InternalStore<K, V> = new Map()
    private retired: InternalStore<K, V> = new Map()

    constructor (private readonly maxSize: number = 10e3) {}

    private isExpired (record: StoreEntry<V> | undefined, now: number): boolean {
        return record?.expiresAt !== undefined && record.expiresAt < now
    }

    private getFromStore (
        store: InternalStore<K, V>,
        key: K,
        now: number,
    ): StoreEntry<V> | undefined {
        const record = store.get(key)

        if (! record) {
            return undefined
        }

        if (this.isExpired(record, now)) {
            store.delete(key)
            return undefined
        }

        return record
    }

    public get (key: K): V | undefined {
        const now = getMilliseconds()

        // Check the current store
        const valueFromStore = this.getFromStore(this.current, key, now)
        if (valueFromStore !== undefined) {
            return valueFromStore.value
        }

        // Check the retired store and promote if found
        const valueFromOldStore = this.getFromStore(this.retired, key, now)
        if (valueFromOldStore !== undefined) {
            this.current.set(key, valueFromOldStore)
            return valueFromOldStore.value
        }

        return undefined
    }

    public set (key: K, value: V, ttl?: number): void {
        // Retire the current store if it's full
        if (this.current.size >= this.maxSize) {
            this.retired = this.current
            this.current = new Map()
        }

        const entry: StoreEntry<V> = { value }
        if (ttl !== undefined) {
            entry.expiresAt = getMilliseconds() + ttl
        }

        this.current.set(key, entry)
    }
}
