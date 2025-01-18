/**
 * @class AbortError
 * @classdesc An error that is thrown when an operation is aborted
 * @extends Error
 * @example
 * throw new AbortError('The operation was aborted')
 */
export class AbortError extends Error {
    public message = 'The operation was aborted'
}

/**
 * Delays for a given number of milliseconds
 *
 * @param ms The number of milliseconds to delay
 * @param signal The {@link !AbortSignal} to listen to for abort events
 * @returns A promise that resolves when the delay is over
 * @throws {@link AbortError} if the operation was aborted
 * @example
 * await delay(1000)
 * @example
 * const ac = new AbortController()
 * await delay(1000, ac.signal)
 * ac.abort()
 */
export async function delay (ms: number, signal?: AbortSignal): Promise<void> {
    return await new Promise((resolve, reject) => {
        if (signal?.aborted) {
            return reject(new AbortError())
        }

        const listener = (): any => {
            clearTimeout(t)
            reject(new AbortError())
        }

        signal?.addEventListener('abort', listener, { once: true })

        const t = setTimeout(() => {
            signal?.removeEventListener('abort', listener)
            resolve()
        }, ms)
    })
} // delay()
