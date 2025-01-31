export type DictionaryKey = string | number | symbol
export interface DictionaryIterator<T> extends MapIterator<T> {}
export class Dictionary<K extends DictionaryKey, V> extends Map<K, V> {
    public [Symbol.toStringTag]: string = 'Dictionary'
}
