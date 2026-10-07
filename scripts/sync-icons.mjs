import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, extname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const srcDir = join(root, 'src', 'assets')
const publicDir = join(root, 'public')

await mkdir(publicDir, { recursive: true })
const files = await readdir(srcDir)
const svgs = files.filter((file) => extname(file).toLowerCase() === '.svg')

for (const file of svgs) {
  await copyFile(join(srcDir, file), join(publicDir, file))
}

console.log(`sync-icons: ${svgs.length} SVG(s) copiados de src/assets a public/.`)
