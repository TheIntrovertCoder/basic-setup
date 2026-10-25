import { render } from 'pug'
import * as sass from 'sass'

const PORT = 3000

Bun.serve({
    port: PORT,
    async fetch(req) {
        const path = new URL(req.url).pathname

        // html
        if (path === '/' || path === '/index.html') {
            const src = await Bun.file('src/index.pug').text()
            const html = render(src, { pretty: true })
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' }
            })
        }

        // css
        if (path === '/dist/main.css') {
            const result = sass.compile('src/styles/main.sass')
            return new Response(result.css, {
                headers: {
                    'Content-Type': 'text/css'
                }
            })
        }

        // js
        if (path === '/dist/main.js') {
            const built = await Bun.build({
                entrypoints: ['src/scripts/main.ts'],
                format: 'iife',
                naming: '[dir]/[name].[ext]'
            })

            if (!built.success || !built.outputs[0]) {
                return new Response(
                    built.logs.map((l) => l.message).join('\n'),
                    {
                        status: 500,
                        headers: { 'Content-Type': 'text/plain' }
                    }
                )
            }

            return new Response(built.outputs[0]!)
        }

        return new Response('Not Found', { status: 404 })
    }
})

console.info(`Live server - http://localhost:${PORT}`)
