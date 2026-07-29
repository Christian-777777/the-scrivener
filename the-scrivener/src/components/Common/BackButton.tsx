// ========================================
// 返回按钮 - 回到上一个页面
// ========================================

import { memo } from 'react'
import { useAppStore } from '@/store/useAppStore'

export const BackButton = memo(function BackButton({ label = '← 返回' }: { label?: string }) {
  const goBack = useAppStore((s) => s.goBack)
  const canGoBack = useAppStore((s) => s.canGoBack)

  if (!canGoBack()) return null

  return (
    <button className="btn" onClick={goBack} style={{ marginBottom: '16px' }}>
      {label}
    </button>
  )
})
