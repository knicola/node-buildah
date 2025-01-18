/* eslint-disable @typescript-eslint/no-unused-expressions */

import { FixedWindowCounterPolicy } from '../policies/fixedWindowCounter'
import { MemoryStore } from '../stores/memory.store'

const policy = new FixedWindowCounterPolicy({
    capacity: 10,
    interval: 1000,
    store: new MemoryStore(),
})

const remaining = await policy.check('<user_id>', 2)

remaining >= 0 // allowed
remaining <= -1 // denied
