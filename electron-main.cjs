const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

let win

function getIconPath() {
  const candidates = [
    path.join(process.resourcesPath, '..', 'assets', 'icon.ico'),
    path.join(path.dirname(app.getPath('exe')), 'assets', 'icon.ico'),
    path.join(__dirname, 'assets', 'icon.ico'),
    path.join(__dirname, 'assets', 'icon.png'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return undefined
}

function createWindow() {
  const iconPath = getIconPath()

  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    backgroundColor: '#2c1810',
    title: '世界OC编辑器',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs'),
    },
  })

  const distPath = path.join(__dirname, 'dist', 'index.html')
  win.loadFile(distPath)

  win.on('page-title-updated', (e) => e.preventDefault())

  // 最大化/还原时通知渲染进程
  win.on('maximize', () => win.webContents.send('window-maximized', true))
  win.on('unmaximize', () => win.webContents.send('window-maximized', false))

  win.on('closed', () => { win = null })
}

// ==== IPC: 窗口控制 ====
app.whenReady().then(() => {
  app.setName('世界OC编辑器')

  ipcMain.on('window-minimize', () => win?.minimize())
  ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })
  ipcMain.on('window-close', () => win?.close())

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (!win) createWindow()
})

// 禁止多开
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}
