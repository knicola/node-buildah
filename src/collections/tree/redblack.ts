
/* eslint-disable curly */
export interface Node<T> {
    value: T
    color: 'red' | 'black'
    left: Node<T> | null
    right: Node<T> | null
    parent: Node<T> | null
}

export interface RedBlackTree<T> {
    root: Node<T> | null
}

export function createNode<T> (value: T, color: 'red' | 'black'): Node<T> {
    return {
        value,
        color,
        left: null,
        right: null,
        parent: null,
    }
}

export function createTree<T> (): RedBlackTree<T> {
    return {
        root: null,
    }
}

function rotateLeft<T> (tree: RedBlackTree<T>, node: Node<T>): void {
    const right = node.right
    if (! right) throw new Error('Cannot rotate left without a right child')

    node.right = right.left
    if (right.left) right.left.parent = node

    right.parent = node.parent
    if (! node.parent) tree.root = right
    else if (node === node.parent.left) node.parent.left = right
    else node.parent.right = right

    right.left = node
    node.parent = right
}

function rotateRight<T> (tree: RedBlackTree<T>, node: Node<T>): void {
    const left = node.left
    if (! left) throw new Error('Cannot rotate right without a left child')

    node.left = left.right
    if (left.right) left.right.parent = node

    left.parent = node.parent
    if (! node.parent) tree.root = left
    else if (node === node.parent.right) node.parent.right = left
    else node.parent.left = left

    left.right = node
    node.parent = left
}

function fixInsert<T> (tree: RedBlackTree<T>, node: Node<T>): void {
    while (node.parent && node.parent.color === 'red') {
        const parent = node.parent
        const grandparent = parent.parent

        if (! grandparent) break

        if (parent === grandparent.left) {
            const uncle = grandparent.right
            if (uncle?.color === 'red') {
                parent.color = 'black'
                uncle.color = 'black'
                grandparent.color = 'red'
                node = grandparent
            } else {
                if (node === parent.right) {
                    node = parent
                    rotateLeft(tree, node)
                }
                parent.color = 'black'
                grandparent.color = 'red'
                rotateRight(tree, grandparent)
            }
        } else {
            const uncle = grandparent.left
            if (uncle?.color === 'red') {
                parent.color = 'black'
                uncle.color = 'black'
                grandparent.color = 'red'
                node = grandparent
            } else {
                if (node === parent.left) {
                    node = parent
                    rotateRight(tree, node)
                }
                parent.color = 'black'
                grandparent.color = 'red'
                rotateLeft(tree, grandparent)
            }
        }
    }

    if (tree.root) {
        tree.root.color = 'black'
    }
}

export function insert<T> (tree: RedBlackTree<T>, value: T): void {
    const newNode = createNode(value, 'red')
    if (! tree.root) {
        tree.root = newNode
        newNode.color = 'black'
        return
    }

    let current = tree.root
    while (true) {
        if (value < current.value) {
            if (! current.left) {
                current.left = newNode
                newNode.parent = current
                break
            }
            current = current.left
        } else {
            if (! current.right) {
                current.right = newNode
                newNode.parent = current
                break
            }
            current = current.right
        }
    }

    fixInsert(tree, newNode)
}

export function find<T> (tree: RedBlackTree<T>, value: T): Node<T> | null {
    let current = tree.root
    while (current) {
        if (value === current.value) return current
        current = value < current.value ? current.left : current.right
    }
    return null
}

export function inorderTraversal<T> (tree: RedBlackTree<T>, node: Node<T> | null, callback: (node: Node<T>) => void): void {
    if (node) {
        inorderTraversal(tree, node.left, callback)
        callback(node)
        inorderTraversal(tree, node.right, callback)
    }
}

export function toArray<T> (tree: RedBlackTree<T>): T[] {
    const result: T[] = []
    if (tree.root) {
        inorderTraversal(tree, tree.root, node => result.push(node.value))
    }
    return result
}
