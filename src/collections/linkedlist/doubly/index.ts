import type { Node, NodeCallback } from './doubly'
import {
    createList,
    peekFirst,
    peekLast,
    insertFirst,
    insertLast,
    insertBefore,
    insertAfter,
    remove,
    removeFirst,
    removeLast,
    traverse,
    traverseReverse,
    find,
    findLast,
    toArray,
    clear,
    getIterator,
    getReverseIterator,
} from './doubly'
export * from './doubly'

export interface DoublyLinkedList<T> {
    get first (): Node<T> | null
    get last (): Node<T> | null
    get size (): number

    insertFirst (value: T): void
    insertFirst (node: Node<T>): void

    insertLast (value: T): void
    insertLast (node: Node<T>): void

    insertBefore (refNode: Node<T>, value: T): void
    insertBefore (refNode: Node<T>, node: Node<T>): void

    insertAfter (refNode: Node<T>, value: T): void
    insertAfter (refNode: Node<T>, node: Node<T>): void

    remove (node: Node<T>): void
    removeFirst (): void
    removeLast (): void
    peekFirst (): T | null
    peekLast (): T | null
    traverse (fn: NodeCallback<T>): void
    traverseReverse (fn: NodeCallback<T>): void
    find (fn: (node: Node<T>) => boolean): Node<T> | null
    findLast (fn: (node: Node<T>) => boolean): Node<T> | null
    toArray (): T[]
    clear (unlinkNodes?: boolean): void
    getIterator (): Generator<Node<T>>
    getReverseIterator (): Generator<Node<T>>
}

export function createDoublyLinkedList<T> (iterable?: Iterable<T>): DoublyLinkedList<T> {
    const list = createList(iterable)
    return {
        get first () { return list.first },
        get last () { return list.last },
        get size () { return list.size },
        insertFirst: insertFirst.bind(null, list) as any,
        insertLast: insertLast.bind(null, list) as any,
        insertBefore: insertBefore.bind(null, list) as any,
        insertAfter: insertAfter.bind(null, list) as any,
        remove: remove.bind(null, list) as any,
        removeFirst: removeFirst.bind(null, list) as any,
        removeLast: removeLast.bind(null, list) as any,
        peekFirst: peekFirst.bind(null, list) as any,
        peekLast: peekLast.bind(null, list) as any,
        traverse: traverse.bind(null, list) as any,
        traverseReverse: traverseReverse.bind(null, list) as any,
        find: find.bind(null, list) as any,
        findLast: findLast.bind(null, list) as any,
        toArray: toArray.bind(null, list) as any,
        clear: clear.bind(null, list) as any,
        getIterator: getIterator.bind(null, list) as any,
        getReverseIterator: getReverseIterator.bind(null, list) as any,
    }
}
