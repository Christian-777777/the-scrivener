// ========================================
// 发布整理脚本 — 把打包产物复制到干净的发布文件夹
// ========================================

const path = require('path')
const fs = require('fs')

const root = path.join(__dirname, '..')
const src = path.join(root, 'release', 'win-unpacked')
const dest = path.join(root, 'release', '世界OC编辑器')

// 清理旧的发布文件夹
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true })
}
fs.mkdirSync(dest, { recursive: true })

// 复制整个 win-unpacked
copyRecursive(src, dest)

// 清理不需要分发的文件
const toRemove = [
  'LICENSE.electron.txt',
  'LICENSES.chromium.html',  // 9MB 的 Chromium 授权文件，终端用户不需要
]

for (const f of toRemove) {
  const fp = path.join(dest, f)
  if (fs.existsSync(fp)) fs.unlinkSync(fp)
}

// locales 只保留中文
const localesDir = path.join(dest, 'locales')
if (fs.existsSync(localesDir)) {
  const keep = ['zh-CN.pak', 'en-US.pak']
  for (const f of fs.readdirSync(localesDir)) {
    if (!keep.includes(f)) {
      fs.unlinkSync(path.join(localesDir, f))
    }
  }
}

// 计算大小
const totalSize = getDirSize(dest)
console.log(`✓ 发布文件夹已创建: release\\世界oc编辑器\\`)
console.log(`  大小: ${(totalSize / 1024 / 1024).toFixed(1)} MB`)
console.log(`  直接把这个文件夹发给别人，双击 世界OC编辑器.exe 即可运行`)

// ===== 工具函数 =====

function copyRecursive(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function getDirSize(dir) {
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      total += getDirSize(fp)
    } else {
      total += fs.statSync(fp).size
    }
  }
  return total
}
