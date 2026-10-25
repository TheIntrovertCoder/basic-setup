import { render } from 'pug'
import * as sass from 'sass'
import chokidar from 'chokidar'

const PORT = 3000

const HMR_CLIENT = `<script>
(() => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(protocol + '//' + location.host + '/__hmr')

    ws.addEventListener('message', ({ data }) => {
        if (data === 'css') {
            document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
                const url = new URL(link.href)

                if (url.pathname === '/dist/main.css') {
                    url.searchParams.set('hmr', Date.now().toString())
                    link.href = url.toString()
                }
            })
        } else if (data === 'reload') {
            location.reload()
        }
    })
})()
</script>`

export async function serveHtml(): Promise<Response> {
    const src = Bun.file('src/index.pug')
    const pug = await src.text()
    const page = render(pug, { pretty: true })
    const html = page.includes('</body>')
        ? page.replace('</body>', `${HMR_CLIENT}</body>`)
        : page + HMR_CLIENT

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store'
        }
    })
}

export async function serveCss(): Promise<Response> {
    const result = sass.compile('src/styles/main.sass')
    return new Response(result.css, {
        headers: {
            'Content-Type': 'text/css',
            'Cache-Control': 'no-store'
        }
    })
}

export async function serveJs(): Promise<Response> {
    const built = await Bun.build({
        entrypoints: ['src/scripts/main.ts'],
        format: 'iife',
        naming: '[dir]/[name].[ext]'
    })

    if (!built.success || !built.outputs[0]) {
        return new Response(built.logs.map((log) => log.message).join('\n'), {
            status: 500,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-store'
            }
        })
    }

    return new Response(built.outputs[0], {
        headers: {
            'Content-Type': 'text/javascript',
            'Cache-Control': 'no-store'
        }
    })
}

function handleHmrUpgrade(
    req: Request,
    server: ReturnType<typeof Bun.serve>
): Response | null {
    const url = new URL(req.url)
    if (url.pathname === '/__hmr') {
        if (server.upgrade(req, { data: undefined })) return null
        return new Response('WebSocket upgrade failed', { status: 400 })
    }
    return null
}

function createServer() {
    const server = Bun.serve({
        port: PORT,

        fetch(req, server) {
            const upgradeResponse = handleHmrUpgrade(req, server)
            if (upgradeResponse) return upgradeResponse

            const url = new URL(req.url)

            if (url.pathname === '/' || url.pathname === '/index.html') {
                return serveHtml()
            }

            if (url.pathname === '/dist/main.css') {
                return serveCss()
            }

            if (url.pathname === '/dist/main.js') {
                return serveJs()
            }

            return new Response('Not Found', { status: 404 })
        },

        websocket: {
            open(ws) {
                ws.subscribe('hmr')
            }
        }
    })

    chokidar
        .watch(['src/index.pug', 'src/styles', 'src/scripts'], {
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 100 }
        })
        .on('all', (_event, path) => {
            const message = /\.(sass|scss)$/.test(path) ? 'css' : 'reload'
            server.publish('hmr', message)
            console.info(`HMR: ${path}`)
        })

    console.info(`Live server - http://localhost:${PORT}`)
    return server
}

if (import.meta.main) {
    createServer()
}

export { createServer }
