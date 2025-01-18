import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    test: {
        environment: 'node',
        root: fileURLToPath(new URL('./', import.meta.url)),
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
