import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Redis from 'ioredis'
import { RedisFixedWindowCounterPolicy } from './fixedWindowCounter.redis'
import { randomString } from '@/utilities/utilities'

const getSubject = () => `FixedWindowCounter:${randomString()}`

describe('RedisFixedWindowCounterPolicy', () => {
    let redis: Redis
    let policy: RedisFixedWindowCounterPolicy

    beforeAll(async () => {
        redis = new Redis()
        policy = new RedisFixedWindowCounterPolicy({
            client: redis,
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
        it('should successfully limit within the capacity of the fixed window', async () => {
            const subject = getSubject()

            let remaining = await policy.check(subject)
            expect(remaining).toBe(8)

            remaining = await policy.check(subject)
            expect(remaining).toBe(6)
        })

        it('should return -1 when exceeding capacity of the fixed window', async () => {
            const subject = getSubject()

            await policy.check(subject)
            await policy.check(subject)
            await policy.check(subject)
            await policy.check(subject)
            await policy.check(subject)
            const remaining = await policy.check(subject)

            expect(remaining).toBe(-1)
        })

        it('should expire the key after the interval', async () => {
            const subject = getSubject()

            await policy.check(subject)
            const ttl = await redis.ttl(subject)

            expect(ttl).toBeGreaterThan(0)
            expect(ttl).toBeLessThanOrEqual(60e3)
        })
    })
})
