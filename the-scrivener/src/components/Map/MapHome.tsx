// ========================================
// 世界地图 — 入口缓冲页（有夹缝双页）
// 左页 = WorldDirectory，右页 = 本地图集 / 地标文库入口
// ========================================

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function MapHome() {
  const maps = useAppStore((s) => s.maps)
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const landmarks = useAppStore((s) => s.landmarks)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldMaps = maps.filter((m) => m.worldId === currentWorldId)
  const worldLandmarks = landmarks.filter((l) => l.worldId === currentWorldId)
  const [selectedTab, setSelectedTab] = useState<'atlas' | 'library' | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 36px' }}>
      {/* 标题 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '28px', paddingBottom: '16px',
        borderBottom: '2px solid var(--color-accent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn" onClick={goBack}>← 返回</button>
          <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>世界地图</h2>
        </div>
      </div>

      {/* 两个大入口卡片 */}
      <div style={{ flex: 1, display: 'flex', gap: '24px', alignItems: 'stretch' }}>
        {/* 地图集 */}
        <div
          onClick={() => navigateTo('mapAtlas', '地图集')}
          className="map-home-card"
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.borderColor = GOLD
            el.style.boxShadow = `0 8px 28px rgba(0,0,0,0.15), 0 0 24px ${GOLD}33, inset 0 0 20px ${GOLD}11`
            el.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--color-page-shadow)'
            el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
            el.style.transform = 'translateY(0)'
          }}
          style={{
            flex: 1,
            borderRadius: '14px',
            border: '2px solid var(--color-page-shadow)',
            background: 'linear-gradient(160deg, rgba(245,230,200,0.6) 0%, rgba(232,213,183,0.4) 100%)',
            padding: '32px 28px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* 装饰背景 */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: '120px', height: '120px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${GOLD}15, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* 图标 */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <MapAtlasIcon />
          </div>

          {/* 标题 */}
          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            地图集
          </div>

          {/* 信息 */}
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            {worldMaps.length} 个维度 · {worldLandmarks.length} 个地标
          </div>

          {/* 描述 */}
          <div style={{
            fontSize: '14px', color: 'var(--color-text-light)',
            textAlign: 'center', lineHeight: '1.8', maxWidth: '200px',
            position: 'relative', zIndex: 1,
          }}>
            管理地图存档、编辑地标节点、绘制区域版图
          </div>

          {/* 箭头 */}
          <div style={{
            marginTop: 'auto',
            fontSize: '13px', color: GOLD,
            display: 'flex', alignItems: 'center', gap: '4px',
            opacity: 0.7, position: 'relative', zIndex: 1,
          }}>
            进入 → 
          </div>
        </div>

        {/* 地标文库 */}
        <div
          onClick={() => navigateTo('landmarkLibrary', '地标文库')}
          className="map-home-card"
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.borderColor = GOLD
            el.style.boxShadow = `0 8px 28px rgba(0,0,0,0.15), 0 0 24px ${GOLD}33, inset 0 0 20px ${GOLD}11`
            el.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--color-page-shadow)'
            el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
            el.style.transform = 'translateY(0)'
          }}
          style={{
            flex: 1,
            borderRadius: '14px',
            border: '2px solid var(--color-page-shadow)',
            background: 'linear-gradient(160deg, rgba(245,230,200,0.6) 0%, rgba(232,213,183,0.4) 100%)',
            padding: '32px 28px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -30, left: -30,
            width: '120px', height: '120px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${GOLD}15, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <LandmarkLibraryIcon />
          </div>

          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            地标文库
          </div>

          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            {worldLandmarks.length} 个地标条目
          </div>

          <div style={{
            fontSize: '14px', color: 'var(--color-text-light)',
            textAlign: 'center', lineHeight: '1.8', maxWidth: '200px',
            position: 'relative', zIndex: 1,
          }}>
            浏览地标条目、搜索分类过滤、查看详细描述
          </div>

          <div style={{
            marginTop: 'auto',
            fontSize: '13px', color: GOLD,
            display: 'flex', alignItems: 'center', gap: '4px',
            opacity: 0.7, position: 'relative', zIndex: 1,
          }}>
            进入 → 
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div style={{
        textAlign: 'center', paddingTop: '16px',
        fontSize: '12px', color: 'var(--color-text-muted)',
      }}>
        选择一个入口进入对应功能页面
      </div>
    </div>
  )
}

// ═══ 地图集图标 ═══
function MapAtlasIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      {/* 打开的书本/地图册 */}
      <path d="M12 18 L40 28 L68 18 L68 62 L40 72 L12 62 Z"
        fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 书脊/折痕 */}
      <line x1="40" y1="28" x2="40" y2="72" stroke={GOLD} strokeWidth="1.5" opacity="0.5" />
      {/* 左页地图标记 */}
      <circle cx="26" cy="40" r="3" fill={GOLD} opacity="0.6" />
      <polygon points="26,37 28,44 26,43 24,44" fill={GOLD} opacity="0.4" />
      <line x1="20" y1="52" x2="32" y2="52" stroke={GOLD} strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      {/* 右页地图标记 */}
      <circle cx="54" cy="38" r="2.5" fill={GOLD} opacity="0.5" />
      <rect x="50" y="46" width="12" height="8" rx="1.5" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.35" />
      {/* 装饰封面 */}  
      <rect x="8" y="14" width="64" height="66" rx="3" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.3" />
    </svg>
  )
}

// ═══ 地标文库图标 ═══
function LandmarkLibraryIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      {/* 书架外框 */}
      <rect x="10" y="8" width="60" height="64" rx="3" fill="none" stroke={GOLD} strokeWidth="2.5" />
      {/* 顶部装饰 */}
      <path d="M20 6 L40 2 L60 6" stroke={GOLD} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 三层隔板 */}
      <line x1="12" y1="26" x2="68" y2="26" stroke={GOLD} strokeWidth="1.5" opacity="0.5" />
      <line x1="12" y1="44" x2="68" y2="44" stroke={GOLD} strokeWidth="1.5" opacity="0.5" />
      {/* 书/标签 */}
      <rect x="16" y="13" width="6" height="11" rx="1" fill={GOLD} opacity="0.4" />
      <rect x="24" y="12" width="5" height="12" rx="1" fill={GOLD} opacity="0.55" />
      <rect x="31" y="14" width="6" height="10" rx="1" fill={GOLD} opacity="0.35" />
      <rect x="39" y="13" width="5" height="11" rx="1" fill={GOLD} opacity="0.5" />
      <rect x="46" y="12" width="6" height="12" rx="1" fill={GOLD} opacity="0.45" />
      <rect x="54" y="14" width="5" height="10" rx="1" fill={GOLD} opacity="0.4" />
      {/* 第二排 */}
      <rect x="16" y="30" width="5" height="12" rx="1" fill={GOLD} opacity="0.5" />
      <g transform="rotate(-10, 30, 42)">
        <rect x="28" y="36" width="6" height="10" rx="1" fill={GOLD} opacity="0.45" />
      </g>
      <rect x="38" y="30" width="5" height="12" rx="1" fill={GOLD} opacity="0.55" />
      <rect x="45" y="31" width="6" height="11" rx="1" fill={GOLD} opacity="0.4" />
      <rect x="53" y="30" width="5" height="12" rx="1" fill={GOLD} opacity="0.5" />
      {/* 第三排 */}
      <rect x="16" y="49" width="6" height="11" rx="1" fill={GOLD} opacity="0.45" />
      <g transform="rotate(8, 32, 60)">
        <rect x="30" y="54" width="5" height="12" rx="1" fill={GOLD} opacity="0.5" />
      </g>
      <rect x="40" y="49" width="5" height="11" rx="1" fill={GOLD} opacity="0.4" />
      <rect x="47" y="50" width="6" height="10" rx="1" fill={GOLD} opacity="0.55" />
      <rect x="55" y="49" width="5" height="11" rx="1" fill={GOLD} opacity="0.4" />
      {/* 标签挂饰 */}
      <rect x="32" y="68" width="16" height="8" rx="2" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}
