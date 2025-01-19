import {
    createContext,
    createNode,
    insertFirst,
    remove,
    clear,
} from '@/collections/linkedlist/doubly'

export function createLinkedList<T> () {
    const list = createContext<T>()
    return {
        get last () { return list.last },
        insertFirst: insertFirst.bind(null, list),
        remove: remove.bind(null, list),
        clear: clear.bind(null, list),
        createNode,
    }
}
export type LinkedList<T> = ReturnType<typeof createLinkedList<T>>
