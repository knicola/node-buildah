/**
 * Create an array from a value or array of values
 * @remarks
 * This function is useful when you want to ensure that a value is an array.
 * If the value is already an array, it will be returned as is. If the value
 * is not an array, it will be wrapped in an array.
 * @param input The value or array of values
 * @returns An array of values
 */
export function array<I> (input: I | I[]): Array<NonNullable<I>> {
    return ([] as I[]).concat(input ?? []) as any
}
