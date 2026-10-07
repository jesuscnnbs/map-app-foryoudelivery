import { copyFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'dist')
const index = join(dist, 'index.html')
const fallback = join(dist, '404.html')

try {
  await access(index)
} catch {
  console.error('postbuild: no se encontró dist/index.html. ¿Se ejecutó "vite build"?')
  process.exit(1)
}

await copyFile(index, fallback)
console.log('postbuild: dist/404.html generado para SPA en GitHub Pages.')
