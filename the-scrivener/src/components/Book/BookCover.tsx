// ========================================
// 书籍封面 - 中世纪风格书本关闭状态
// ========================================

import { useState } from 'react'

interface BookCoverProps {
  onOpen: () => void
  animating: boolean
}

export function BookCover({ onOpen, animating }: BookCoverProps) {
  const [hovered, setHovered] = useState(false)

  const corners = [
    { v: 'top' as const, vVal: '3%', h: 'left' as const, hVal: '3%', br: '4px 0 0 0' },
    { v: 'top' as const, vVal: '3%', h: 'right' as const, hVal: '3%', br: '0 4px 0 0' },
    { v: 'bottom' as const, vVal: '3%', h: 'left' as const, hVal: '3%', br: '0 0 0 4px' },
    { v: 'bottom' as const, vVal: '3%', h: 'right' as const, hVal: '3%', br: '0 0 4px 0' },
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d0806 0%, #1a0f0a 30%, #2c1810 60%, #1a0f0a 100%)',
      perspective: '2000px',
      opacity: animating ? 0 : 1,
      transition: 'opacity 0.8s ease',
    }}>
      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 'min(41vw, calc(90vh * 0.705))',
          height: 'min(58vw, 90vh)',
          position: 'relative',
          cursor: 'pointer',
          transform: hovered ? 'rotateY(-5deg) scale(1.03)' : 'rotateY(0deg) scale(1)',
          transformOrigin: 'center center',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '4px 16px 16px 4px',
          background: 'linear-gradient(160deg, #5a3d2b 0%, #4a2a1a 15%, #3d2010 40%, #4a2a1a 65%, #5a3d2b 100%)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 4px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2)
          `,
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #2a1508',
        }}>
          {/* 皮革纹理 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 6px)
            `,
            borderRadius: '4px 16px 16px 4px',
          }} />

          {/* 外层金色边框 */}
          <div style={{
            position: 'absolute', inset: '5%',
            border: '2px solid #8b6914',
            borderRadius: '2px 10px 10px 2px',
            opacity: 0.6,
          }} />

          {/* 内层金色边框 */}
          <div style={{
            position: 'absolute', inset: '8%',
            border: '1px solid #6b5010',
            borderRadius: '2px 8px 8px 2px',
            opacity: 0.4,
          }} />

          {/* 四角装饰 */}
          {corners.map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              [c.v]: c.vVal,
              [c.h]: c.hVal,
              width: '40px', height: '40px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: '#c9a96e',
              borderTopStyle: c.v === 'bottom' ? 'none' : 'solid',
              borderBottomStyle: c.v === 'top' ? 'none' : 'solid',
              borderLeftStyle: c.h === 'right' ? 'none' : 'solid',
              borderRightStyle: c.h === 'left' ? 'none' : 'solid',
              opacity: 0.5,
              borderRadius: c.br,
            }} />
          ))}

          {/* 标题区 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 'min(36px, 3vw)',
              color: '#c9a96e',
              letterSpacing: '12px',

              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: '12px',
            }}>
              世界OC编辑器
            </div>
            <div style={{
              fontSize: 'min(14px, 1.2vw)',
              color: '#8b7355',
              letterSpacing: '6px',

            }}>
              W O R L D  ·  C R E A T O R
            </div>
          </div>

          {/* 书脊 */}
          <div style={{
            position: 'absolute',
            right: '-3px', top: '0', bottom: '0',
            width: '6px',
            background: 'linear-gradient(90deg, #2a1508, #3d2010 50%, #2a1508)',
            borderRadius: '0 3px 3px 0',
          }} />
        </div>

        {/* 悬停光晕 */}
        <div style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: '8px 20px 20px 8px',
          opacity: hovered ? 0.3 : 0,
          transition: 'opacity 0.6s ease',
          background: 'radial-gradient(ellipse at center, rgba(201, 169, 110, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* 底部提示 */}
        <div style={{
          position: 'absolute',
          bottom: 'min(16px, 1.5vw)',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#8b7355',
          fontSize: '14px',
          letterSpacing: '3px',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
        }}>
          点击翻开
        </div>
      </div>
    </div>
  )
}
