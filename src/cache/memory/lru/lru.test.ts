import { describe, it, expect } from 'vitest'
import {
    createItem,
    createContext,
    createLRUCache,
    // get,
    // set,
    // remove,
    // clear,
    // evict,
} from './lru'

describe('Cache Utilities', () => {
    it('should define and verify items correctly', () => {
        const item = createItem('key', 'value')
        expect(item.key).toBe('key')
        expect(item.value).toBe('value')
    })

    it('should define and verify context correctly', () => {
        const context = createContext({ capacity: 2 })
        expect(context.capacity).toBe(2)
        expect(context.map).toBeInstanceOf(Map)
    })

    it('should throw an error for invalid cache capacity', () => {
        expect(() => createContext({ capacity: 0 })).toThrowError('Cache capacity must be greater than 0')
    })
})

describe('LRU Cache', () => {
    it('should create an LRU cache and support operations', () => {
        const lruCache = createLRUCache({ capacity: 2 })

        expect(lruCache.get).toBeInstanceOf(Function)
        expect(lruCache.set).toBeInstanceOf(Function)
        expect(lruCache.delete).toBeInstanceOf(Function)
        expect(lruCache.clear).toBeInstanceOf(Function)
        expect(lruCache.evict).toBeInstanceOf(Function)
    })

    it('should get and set values in cache', () => {
        const lruCache = createLRUCache({ capacity: 2 })

        lruCache.set('a', 1)
        expect(lruCache.get('a')).toBe(1)

        lruCache.set('b', 2)
        expect(lruCache.get('b')).toBe(2)

        lruCache.set('a', 3)
        expect(lruCache.get('a')).toBe(3)
    })

    it('should evict least recently used items', () => {
        const lruCache = createLRUCache({ capacity: 2 })

        lruCache.set('a', 1)
        lruCache.set('b', 2)
        lruCache.set('c', 3) // Evicts 'a'

        expect(lruCache.get('a')).toBeNull()
        expect(lruCache.get('b')).toBe(2)
        expect(lruCache.get('c')).toBe(3)
    })

    it('should remove a specific key', () => {
        const lruCache = createLRUCache({ capacity: 2 })

        lruCache.set('a', 1)
        lruCache.set('b', 2)
        lruCache.delete('a')

        expect(lruCache.get('a')).toBeNull()
        expect(lruCache.get('b')).toBe(2)
    })

    it('should clear all items from cache', () => {
        const lruCache = createLRUCache({ capacity: 2 })

        lruCache.set('a', 1)
        lruCache.set('b', 2)
        lruCache.clear()

        expect(lruCache.get('a')).toBeNull()
        expect(lruCache.get('b')).toBeNull()
    })

    it('should evict a specific number of items', () => {
        const lruCache = createLRUCache({ capacity: 3 })

        lruCache.set('a', 1)
        lruCache.set('b', 2)
        lruCache.set('c', 3)
        lruCache.evict(2) // Evicts 'a' and 'b'

        expect(lruCache.get('a')).toBeNull()
        expect(lruCache.get('b')).toBeNull()
        expect(lruCache.get('c')).toBe(3)
    })

    it('should handle edge cases', () => {
        const lruCache = createLRUCache({ capacity: 1 })

        lruCache.set('a', 1)
        expect(lruCache.get('a')).toBe(1)

        lruCache.set('b', 2) // Evicts 'a'
        expect(lruCache.get('a')).toBeNull()
        expect(lruCache.get('b')).toBe(2)

        lruCache.delete('b')
        expect(lruCache.get('b')).toBeNull()
    })
})
