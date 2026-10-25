import { describe, it, expect } from 'vitest'

const isBunEnv = typeof Bun !== 'undefined'

const serveCss = isBunEnv ? (await import('./dev.ts')).serveCss : null
const serveHtml = isBunEnv ? (await import('./dev.ts')).serveHtml : null
const serveJs = isBunEnv ? (await import('./dev.ts')).serveJs : null

describe('dev.ts - server functions', () => {
    describe('serveCss', () => {
        it('should return CSS response', async () => {
            if (!serveCss) return
            const response = await serveCss()

            expect(response.status).toBe(200)
            expect(response.headers.get('Content-Type')).toBe('text/css')
            expect(response.headers.get('Cache-Control')).toBe('no-store')

            const css = await response.text()
            expect(css).toContain('color-scheme')
            expect(css).toContain('box-sizing')
        })
    })

    if (isBunEnv) {
        describe('serveHtml', () => {
            it('should return HTML response with HMR client injected', async () => {
                const response = await serveHtml!()

                expect(response.status).toBe(200)
                expect(response.headers.get('Content-Type')).toBe('text/html')
                expect(response.headers.get('Cache-Control')).toBe('no-store')

                const html = await response.text()
                expect(html).toContain('<!DOCTYPE html>')
                expect(html).toContain('Hello World')
                expect(html).toContain('WebSocket')
            })
        })

        describe('serveJs', () => {
            it('should return JavaScript response', async () => {
                const response = await serveJs!()

                expect(response.status).toBe(200)
                expect(response.headers.get('Content-Type')).toBe(
                    'text/javascript'
                )
                expect(response.headers.get('Cache-Control')).toBe('no-store')

                const js = await response.text()
                expect(js).toContain("alert('./src/scripts.js works')")
            })
        })
    }
})
