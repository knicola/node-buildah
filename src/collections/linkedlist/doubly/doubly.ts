/* eslint-disable curly */
export interface Node<T> {
    value: T
    list: ListContext<T> | null
    next: Node<T> | null
    prev: Node<T> | null
}

export interface ListContext<T> {
    first: Node<T> | null
    last: Node<T> | null
    size: number
}

export type NodeCallback<T> = (node: Node<T>) => void

export function createContext<T> (iterable?: Iterable<T> | null): ListContext<T> {
    const list: ListContext<T> = {
        first: null,
        last: null,
        size: 0,
    }

    if (iterable) {
        for (const data of iterable) {
            insertLast(list, createNode(data))
        }
    }

    return list
}

export function createNode<T> (data: T): Node<T> {
    return {
        value: data,
        list: null,
        next: null,
        prev: null,
    }
}

export function peekFirst<T> (list: ListContext<T>): T | null {
    return list.first?.value ?? null
}

export function peekLast<T> (list: ListContext<T>): T | null {
    return list.last?.value ?? null
}

export function insertFirst<T> (list: ListContext<T>, node: Node<T>): void {
    if (node.list === list) throw new Error('Node is already in the list')
    if (node.list !== null) throw new Error('Node is already in another list')

    node.list = list
    node.next = list.first
    node.prev = null

    if (list.first) list.first.prev = node
    else list.last = node

    list.first = node
    list.size += 1
}

export function insertLast<T> (list: ListContext<T>, node: Node<T>): void {
    if (node.list === list) throw new Error('Node is already in the list')
    if (node.list !== null) throw new Error('Node is already in another list')

    node.list = list
    node.prev = list.last
    node.next = null

    if (list.last) list.last.next = node
    else list.first = node

    list.last = node
    list.size += 1
}

export function insertBefore<T> (list: ListContext<T>, refNode: Node<T>, node: Node<T>): void {
    if (node.list === list) throw new Error('Node is already in the list')
    if (node.list !== null) throw new Error('Node is already in another list')
    if (refNode.list !== list) throw new Error('Reference node is not in the list')

    node.list = list
    node.next = refNode
    node.prev = refNode.prev

    if (refNode.prev) refNode.prev.next = node
    else list.first = node

    refNode.prev = node
    list.size += 1
}

export function insertAfter<T> (list: ListContext<T>, refNode: Node<T>, node: Node<T>): void {
    if (node.list === list) throw new Error('Node is already in the list')
    if (node.list !== null) throw new Error('Node is already in another list')
    if (refNode.list !== list) throw new Error('Reference node is not in the list')

    node.list = list
    node.prev = refNode
    node.next = refNode.next

    if (refNode.next) refNode.next.prev = node
    else list.last = node

    refNode.next = node
    list.size += 1
}

export function remove<T> (list: ListContext<T>, node: Node<T>): void {
    if (node.list !== list) throw new Error('Node is not in the list')

    if (node.prev) node.prev.next = node.next
    else list.first = node.next

    if (node.next) node.next.prev = node.prev
    else list.last = node.prev

    node.prev = null
    node.next = null
    node.list = null

    list.size -= 1
}

export function removeForward<T> (list: ListContext<T>, start: Node<T>, n: number): void {
    if (start.list !== list) throw new Error('Node is not in the list')

    let current: Node<T> | null = start
    let count = 0

    while (current !== null && count < n) {
        const nextNode = current.next

        if (current.prev) current.prev.next = current.next
        else list.first = current.next

        if (current.next) current.next.prev = current.prev
        else list.last = current.prev

        current.prev = null
        current.next = null

        current = nextNode
        count++
    }

    list.size -= count
}

export function removeBackward<T> (list: ListContext<T>, start: Node<T>, n: number): void {
    if (start.list !== list) throw new Error('Node is not in the list')

    let current: Node<T> | null = start
    let count = 0

    while (current !== null && count < n) {
        const prevNode = current.prev

        if (current.next) current.next.prev = current.prev
        else list.last = current.prev

        if (current.prev) current.prev.next = current.next
        else list.first = current.next

        current.prev = null
        current.next = null

        current = prevNode
        count++
    }

    list.size -= count
}

export function removeFirst<T> (list: ListContext<T>): void {
    if (list.first) remove(list, list.first)
}

export function removeLast<T> (list: ListContext<T>): void {
    if (list.last) remove(list, list.last)
}

export function * getIterator<T> (list: ListContext<T>, from?: Node<T>): Generator<Node<T>> {
    let current = list.first

    if (from) {
        if (from.list !== list) throw new Error('Node is not in the list')
        current = from
    }

    while (current) {
        const next = current.next
        yield current
        current = next
    }
}

export function * getReverseIterator<T> (list: ListContext<T>, from?: Node<T>): Generator<Node<T>> {
    let current = list.last

    if (from) {
        if (from.list !== list) throw new Error('Node is not in the list')
        current = from
    }

    while (current) {
        const prev = current.prev
        yield current
        current = prev
    }
}

export function traverse<T> (list: ListContext<T>, fn: (node: Node<T>) => void): void {
    for (const node of getIterator(list)) {
        fn(node)
    }
}

export function traverseReverse<T> (list: ListContext<T>, fn: (node: Node<T>) => void): void {
    for (const node of getReverseIterator(list)) {
        fn(node)
    }
}

export function find<T> (list: ListContext<T>, fn: (node: Node<T>) => boolean): Node<T> | null {
    for (const node of getIterator(list)) {
        if (fn(node)) return node
    }

    return null
}

export function findLast<T> (list: ListContext<T>, fn: (node: Node<T>) => boolean): Node<T> | null {
    for (const node of getReverseIterator(list)) {
        if (fn(node)) return node
    }

    return null
}

export function toArray<T> (list: ListContext<T>): T[] {
    const result: T[] = []

    for (const node of getIterator(list)) {
        result.push(node.value)
    }

    return result
}

export function clear<T> (list: ListContext<T>, unlinkNodes: boolean = true): void {
    if (unlinkNodes) {
        for (const node of getIterator(list)) {
            node.list = null
            node.next = null
            node.prev = null
        }
    }

    list.first = null
    list.last = null
    list.size = 0
}
