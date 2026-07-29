// ========================================
// 书页 - 单页内容容器（左/右/统一页）
// ========================================

import { ReactNode } from 'react'

interface BookPageProps {
  children: ReactNode
  side: 'left' | 'right' | 'unified'
}

export function BookPage({ children, side }: BookPageProps) {
  const isLeft = side === 'left'

  if (side === 'unified') {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto', overflowX: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto', overflowX: 'hidden',
        }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: '1 1 50%', minWidth:0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: isLeft
        ? 'linear-gradient(135deg, #f5e6c8 0%, #f0ddb8 50%, #e8d5b7 100%)'
        : 'linear-gradient(225deg, #f5e6c8 0%, #f0ddb8 50%, #e8d5b7 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 纸张纹理 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 105, 20, 0.02) 2px,
            rgba(139, 105, 20, 0.02) 4px
          )
        `,
        pointerEvents: 'none',
      }} />

      {/* 页面阴影（靠近书脊的一侧） */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [isLeft ? 'right' : 'left']: 0,
        width: '30px',
        background: isLeft
          ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.04))'
          : 'linear-gradient(270deg, transparent, rgba(0,0,0,0.04))',
        pointerEvents: 'none',
      }} />

      {/* 页面内容 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--book-padding)',
        overflowY: 'auto', overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* 页码 */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        [isLeft ? 'left' : 'right']: '24px',
        fontSize: '11px',
        color: 'var(--color-text-muted)',

        pointerEvents: 'none',
      }}>
      </div>
    </div>
  )
}
