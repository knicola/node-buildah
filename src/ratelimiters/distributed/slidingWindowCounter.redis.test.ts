import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Redis from 'ioredis'
import { RedisSlidingWindowCounterPolicy } from './slidingWindowCounter.redis'
import { randomString } from '@/utilities/utilities'

const getSubject = () => `SlidingWindowCounter:${randomString()}`

describe('RedisSlidingWindowCounterPolicy', () => {
    let redis: Redis
    let policy: RedisSlidingWindowCounterPolicy

    beforeAll(async () => {
        redis = new Redis()

        policy = new RedisSlidingWindowCounterPolicy({
            client: redis.duplicate(),
            capacity: 10,
            interval: 60e3,
            weight: 2,
        })
        // @todo write test case
        await policy.setup()
    })

    afterAll(async () => {
        await redis.quit()
    })

    describe('check', () => {
        it('should successfully limit within the capacity of the sliding window', async () => {
            const subject = getSubject()

            let timestamp = 0
            let remaining = await policy.check(subject, 2, timestamp)
            expect(remaining).toBe(8)

            timestamp += 10e3
            remaining = await policy.check(subject, 2, timestamp)
            expect(remaining).toBe(6)

            timestamp += 20e3
            remaining = await policy.check(subject, 2, timestamp)
            expect(remaining).toBe(5)
        })

        it('should return -1 when exceeding capacity of the sliding window', async () => {
            const subject = getSubject()
            const remaining = await policy.check(subject, 12)
            expect(remaining).toBe(-1)
        })

        it('should expire the key after the interval', async () => {
            const subject = getSubject()

            await policy.check(subject)
            const ttl = await redis.pttl(subject)

            expect(ttl).toBeGreaterThan(0)
            expect(ttl).toBeLessThanOrEqual(60e3)
        })
    })
})
