// Generate PWA icons from a brutalist SVG source. Run with: node scripts/gen-pwa-icons.mjs
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

// Brand square: near-black background, bold white "TGI" mark with brutalist offset.
const makeSvg = (size, { maskable = false } = {}) => {
  const safe = maskable ? size * 0.8 : size // maskable needs ~20% safe-zone padding
  const pad = (size - safe) / 2
  const fontSize = Math.round(safe * 0.28)
  const offset = Math.max(2, Math.round(safe * 0.015))
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#111111"/>
  <g transform="translate(${pad}, ${pad})">
    <rect x="${safe * 0.08}" y="${safe * 0.08}" width="${safe * 0.84}" height="${safe * 0.84}" fill="none" stroke="#FAF9F6" stroke-width="${Math.max(2, safe * 0.02)}"/>
    <rect x="${safe * 0.08 + offset}" y="${safe * 0.08 + offset}" width="${safe * 0.84}" height="${safe * 0.84}" fill="none" stroke="#4B4DED" stroke-width="${Math.max(1, safe * 0.01)}"/>
    <text x="${safe / 2}" y="${safe / 2}" font-family="Space Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="#FAF9F6" text-anchor="middle" dominant-baseline="central" letter-spacing="-2">TGI</text>
    <text x="${safe / 2}" y="${safe / 2 + fontSize * 0.75}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${Math.round(fontSize * 0.25)}" fill="#4B4DED" text-anchor="middle" dominant-baseline="central" letter-spacing="3">BRAIN</text>
  </g>
</svg>`
}

const targets = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
]

for (const t of targets) {
  const svg = makeSvg(t.size, { maskable: !!t.maskable })
  const out = resolve(outDir, t.name)
  await sharp(Buffer.from(svg)).png().toFile(out)
  console.log('wrote', t.name)
}

// SVG source kept in public for browsers that prefer it
writeFileSync(resolve(outDir, 'pwa-icon.svg'), makeSvg(512))
console.log('wrote pwa-icon.svg')
