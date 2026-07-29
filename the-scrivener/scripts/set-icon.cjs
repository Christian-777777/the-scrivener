// ========================================
// 用 rcedit 给 exe 嵌入应用图标
// ========================================

const path = require('path')
const fs = require('fs')

const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', '世界OC编辑器.exe')
const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico')

if (!fs.existsSync(exePath)) {
  console.error('错误: exe 不存在 —', exePath)
  process.exit(1)
}
if (!fs.existsSync(icoPath)) {
  console.error('错误: ico 不存在 —', icoPath)
  process.exit(1)
}

const rcedit = require('rcedit')

rcedit(exePath, { icon: icoPath })
  .then(() => console.log('✓ exe 图标已嵌入'))
  .catch((e) => {
    console.error('图标嵌入失败:', e.message)
    process.exit(1)
  })
