import { mkdirSync } from 'node:fs'
import { render } from 'pug'
import * as sass from 'sass'

try {
    mkdirSync('dist', { recursive: true })

    // Pug -> index.html
    // Creates index.html in root of the project
    const html = render(await Bun.file('src/index.pug').text(), {
        pretty: true
    })
    await Bun.write('./index.html', html)

    // Sass -> styles.css
    // Creates styles.css in root/dist
    const css = sass.compile('src/styles/main.sass')
    await Bun.write('dist/main.css', css.css)

    // ts -> scripts.js
    // Creates scripts.js in root/dist
    const result = await Bun.build({
        entrypoints: ['src/scripts/main.ts'],
        outdir: 'dist',
        naming: 'main.js',
        minify: true
    })

    if (!result.success) {
        console.error(result.logs)
        process.exit(1)
    }

    console.info(
        '✅ build.ts: Built index.html, dist/styles.css and dist/scripts.js'
    )
} catch (err) {
    console.error(`❎ build.ts: build failed:`, err)
}
