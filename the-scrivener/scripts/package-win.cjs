// ========================================
// Windows 打包脚本
// 解决 electron-builder 的 winCodeSign symlink 权限问题
// ========================================

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

async function main() {
  const root = path.join(__dirname, '..')
  const exePath = path.join(root, 'release', 'win-unpacked', '世界OC编辑器.exe')
  const icoPath = path.join(root, 'assets', 'icon.ico')

  // ===== 第 1 步: 编译 + 打包到文件夹 =====
  console.log('=== 第 1 步: 打包 ===')

  try {
    execSync('npx electron-builder --dir', {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' },
    })
  } catch {
    console.log('(electron-builder winCodeSign 下载跳过，这是预期的)')
  }

  if (!fs.existsSync(exePath)) {
    console.error('错误: exe 未生成 —', exePath)
    process.exit(1)
  }

  console.log('✓ exe 已生成')

  // ===== 第 2 步: 用 rcedit 嵌入图标 =====
  console.log('=== 第 2 步: 嵌入图标 ===')

  const rcedit = require('rcedit')
  await rcedit(exePath, { icon: icoPath })
  console.log('✓ 图标已嵌入')

  // ===== 总结 =====
  const sizeMB = (fs.statSync(exePath).size / (1024 * 1024)).toFixed(1)
  console.log(`\n=== 打包完成 ===`)
  console.log(`产物: release\\win-unpacked\\世界OC编辑器.exe`)
  console.log(`大小: ${sizeMB} MB`)
  console.log(`把这个 exe 复制到任意文件夹，双击即可运行`)
}

main().catch((e) => {
  console.error('打包失败:', e.message)
  process.exit(1)
})
