import { describe, it, expect } from 'vitest'
import { Duration } from './duration' // Adjust the path as needed

describe('Duration Class', () => {
    describe('Factory Methods', () => {
        it('should create a Duration from seconds', () => {
            const duration = Duration.fromSeconds(60)
            expect(duration.toMilliseconds()).toBe(60000)
        })

        it('should create a Duration from minutes', () => {
            const duration = Duration.fromMinutes(2)
            expect(duration.toMilliseconds()).toBe(120000)
        })

        it('should create a Duration from hours', () => {
            const duration = Duration.fromHours(1)
            expect(duration.toMilliseconds()).toBe(3600000)
        })

        it('should create a Duration from days', () => {
            const duration = Duration.fromDays(1)
            expect(duration.toMilliseconds()).toBe(86400000)
        })
    })

    describe('Conversion Methods', () => {
        const duration = new Duration(90061000) // 1 day, 1 hour, 1 minute, 1 second, 0 ms

        it('should convert to milliseconds', () => {
            expect(duration.toMilliseconds()).toBe(90061000)
        })

        it('should convert to seconds', () => {
            expect(duration.toSeconds()).toBe(90061)
        })

        it('should convert to minutes', () => {
            expect(duration.toMinutes()).toBe(1501.0166666666667)
        })

        it('should convert to hours', () => {
            expect(duration.toHours()).toBe(25.016944444444444)
        })

        it('should convert to days', () => {
            expect(duration.toDays()).toBe(1.042372685185185)
        })
    })

    describe('Getters', () => {
        const duration = new Duration(90061000) // 1 day, 1 hour, 1 minute, 1 second, 0 ms

        it('should return correct milliseconds', () => {
            expect(duration.milliseconds).toBe(0)
        })

        it('should return correct seconds', () => {
            expect(duration.seconds).toBe(1)
        })

        it('should return correct minutes', () => {
            expect(duration.minutes).toBe(1)
        })

        it('should return correct hours', () => {
            expect(duration.hours).toBe(1)
        })

        it('should return correct days', () => {
            expect(duration.days).toBe(1)
        })
    })

    describe('Additional Utility Methods', () => {
        const duration1 = new Duration(60000) // 1 minute
        const duration2 = new Duration(30000) // 30 seconds

        it('should add durations', () => {
            const result = duration1.add(duration2)
            expect(result.toMilliseconds()).toBe(90000)
        })

        it('should subtract durations', () => {
            const result = duration1.subtract(duration2)
            expect(result.toMilliseconds()).toBe(30000)
        })

        it('should compare durations', () => {
            expect(duration1 > duration2).toBe(true)
            expect(duration1 < duration2).toBe(false)
            expect(duration1 >= duration2).toBe(true)
            expect(duration1 <= duration2).toBe(false)
            expect(duration1 === duration2).toBe(false)
        })
    })

    describe('String Representation', () => {
        const duration = new Duration(90061000) // 1 day, 1 hour, 1 minute, 1 second, 0 ms

        it('should return a string representation', () => {
            expect(duration.toString()).toBe('1d 1h 1m 1s 0ms')
        })

        it('should handle Symbol.toPrimitive for string hint', () => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            expect(`${duration}`).toBe('1d 1h 1m 1s 0ms')
        })

        it('should handle Symbol.toPrimitive for number hint', () => {
            expect(+duration).toBe(90061000)
        })
    })
})
