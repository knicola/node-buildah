const MILLISECONDS_IN_SECOND = 1000
const SECONDS_IN_MINUTE = 60
const MINUTES_IN_HOUR = 60
const HOURS_IN_DAY = 24

export class Duration {
    constructor (public readonly value: number) {
        if (! Number.isFinite(value)) {
            throw new Error('Duration value must be a finite number.')
        }
    }

    // #region Factory methods
    public static fromSeconds (seconds: number): Duration {
        return new Duration(seconds * MILLISECONDS_IN_SECOND)
    }

    public static fromMinutes (minutes: number): Duration {
        return Duration.fromSeconds(minutes * SECONDS_IN_MINUTE)
    }

    public static fromHours (hours: number): Duration {
        return Duration.fromMinutes(hours * MINUTES_IN_HOUR)
    }

    public static fromDays (days: number): Duration {
        return Duration.fromHours(days * HOURS_IN_DAY)
    }
    // #endregion

    // #region Conversion methods
    public toMilliseconds (): number {
        return this.value
    }

    public toSeconds (): number {
        return this.value / MILLISECONDS_IN_SECOND
    }

    public toMinutes (): number {
        return this.toSeconds() / SECONDS_IN_MINUTE
    }

    public toHours (): number {
        return this.toMinutes() / MINUTES_IN_HOUR
    }

    public toDays (): number {
        return this.toHours() / HOURS_IN_DAY
    }
    // #endregion

    // #region Getters
    public get milliseconds (): number {
        return this.value % MILLISECONDS_IN_SECOND
    }

    public get seconds (): number {
        return Math.floor(this.toSeconds()) % SECONDS_IN_MINUTE
    }

    public get minutes (): number {
        return Math.floor(this.toMinutes()) % MINUTES_IN_HOUR
    }

    public get hours (): number {
        return Math.floor(this.toHours()) % HOURS_IN_DAY
    }

    public get days (): number {
        return Math.floor(this.toDays())
    }
    // #endregion

    // #region Arithmetic operations
    public add (duration: Duration): Duration {
        return new Duration(this.value + duration.value)
    }

    public subtract (duration: Duration): Duration {
        return new Duration(this.value - duration.value)
    }

    public multiply (factor: number): Duration {
        return new Duration(this.value * factor)
    }

    public divide (divisor: number): Duration {
        return new Duration(this.value / divisor)
    }
    // #endregion

    // #region Primitive representation
    public toString (): string {
        const days = Math.floor(this.toDays())
        const hours = Math.floor(this.toHours()) % HOURS_IN_DAY
        const minutes = Math.floor(this.toMinutes()) % MINUTES_IN_HOUR
        const seconds = Math.floor(this.toSeconds()) % SECONDS_IN_MINUTE
        const milliseconds = this.value % MILLISECONDS_IN_SECOND

        return `${days}d ${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`
    }

    public [Symbol.toPrimitive] (hint: string): string | number {
        if (hint === 'string') {
            return this.toString()
        }
        return this.value
    }
    // #endregion
}
