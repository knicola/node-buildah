/**
 * The options for the xbackoff computation
 */
export interface XBackoffOptions {
    /**
     * The exponential factor to use
     * @default 2
     * @minimum 1
     */
    factor?: number
    /**
     * The minimum timeout in milliseconds
     * @default 1000
     * @minimum 1
     */
    minTimeout?: number
    /**
     * The maximum timeout in milliseconds
     * @default 60000
     * @minimum 1
     */
    maxTimeout?: number
    /**
     * Whether to randomize the timeout
     * @default false
     */
    randomize?: boolean
}

type Options = Required<XBackoffOptions>

/**
 * The xbackoff function
 * @param attempt - The number of attempts (defaults to 0)
 * @returns The timeout in milliseconds
 */
export type XBackoff = (attempt: number) => number

/**
 * The default options
 * @internal
 */
const defaults: Options = {
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 60e3,
    randomize: false,
}

/**
 * Computes the timeout for the given attempt
 * @param attempt The number of attempts
 * @param options The options
 */
export function compute (attempt: number, options?: XBackoffOptions): number {
    const opts = { ...defaults, ...options }
    const spread = opts.randomize ? Math.random() + 1 : 1
    const timeout = Math.round(spread * opts.minTimeout * Math.pow(opts.factor, attempt))
    return Math.min(timeout, opts.maxTimeout)
} // compute()

/**
 * Asserts that the options are valid
 * @param options The options
 * @internal
 * @throws {TypeError} If the options are invalid
 */
export function assertOptions (options: Options): asserts options is Options {
    if ((options.minTimeout || 0) < 1) {
        throw new TypeError('Options.minTimeout must be a positive integer')
    }
    if ((options.maxTimeout || 0) < 1) {
        throw new TypeError('Options.maxTimeout must be a positive integer')
    }
    if (options.minTimeout && options.maxTimeout && options.minTimeout > options.maxTimeout) {
        throw new TypeError('Options.minTimeout must be less than or equal to maxTimeout')
    }
    if ((options.factor || 0) < 1) {
        throw new TypeError('Options.factor must be a positive integer')
    }
} // assertOptions()

/**
 * Creates an xbackoff function
 * @param options The xbackoff options
 * @returns The xbackoff function
 * @example
 * const getTimeout = xbackoff()
 * getTimeout(0) // 1000
 * getTimeout(1) // 2000
 * getTimeout(2) // 4000
 */
export function xbackoff (options?: XBackoffOptions): XBackoff {
    const opts = { ...defaults, ...options }
    assertOptions(opts)
    return (attempt: number): number => compute(attempt, opts)
} // xbackoff()
