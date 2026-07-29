// ========================================
// 图标生成脚本 — SVG → PNG + ICO
// 用法: node scripts/generate-icon.cjs
// ========================================

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SVG_PATH = path.join(__dirname, '..', 'assets', 'icon.svg')
const OUT_DIR = path.join(__dirname, '..', 'assets')

async function main() {
  // 生成 256x256 PNG（用于 electron-builder Windows/macOS）
  await sharp(SVG_PATH)
    .resize(256, 256)
    .png()
    .toFile(path.join(OUT_DIR, 'icon.png'))

  // 生成 512x512 PNG（用于 macOS）
  await sharp(SVG_PATH)
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT_DIR, 'icon-512.png'))

  // 生成 ICO（256px PNG 即可被 Windows 识别）
  const png256 = await sharp(SVG_PATH)
    .resize(256, 256)
    .png()
    .toBuffer()

  // 手动构建 ICO 文件（PNG 格式条目）
  const ico = buildIco([{ width: 256, height: 256, png: png256 }])
  fs.writeFileSync(path.join(OUT_DIR, 'icon.ico'), ico)

  console.log('✓ icon.png (256x256)')
  console.log('✓ icon-512.png (512x512)')
  console.log('✓ icon.ico')
}

// 简易 ICO 构建器
function buildIco(entries) {
  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = headerSize + entries.length * dirEntrySize

  let imageDataOffset = dirSize
  const imageDatas = []

  for (const entry of entries) {
    imageDatas.push({ offset: imageDataOffset, data: entry.png })
    imageDataOffset += entry.png.length
  }

  // ICO 头部
  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)    // reserved
  header.writeUInt16LE(1, 2)    // ICO type
  header.writeUInt16LE(entries.length, 4) // count

  // 目录项
  const dirs = Buffer.alloc(entries.length * dirEntrySize)
  for (let i = 0; i < entries.length; i++) {
    const off = i * dirEntrySize
    const w = entries[i].width >= 256 ? 0 : entries[i].width
    const h = entries[i].height >= 256 ? 0 : entries[i].height
    dirs.writeUInt8(w, off)
    dirs.writeUInt8(h, off + 1)
    dirs.writeUInt8(0, off + 2)  // palette
    dirs.writeUInt8(0, off + 3)  // reserved
    dirs.writeUInt16LE(0, off + 4)  // color planes
    dirs.writeUInt16LE(0, off + 6)  // bpp
    dirs.writeUInt32LE(imageDatas[i].data.length, off + 8)  // size
    dirs.writeUInt32LE(imageDatas[i].offset, off + 12)
  }

  return Buffer.concat([header, dirs, ...imageDatas.map(d => d.data)])
}

main().catch((e) => {
  console.error('图标生成失败:', e.message)
  process.exit(1)
})
