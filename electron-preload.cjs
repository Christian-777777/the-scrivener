// ========================================
// Electron preload — 安全暴露窗口控制 API
// ========================================

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // 监听最大化状态变化（同步给 TitleBar 更新图标）
  onMaximizeChange: (cb) => {
    ipcRenderer.on('window-maximized', (_e, val) => cb(val))
  },
})
