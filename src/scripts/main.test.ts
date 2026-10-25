import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('main.ts', () => {
    const originalAlert = global.alert

    beforeEach(() => {
        global.alert = vi.fn()
    })

    afterEach(() => {
        global.alert = originalAlert
        vi.restoreAllMocks()
    })

    it('should call alert with the correct message', async () => {
        await import('./main.ts')
        expect(global.alert).toHaveBeenCalledWith('./src/scripts.js works')
    })
})
