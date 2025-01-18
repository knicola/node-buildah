import type { RateLimiterPolicy } from './policy'

type _internal = Required<RateLimiterPolicy>

export function defineRateLimiter (policies: RateLimiterPolicy[]) {
    const setupQueue: Array<_internal['setup']> = []
    const applyQueue: Array<_internal['check']> = []
    const teardownQueue: Array<_internal['teardown']> = []

    policies.forEach((policy) => {
        if (policy.setup) { setupQueue.push(policy.setup) }
        if (policy.check) { applyQueue.push(policy.check) }
        if (policy.teardown) { teardownQueue.push(policy.teardown) }
    })

    async function setup () {
        return await Promise.all(setupQueue.map(async fn => await fn()))
    }
    async function apply (subject: string, weight?: number) {
        return await Promise.all(applyQueue.map(async fn => await fn(subject, weight)))
    }
    async function teardown () {
        return await Promise.all(teardownQueue.map(async fn => await fn()))
    }

    return { setup, apply, teardown }
}
