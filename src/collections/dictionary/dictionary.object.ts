import type { PropertyKey, DictionaryIterator, Dictionary } from './dictionary'

export class DictionaryObject<K extends PropertyKey, V> implements Map<K, V> {
    protected object = Object.create(null)

    constructor (entries?: Iterable<[K, V]>) {
        if (entries) {
            for (const [key, value] of entries) {
                this.object[key] = value
            }
        }
    }

    public set (key: K, value: V): this {
        this.object[key] = value
        return this
    }

    public get (key: K): V | undefined {
        return this.object[key]
    }

    public delete (key: K): boolean {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        return delete this.object[key]
    }

    public has (key: K): boolean {
        return Object.prototype.hasOwnProperty.call(this.object, key)
    }

    public clear (): void {
        this.object = Object.create(null)
    }

    public get size (): number {
        return Object.keys(this.object).length
    }

    public keys (): DictionaryIterator<K> {
        return Object.keys(this.object)[Symbol.iterator]() as DictionaryIterator<K>
    }

    public values (): DictionaryIterator<V> {
        return Object.values(this.object)[Symbol.iterator]() as DictionaryIterator<V>
    }

    public entries (): DictionaryIterator<[K, V]> {
        return Object.entries(this.object)[Symbol.iterator]() as DictionaryIterator<[K, V]>
    }

    public forEach (callbackfn: (value: V, key: K, map: Dictionary<K, V>) => void): void {
        for (const [key, value] of Object.entries(this.object) as Array<[K, V]>) {
            callbackfn(value, key, this)
        }
    }

    public [Symbol.iterator] (): DictionaryIterator<[K, V]> {
        return Object.entries(this.object)[Symbol.iterator]() as DictionaryIterator<[K, V]>
    }

    public [Symbol.toStringTag]: string = 'DictionaryObject'
}
