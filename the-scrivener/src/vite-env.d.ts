/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    minimize: () => void
    maximize: () => void
    close: () => void
    onMaximizeChange: (cb: (maximized: boolean) => void) => void
  }
}
