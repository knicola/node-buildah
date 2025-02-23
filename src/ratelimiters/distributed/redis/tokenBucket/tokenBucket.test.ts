import { describe, it, expect, beforeAll } from 'vitest'
import Redis from 'ioredis'
import { RedisTokenBucketPolicy } from './tokenBucket'
import { randomString } from '@/utilities/utilities'

const getSubject = () => `TokenBucket:${randomString()}`

describe('RedisTokenBucketPolicy', () => {
    let redis: Redis
    let policy: RedisTokenBucketPolicy

    beforeAll(async () => {
        redis = new Redis()

        policy = new RedisTokenBucketPolicy({
            client: redis.duplicate(),
            capacity: 10,
            interval: 60e3,
            weight: 2,
            refill: 6,
        })

        await policy.setup()
    })

    describe('consume', () => {
        it('should successfully consume tokens within capacity', async () => {
            const subject = getSubject()

            let timestamp = 0
            let remaining = await policy.consume(subject, 2, timestamp)
            expect(remaining).toBe(8)

            timestamp += 10e3
            remaining = await policy.consume(subject, 2, timestamp)
            expect(remaining).toBe(7)

            timestamp += 30e3
            remaining = await policy.consume(subject, 2, timestamp)
            expect(remaining).toBe(8)
        })

        it('should return -1 when exceeding capacity', async () => {
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

        it('should not exceed maximum capacity when refilling', async () => {
            const subject = getSubject()

            let timestamp = 0
            await policy.consume(subject, 4, timestamp)

            timestamp += 120e3
            const remaining = await policy.consume(subject, 2, timestamp)

            expect(remaining).toBe(8)
        })

        it('should deny requests when not enough tokens available', async () => {
            const subject = getSubject()

            let timestamp = 0
            await policy.consume(subject, 8, timestamp)

            timestamp += 5e3
            const remaining = await policy.consume(subject, 4, timestamp)

            expect(remaining).toBe(-1)
        })
    })
})
