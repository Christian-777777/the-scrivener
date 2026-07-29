// ========================================
// 自定义窗口标题栏 — 中世纪金色主题
// ========================================

import { useState, useEffect } from 'react'

export function TitleBar() {
  const api = window.electronAPI
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (!api) return
    api.onMaximizeChange((val) => setMaximized(val))
  }, [api])

  // 浏览器开发模式下不显示（没有窗口概念）
  if (!api) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #3d2b1f 0%, #2c1810 100%)',
        borderBottom: '1px solid #8b6914',
        zIndex: 9999,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      } as React.CSSProperties}
    >
      {/* 左侧：应用名 */}
      <div style={{
        color: '#8b6914',
        fontSize: 12,
        paddingLeft: 14,
        letterSpacing: 2,
        opacity: 0.7,
        fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      }}>
        世界OC编辑器
      </div>

      {/* 右侧：窗口按钮 */}
      <div style={{
        display: 'flex',
        height: '100%',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}>
        <TitleBtn title="最小化" onClick={() => api.minimize()}>
          <svg width={12} height={12} viewBox="0 0 12 12">
            <rect x={1} y={5.5} width={10} height={1} fill="currentColor"/>
          </svg>
        </TitleBtn>

        <TitleBtn title={maximized ? '还原' : '最大化'} onClick={() => api.maximize()}>
          {maximized ? (
            <svg width={12} height={12} viewBox="0 0 12 12">
              <rect x={3} y={0.5} width={8.5} height={8.5} rx={0.5} fill="none" stroke="currentColor" strokeWidth={1}/>
              <rect x={0.5} y={3.5} width={8.5} height={8} rx={0.5} fill="#3d2b1f" stroke="currentColor" strokeWidth={1}/>
            </svg>
          ) : (
            <svg width={12} height={12} viewBox="0 0 12 12">
              <rect x={1} y={1} width={10} height={10} rx={1} fill="none" stroke="currentColor" strokeWidth={1.2}/>
            </svg>
          )}
        </TitleBtn>

        <TitleBtn title="关闭" onClick={() => api.close()} danger>
          <svg width={12} height={12} viewBox="0 0 12 12">
            <line x1={1} y1={1} x2={11} y2={11} stroke="currentColor" strokeWidth={1.5}/>
            <line x1={11} y1={1} x2={1} y2={11} stroke="currentColor" strokeWidth={1.5}/>
          </svg>
        </TitleBtn>
      </div>
    </div>
  )
}

function TitleBtn({ title, onClick, danger, children }: {
  title: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      title={title}
      onClick={onClick}
      style={{
        width: 46,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? '#b43c3c' : '#8b6914',
        transition: 'background 0.15s',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(180, 60, 60, 0.25)'
          : 'rgba(184, 134, 11, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </div>
  )
}
