import { describe, it, expect, beforeAll } from 'vitest'
import Redis from 'ioredis'
import { RedisSlidingWindowLogPolicy } from './slidingWindowLog'
import { randomString } from '@/utilities/utilities'

const getSubject = () => `SlidingWindowLog:${randomString()}`

describe('RedisSlidingWindowLogPolicy', () => {
    let redis: Redis
    let policy: RedisSlidingWindowLogPolicy

    beforeAll(async () => {
        redis = new Redis()

        policy = new RedisSlidingWindowLogPolicy({
            client: redis.duplicate(),
            capacity: 10,
            interval: 60e3,
            weight: 2,
        })

        await policy.setup()
    })

    describe('consume', () => {
        it('should successfully limit within the capacity of the sliding window', async () => {
            const subject = getSubject()

            let timestamp = 0
            let remaining = await policy.consume(subject, 2, timestamp)
            expect(remaining).toBe(8)

            timestamp += 10e3
            remaining = await policy.consume(subject, 2, timestamp)
            expect(remaining).toBe(6)

            timestamp += 20e3
            remaining = await policy.consume(subject, 2, timestamp)
            expect(remaining).toBe(4)
        })

        it('should return -1 when exceeding capacity of the sliding window', async () => {
            const subject = getSubject()
            const remaining = await policy.consume(subject, 12)
            expect(remaining).toBe(-1)
        })

        it('should expire the key after the interval', async () => {
            const subject = getSubject()

            await policy.consume(subject)
            const ttl = await redis.pttl(subject)

            expect(ttl).toBeGreaterThan(0)
            expect(ttl).toBeLessThanOrEqual(60e3)
        })

        it('should remove old logs from the sliding window', async () => {
            const subject = getSubject()

            await policy.consume(subject, 2, 10e3)
            await policy.consume(subject, 2, 20e3)
            await policy.consume(subject, 2, 40e3)
            await policy.consume(subject, 2, 60e3)
            await policy.consume(subject, 2, 80e3)
            const entries = await redis.zrange(subject, 0, -1)

            expect(entries).toEqual([
                '40000:2',
                '60000:2',
                '80000:2',
            ])
        })
    })
})
