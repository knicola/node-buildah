import { describe, it, expect } from 'vitest'
import {
    createList,
    createNode,
    insertFirst,
    insertLast,
    remove,
    removeFirst,
    removeLast,
    traverse,
    find,
    toArray,
    traverseReverse,
    findLast,
    getIterator,
    getReverseIterator,
    clear,
    peekFirst,
    peekLast,
    insertBefore,
    insertAfter,
} from './doubly'

describe('DoublyLinkedList', () => {
    describe('createList()', () => {
        it('should create an empty list', () => {
            const list = createList<number>()
            expect(list.first).toBeNull()
            expect(list.last).toBeNull()
            expect(list.size).toBe(0)
        })

        it('should create a list from an array', () => {
            const list = createList<number>([1, 2, 3])
            expect(list.first?.value).toBe(1)
            expect(list.last?.value).toBe(3)
            expect(list.size).toBe(3)
        })
    })

    describe('peekFirst()', () => {
        it('should return the first value', () => {
            const list = createList<number>([1, 2, 3])
            const value = peekFirst(list)
            expect(value).toBe(1)
        })
        it('should return undefined if the list is empty', () => {
            const list = createList<number>()
            const value = peekFirst(list)
            expect(value).toBeNull()
        })
    })

    describe('peekLast()', () => {
        it('should return the last value', () => {
            const list = createList<number>([1, 2, 3])
            const value = peekLast(list)
            expect(value).toBe(3)
        })
        it('should return undefined if the list is empty', () => {
            const list = createList<number>()
            const value = peekLast(list)
            expect(value).toBeNull()
        })
    })

    describe('insertFirst()', () => {
        it('should insert a node at the beginning', () => {
            const list = createList<number>([1, 2, 3])
            const node = createNode(0)
            insertFirst(list, node)
            expect(list.first).toBe(node)
            expect(node.next?.value).toBe(1)
        })
        it('should update the last node if the list is empty', () => {
            const list = createList<number>()
            const node = createNode(0)
            insertFirst(list, node)
            expect(list.last).toBe(node)
        })
        it('should throw an error if the node is already in the list', () => {
            const list = createList<number>([1, 2, 3])
            const node = createNode(0)
            insertFirst(list, node)
            expect(() => insertFirst(list, node)).toThrow('Node is already in the list')
        })
        it('should throw an error if the node is in another list', () => {
            const list1 = createList<number>([1, 2, 3])
            const list2 = createList<number>([4, 5, 6])
            const node = createNode(0)
            insertFirst(list1, node)
            expect(() => insertFirst(list2, node)).toThrow('Node is already in another list')
        })
    })

    describe('insertLast()', () => {
        it('should insert a node at the end', () => {
            const list = createList<number>([1, 2, 3])
            const last = list.last
            const node = createNode(4)
            insertLast(list, node)
            expect(list.last).toBe(node)
            expect(node.prev).toBe(last)
            expect(last?.next).toBe(node)
        })
        it('should update the first node if the list is empty', () => {
            const list = createList<number>()
            const node = createNode(0)
            insertLast(list, node)
            expect(list.first).toBe(node)
        })
        it('should throw an error if the node is already in the list', () => {
            const list = createList<number>([1, 2, 3])
            const node = createNode(0)
            insertLast(list, node)
            expect(() => insertLast(list, node)).toThrow('Node is already in the list')
        })
        it('should throw an error if the node is in another list', () => {
            const list1 = createList<number>([1, 2, 3])
            const list2 = createList<number>([4, 5, 6])
            const node = createNode(0)
            insertLast(list1, node)
            expect(() => insertLast(list2, node)).toThrow('Node is already in another list')
        })
    })

    describe('insertBefore()', () => {
        it('should insert a node before another node', () => {
            const list = createList<number>([1, 3])
            const node1 = list.first as any
            const node2 = list.last as any
            const node = createNode(2)
            insertBefore(list, node2, node)
            expect(node1.next).toBe(node)
            expect(node.prev).toBe(node1)
            expect(node.next).toBe(node2)
            expect(node2.prev).toBe(node)
        })
        it('should insert a node before the first node', () => {
            const list = createList<number>([2, 3])
            const node1 = list.first as any
            const node2 = list.last as any
            const node = createNode(1)
            insertBefore(list, node1, node)
            expect(node.prev).toBeNull()
            expect(node.next).toBe(node1)
            expect(node1.prev).toBe(node)
            expect(node1.next).toBe(node2)
        })
        it('should throw an error if the node is already in the list', () => {
            const list = createList<number>([1, 3])
            const node1 = list.first as any
            const node2 = list.last as any
            expect(() => insertBefore(list, node1, node2)).toThrow('Node is already in the list')
        })
        it('should throw an error if the node is in another list', () => {
            const list1 = createList<number>([1, 3])
            const list2 = createList<number>([2, 4])
            const node1 = list1.first as any
            const node2 = list1.last as any
            const node = createNode(2)
            insertBefore(list1, node2, node)
            expect(() => insertBefore(list2, node1, node)).toThrow('Node is already in another list')
        })
        it('should throw an error if the reference node is not in the list', () => {
            const list = createList<number>([1, 3])
            const node = createNode(2)
            expect(() => insertBefore(list, node, node)).toThrow('Reference node is not in the list')
        })
    })

    describe('insertAfter()', () => {
        it('should insert a node after another node', () => {
            const list = createList<number>([1, 3])
            const node1 = list.first as any
            const node2 = list.last as any
            const node = createNode(2)
            insertAfter(list, node1, node)
            expect(node1.next).toBe(node)
            expect(node.prev).toBe(node1)
            expect(node.next).toBe(node2)
            expect(node2.prev).toBe(node)
        })
        it('should insert a node after the last node', () => {
            const list = createList<number>([1, 2])
            const node1 = list.first as any
            const node2 = list.last as any
            const node = createNode(3)
            insertAfter(list, node2, node)
            expect(node1.next).toBe(node2)
            expect(node2.prev).toBe(node1)
            expect(node2.next).toBe(node)
            expect(node.prev).toBe(node2)
        })
        it('should throw an error if the node is already in the list', () => {
            const list = createList<number>([1, 3])
            const node1 = list.first as any
            const node2 = list.last as any
            expect(() => insertAfter(list, node2, node1)).toThrow('Node is already in the list')
        })
        it('should throw an error if the node is in another list', () => {
            const list1 = createList<number>([1, 3])
            const list2 = createList<number>([2, 4])
            const node1 = list1.first as any
            const node2 = list1.last as any
            const node = createNode(2)
            insertAfter(list1, node1, node)
            expect(() => insertAfter(list2, node2, node)).toThrow('Node is already in another list')
        })
        it('should throw an error if the reference node is not in the list', () => {
            const list = createList<number>([1, 3])
            const node = createNode(2)
            expect(() => insertAfter(list, node, node)).toThrow('Reference node is not in the list')
        })
    })

    describe('remove()', () => {
        it('should remove a node', () => {
            const list = createList<number>([1, 2])
            const node1 = list.first as any
            const node2 = list.last as any
            remove(list, node1)
            expect(list.first).toBe(node2)
            expect(list.last).toBe(node2)
            expect(list.size).toBe(1)
        })
        it('should throw an error if the node is not in the list', () => {
            const list = createList<number>([1, 2])
            const node = createNode(0)
            expect(() => remove(list, node)).toThrow('Node is not in the list')
        })
    })

    describe('removeFirst()', () => {
        it('should remove the first node', () => {
            const list = createList<number>([1, 2])
            removeFirst(list)
            expect(list.first).toBe(list.last)
            expect(list.size).toBe(1)
        })
    })

    describe('removeLast()', () => {
        it('should remove the last node', () => {
            const list = createList<number>([1, 2])
            removeLast(list)
            expect(list.first).toBe(list.last)
            expect(list.size).toBe(1)
        })
    })

    describe('getIterator()', () => {
        it('should return an iterator', () => {
            const list = createList<number>([1, 2, 3])
            const iterator = getIterator(list)
            expect(iterator.next().value.value).toBe(1)
            expect(iterator.next().value.value).toBe(2)
            expect(iterator.next().value.value).toBe(3)
            expect(iterator.next().done).toBe(true)
        })
    })

    describe('getReverseIterator()', () => {
        it('should return a reverse iterator', () => {
            const list = createList<number>([1, 2, 3])
            const iterator = getReverseIterator(list)
            expect(iterator.next().value.value).toBe(3)
            expect(iterator.next().value.value).toBe(2)
            expect(iterator.next().value.value).toBe(1)
            expect(iterator.next().done).toBe(true)
        })
    })

    describe('traverse()', () => {
        it('should traverse the list', () => {
            const list = createList<number>([1, 2, 3])
            const result: number[] = []
            traverse(list, node => {
                result.push(node.value)
            })
            expect(result).toEqual([1, 2, 3])
        })
    })

    describe('traverseReverse()', () => {
        it('should traverse the list in reverse', () => {
            const list = createList<number>([1, 2, 3])
            const result: number[] = []
            traverseReverse(list, node => {
                result.push(node.value)
            })
            expect(result).toEqual([3, 2, 1])
        })
    })

    describe('find()', () => {
        it('should find the first node that satisfies the condition', () => {
            const list = createList<number>([1, 2, 2, 3])
            const node = find(list, node => node.value === 2)
            expect(node).toBe(list.first?.next)
        })
        it('should return null if no node satisfies the condition', () => {
            const list = createList<number>([1, 2, 3])
            const node = find(list, node => node.value === 4)
            expect(node).toBeNull()
        })
    })

    describe('findLast()', () => {
        it('should find the last node that satisfies the condition', () => {
            const list = createList<number>([1, 2, 2, 3])
            const node = findLast(list, node => node.value === 2)
            expect(node).toBe(list.last?.prev)
        })
        it('should return null if no node satisfies the condition', () => {
            const list = createList<number>([1, 2, 3])
            const node = findLast(list, node => node.value === 4)
            expect(node).toBeNull()
        })
    })

    describe('toArray()', () => {
        it('should convert the list to an array', () => {
            const list = createList<number>([1, 2, 3])
            const result = toArray(list)
            expect(result).toEqual([1, 2, 3])
        })
    })

    describe('clear()', () => {
        it('should clear the list', () => {
            const list = createList<number>()
            const node1 = createNode(1)
            const node2 = createNode(2)
            const node3 = createNode(3)
            insertLast(list, node1)
            insertLast(list, node2)
            insertLast(list, node3)
            clear(list)
            expect(list.first).toBeNull()
            expect(list.last).toBeNull()
            expect(list.size).toBe(0)
            expect(node1).toMatchObject({ list: null, next: null, prev: null, value: 1 })
            expect(node2).toMatchObject({ list: null, next: null, prev: null, value: 2 })
            expect(node3).toMatchObject({ list: null, next: null, prev: null, value: 3 })
        })
        it('should not unlink nodes if unlinkNodes is false', () => {
            const list = createList<number>()
            const node1 = createNode(1)
            const node2 = createNode(2)
            const node3 = createNode(3)
            insertLast(list, node1)
            insertLast(list, node2)
            insertLast(list, node3)
            clear(list, false)
            expect(list.first).toBeNull()
            expect(list.last).toBeNull()
            expect(list.size).toBe(0)
            expect(node1).toMatchObject({ list, next: node2, prev: null, value: 1 })
            expect(node2).toMatchObject({ list, next: node3, prev: node1, value: 2 })
            expect(node3).toMatchObject({ list, next: null, prev: node2, value: 3 })
        })
    })
})
