/**
 * Check if a value is null or undefined
 * @param value The value to check
 * @returns True if the value is null or undefined, otherwise false
 */
export function isNil (value: any): boolean {
    return value === null || value === undefined
}

/**
 * Check if a value is null, undefined, or NaN
 * @param value The value to check
 * @returns True if the value is null, undefined, or NaN, otherwise false
 */
export function isNilOrNaN (value: any): value is null | undefined | typeof NaN {
    return value === null || value === undefined || isNaN(value)
}

/**
 * Create an array from a value or array of values
 * @remarks
 * - If the value is null, undefined, or NaN, it is skipped
 * - If the value is an array, it is added to the result array as-is
 * - Otherwise, the value is added to the result array
 * @param value The value or array of values
 * @returns An array of values
 */
export function array<T> (...values: Array<T | T[] | undefined | null>): Array<T | T[]> {
    const result: Array<T | T[]> = []
    for (const value of values) {
        if (value !== null && value !== undefined) {
            result.push(value)
        }
    }
    return result
}

/**
 * Create a flat array from a value or array of values
 * @remarks
 * - If the value is null, undefined, or NaN, an empty array is returned
 * - If the value is an array, null, undefined, and NaN values are filtered out
 * - Otherwise, the value is wrapped in an array
 * @param value The value or array of values
 * @returns A flat array of values
 */
export function flatArray<T> (...values: Array<T | T[] | undefined | null>): T[] {
    const result: T[] = []
    for (const value of values) {
        if (Array.isArray(value)) {
            for (const v of value) {
                if (v !== null && v !== undefined) {
                    result.push(v)
                }
            }
        } else if (value !== null && value !== undefined) {
            result.push(value)
        }
    }
    return result
} // array()

/**
 * Ensure a value is an object
 * @param value The value to check
 * @returns The value if it is an object, otherwise an empty object
 */
export function object (value?: any): Record<string | symbol, any> {
    return value && typeof value === 'object' && ! Array.isArray(value) ? value : Object.create(null)
}
