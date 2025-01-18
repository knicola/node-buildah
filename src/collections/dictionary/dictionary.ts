export type PropertyKey = string | number | symbol
export interface DictionaryIterator<T> extends MapIterator<T> {}
export class Dictionary<K extends PropertyKey, V> extends Map<K, V> {
    public [Symbol.toStringTag]: string = 'Dictionary'
}
