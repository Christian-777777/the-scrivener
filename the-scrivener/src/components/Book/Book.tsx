// ========================================
// 翻开的书本 - 双页布局 / 统一单页布局
// ========================================

import { Children, ReactNode, memo } from 'react'

interface BookProps {
  children: ReactNode
  animating: boolean
  unified?: boolean
}

export const Book = memo(function Book({ children, animating, unified }: BookProps) {
  const childArray = Children.toArray(children)
  const leftChild = childArray[0]
  const rightChild = childArray[1]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d0806 0%, #1a0f0a 50%, #0d0806 100%)',
      opacity: animating ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>
      <div style={{
        width: unified ? 'min(82vw, calc(90vh * 1.41))' : 'min(82vw, calc(90vh * 1.41))',
        height: 'min(58vw, 90vh)',
        display: 'flex',
        position: 'relative',
        background: unified
          ? 'linear-gradient(0deg, #f5e6c8 0%, #f0ddb8 50%, #e8d5b7 100%)'
          : 'linear-gradient(90deg, #d4b896 0%, #c4a882 50%, #d4b896 100%)',
        borderRadius: '4px 12px 12px 4px',
        boxShadow: `
          0 0 0 8px #3d2b1f,
          0 0 0 10px #2c1810,
          0 0 0 12px rgba(0,0,0,0.3),
          0 20px 60px rgba(0,0,0,0.5),
          inset 0 0 0 2px rgba(0,0,0,0.05)
        `,
        overflow: 'hidden',
      }}>
        {unified ? (
          /* ===== 统一单页（无夹缝） ===== */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}>
            {/* 纸张纹理 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,105,20,0.02) 2px, rgba(139,105,20,0.02) 4px)
              `,
              pointerEvents: 'none', zIndex: 0,
            }} />
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              {leftChild}
            </div>
          </div>
        ) : (
          /* ===== 双页布局 ===== */
          <>
            {/* 左页 */}
            <div style={{
              flex: '1 1 50%', minWidth:0,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}>
              {leftChild}
            </div>

            {/* 书脊 */}
            <div style={{
              width: '3px',
              background: 'linear-gradient(90deg, #8b6914, #4a3728 50%, #8b6914)',
              boxShadow: '0 0 8px rgba(0,0,0,0.3), inset 0 0 4px rgba(0,0,0,0.2)',
              zIndex: 10,
              flexShrink: 0,
            }} />

            {/* 右页 */}
            <div style={{
              flex: '1 1 50%', minWidth:0,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}>
              {rightChild}
            </div>

            {/* 书脊阴影覆盖 */}
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: 'calc(50% - 8px)',
              width: '16px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)',
              pointerEvents: 'none',
              zIndex: 9,
            }} />
          </>
        )}
      </div>
    </div>
  )
})
