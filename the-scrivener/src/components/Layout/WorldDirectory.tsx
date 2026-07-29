// ========================================
// 世界目录 - 进入世界后的左侧导航面板
// ========================================

import { useAppStore } from '@/store/useAppStore'
import type { PageView } from '@/types'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function WorldDirectory() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const worlds = useAppStore((s) => s.worlds)
  const leaveWorld = useAppStore((s) => s.leaveWorld)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const currentView = useAppStore((s) => s.currentView)

  const world = worlds.find((w) => w.id === currentWorldId)

  const menuItems: { view: PageView; label: string; svg: React.ReactNode }[] = [
    { view: 'chronicle', label: '世界编年史', svg: <ChronicleIcon /> },
    { view: 'mapHome', label: '世界地图', svg: <MapIcon /> },
    { view: 'characterHome', label: '人物库', svg: <CharacterIcon /> },
    { view: 'monsterHome', label: '怪物手册', svg: <MonsterIcon /> },
    { view: 'itemHome', label: '物品库', svg: <ItemIcon /> },
    { view: 'library', label: '图书馆', svg: <LibraryIcon /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 世界标题 + 返回 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid var(--color-accent)',
      }}>
        <div>
          <div style={{
            fontSize: '20px',
            color: 'var(--color-gold-dark)',
            letterSpacing: '2px',
            fontWeight: 600,
          }}>
            {world?.name || '世界'}
          </div>
        </div>
        <div
          onClick={leaveWorld}
          className="directory-back-btn"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--color-text-light)',
            border: '1px solid var(--color-page-shadow)',
          }}
          title="返回世界库"
        >
          ← 返回
        </div>
      </div>

      {/* 目录菜单 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const active = currentView === item.view
          return (
            <div
              key={item.view}
              onClick={() => navigateTo(item.view, item.label)}
              className={`directory-item ${active ? 'active' : ''}`}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '16px',
                color: active ? GOLD : 'var(--color-text)',
                background: active ? 'rgba(184, 134, 11, 0.12)' : 'transparent',
                border: active
                  ? `1.5px solid ${GOLD}`
                  : '1.5px solid var(--color-page-shadow)',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, background 0.25s ease, text-shadow 0.25s ease, filter 0.25s ease',
                textShadow: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = GOLD_LIGHT
                e.currentTarget.style.color = GOLD
                e.currentTarget.style.background = 'rgba(184, 134, 11, 0.08)'
                e.currentTarget.style.boxShadow = `0 0 12px ${GOLD}44, inset 0 0 8px ${GOLD}22`
                e.currentTarget.style.textShadow = `0 0 10px ${GOLD}66, 0 0 20px ${GOLD}44`
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'var(--color-page-shadow)'
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.background = 'transparent'
                } else {
                  e.currentTarget.style.borderColor = GOLD
                  e.currentTarget.style.color = GOLD
                  e.currentTarget.style.background = 'rgba(184, 134, 11, 0.12)'
                }
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.textShadow = 'none'
              }}
            >
              <span
                className="directory-icon"
                style={{
                  width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'filter 0.25s ease',
                  filter: 'none',
                }}
              >
                {item.svg}
              </span>
              <span>{item.label}</span>
            </div>
          )
        })}
      </div>

      {/* 底部字体信息 */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--color-page-shadow)',
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
      }}>
        {world?.name}
      </div>

      <style>{`
        .directory-item:hover .directory-icon {
          filter: drop-shadow(0 0 6px ${GOLD}99) drop-shadow(0 0 14px ${GOLD}55);
        }
        .directory-item.active .directory-icon {
          filter: drop-shadow(0 0 4px ${GOLD}66);
        }
        .directory-back-btn:hover {
          background: var(--color-button-hover);
        }
      `}</style>
    </div>
  )
}

// ===========================================
// SVG 图标组件
// ===========================================

function ChronicleIcon() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
      <rect x="8" y="3" width="12" height="22" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="5" y1="7" x2="23" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="20" x2="23" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 9 L14 14 L18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="13.5" cy="23" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="14.5" cy="24.5" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="15" cy="22.5" r="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="14" y1="3" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="22" x2="14" y2="25" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="14" x2="6" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 7 L16.5 14 L14 13.5 L11.5 14 Z" fill="currentColor" opacity="0.85" />
      <path d="M14 7 L12.5 14 L14 13.5 L15.5 14 Z" fill="currentColor" opacity="0.55" />
      <circle cx="14" cy="13.8" r="2" fill="currentColor" />
    </svg>
  )
}

function CharacterIcon() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
      <path d="M14 2 L7 14 L21 14 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="6" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 14 Q10 18 14 23 Q18 18 18 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="14" y1="12" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="16" r="1" fill="currentColor" />
      <circle cx="17" cy="16" r="1" fill="currentColor" />
      <path d="M12 19 Q14 20 16 19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function MonsterIcon() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
      <rect x="6" y="5" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="14" y1="5" x2="14" y2="23" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="7" width="2" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="13" y="16" width="2" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="14" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

function ItemIcon() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
      <path d="M4 13 L6 22 L22 22 L24 13 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M3 13 C3 8 7 6 14 6 C21 6 25 8 25 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M5 12 C7 9 11 7.5 14 7.5 C17 7.5 21 9 23 12" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" />
      <circle cx="14" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="12.5" y="12" width="3" height="4" rx="0.5" fill="currentColor" />
      <line x1="7" y1="15" x2="7" y2="20" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <line x1="21" y1="15" x2="21" y2="20" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M14 2 L14.8 4.5 L14 4 L13.2 4.5 Z" fill="currentColor" opacity="0.6" />
      <path d="M17.5 3.5 L17 5.8 L16.2 5 L16.8 6.2 Z" fill="currentColor" opacity="0.4" />
      <path d="M10.5 3.5 L11 5.8 L11.8 5 L11.2 6.2 Z" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
      {/* 书柜/图书馆 图标 — 三层书架 */}
      {/* 书柜外框 */}
      <rect x="3" y="4" width="22" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
      {/* 顶部装饰 */}
      <path d="M7 3 L14 1 L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 三层隔板 */}
      <line x1="4" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="1.5" />
      {/* 第一排书 */}
      <rect x="6" y="5.5" width="2.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="9" y="5.5" width="2" height="4" rx="0.4" fill="currentColor" opacity="0.65" />
      <rect x="11.5" y="6" width="2.5" height="3.5" rx="0.5" fill="currentColor" opacity="0.45" />
      <rect x="14.5" y="5.5" width="2" height="4" rx="0.4" fill="currentColor" opacity="0.7" />
      <rect x="17" y="5.5" width="2.5" height="4" rx="0.5" fill="currentColor" opacity="0.55" />
      <rect x="20" y="6" width="2" height="3.5" rx="0.4" fill="currentColor" opacity="0.5" />
      {/* 第二排书 — 部分倾斜 */}
      <rect x="5.5" y="11" width="2" height="4.5" rx="0.4" fill="currentColor" opacity="0.6" />
      <rect x="8" y="11" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.5" />
      <g transform="rotate(-12, 13, 15.5)">
        <rect x="11.5" y="13" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.55" />
      </g>
      <rect x="14.5" y="11" width="2" height="4.5" rx="0.4" fill="currentColor" opacity="0.65" />
      <rect x="17" y="11" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="20" y="11" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.6" />
      {/* 第三排书 */}
      <rect x="6" y="17" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="9" y="17" width="2" height="4.5" rx="0.4" fill="currentColor" opacity="0.7" />
      <g transform="rotate(10, 14, 21.5)">
        <rect x="12.5" y="19" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.55" />
      </g>
      <rect x="16.5" y="17" width="2" height="4.5" rx="0.4" fill="currentColor" opacity="0.6" />
      <rect x="19" y="17" width="2.5" height="4.5" rx="0.5" fill="currentColor" opacity="0.5" />
      {/* 底部 */}
      <line x1="4" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
