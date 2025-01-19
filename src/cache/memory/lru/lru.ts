import type { Node } from '@/collections/linkedlist/doubly'
import { createLinkedList } from './linkedlist'

export interface CacheOptions {
    capacity: number
}

export interface CacheItem<K, V> {
    key: K
    value: V
}

export interface CacheContext<K, V> {
    capacity: number
    map: Map<K, Node<CacheItem<K, V>>>
    list: ReturnType<typeof createLinkedList<CacheItem<K, V>>>
}

export function createItem<K, V> (key: K, value: V): CacheItem<K, V> {
    return { key, value }
}

export function createContext<K, V> (options: CacheOptions): CacheContext<K, V> {
    if (options.capacity <= 0) throw new Error('Cache capacity must be greater than 0')
    return {
        capacity: options.capacity,
        map: new Map<K, Node<CacheItem<K, V>>>(),
        list: createLinkedList<CacheItem<K, V>>(),
    }
}

export function createLRUCache<K, V> (options: CacheOptions) {
    const cache = createContext<K, V>(options)
    return {
        get: get.bind(null, cache),
        set: set.bind(null, cache),
        delete: remove.bind(null, cache),
        clear: clear.bind(null, cache),
        evict: evict.bind(null, cache),
    }
}
export type LRUCache<K, V> = ReturnType<typeof createLRUCache<K, V>>

export function get<K, V> (ctx: CacheContext<K, V>, key: K): V | null {
    const node = ctx.map.get(key)
    if (! node) return null
    ctx.list.remove(node)
    ctx.list.insertFirst(node)
    return node.value.value
}

export function set<K, V> (ctx: CacheContext<K, V>, key: K, value: V) {
    const existing = ctx.map.get(key)

    if (existing) {
        existing.value.value = value
        ctx.list.remove(existing)
        ctx.list.insertFirst(existing)
        return
    }

    if (ctx.map.size === ctx.capacity) {
        const last = ctx.list.last
        if (last) {
            ctx.map.delete(last.value.key)
            ctx.list.remove(last)
        }
    }

    const item = createItem(key, value)
    const node = ctx.list.createNode(item)
    ctx.list.insertFirst(node)
    ctx.map.set(key, node)
}

export function remove<K, V> (ctx: CacheContext<K, V>, key: K) {
    const node = ctx.map.get(key)
    if (node) {
        ctx.map.delete(key)
        ctx.list.remove(node)
    }
}

export function clear<K, V> (ctx: CacheContext<K, V>) {
    ctx.map.clear()
    ctx.list.clear()
}

export function evict<K, V> (ctx: CacheContext<K, V>, count: number = 1) {
    const last = ctx.list.last
    if (last) {
        remove(ctx, last.value.key)
        if (count > 1) evict(ctx, count - 1)
    }
}
