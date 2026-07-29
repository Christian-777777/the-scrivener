// ========================================
// 物品库 — 入口缓冲页（物品集 / 合成图谱）
// ========================================

import { useAppStore } from '@/store/useAppStore'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function ItemHome() {
  const items = useAppStore((s) => s.items)
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldItems = items.filter((i) => i.worldId === currentWorldId)

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
          <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>物品库</h2>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '24px', alignItems: 'stretch' }}>
        {/* 物品集 */}
        <div onClick={() => navigateTo('itemList', '物品集')} className="map-home-card"
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
            flex: 1, borderRadius: '14px', border: '2px solid var(--color-page-shadow)',
            background: 'linear-gradient(160deg, rgba(245,230,200,0.6) 0%, rgba(232,213,183,0.4) 100%)',
            padding: '32px 28px', cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: '120px', height: '120px',
            borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}15, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ItemListIcon />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            物品集
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            {worldItems.length} 件物品
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-light)', textAlign: 'center', lineHeight: '1.8', maxWidth: '200px', position: 'relative', zIndex: 1 }}>
            创建物品档案、管理分类标签、编辑物品属性
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: GOLD, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7, position: 'relative', zIndex: 1 }}>
            进入 →
          </div>
        </div>

        {/* 合成图谱 */}
        <div onClick={() => navigateTo('synthesisGraph', '合成图谱')} className="map-home-card"
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
            flex: 1, borderRadius: '14px', border: '2px solid var(--color-page-shadow)',
            background: 'linear-gradient(160deg, rgba(245,230,200,0.6) 0%, rgba(232,213,183,0.4) 100%)',
            padding: '32px 28px', cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', top: -30, left: -30, width: '120px', height: '120px',
            borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}15, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <SynthesisGraphIcon />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            合成图谱
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            合成关系可视化
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-light)', textAlign: 'center', lineHeight: '1.8', maxWidth: '200px', position: 'relative', zIndex: 1 }}>
            构建物品合成链、绘制合成关系图、编辑合成配方
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: GOLD, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7, position: 'relative', zIndex: 1 }}>
            进入 →
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        选择一个入口进入对应功能页面
      </div>
    </div>
  )
}

function ItemListIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      {/* 中世纪宝箱 */}
      <rect x="16" y="28" width="48" height="30" rx="3" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <path d="M 16 31 L 40 22 L 64 31" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
      {/* 箱盖装饰 */}
      <line x1="40" y1="22" x2="40" y2="31" stroke={GOLD} strokeWidth="1.5" opacity="0.4" />
      {/* 锁扣 */}
      <rect x="36" y="34" width="8" height="8" rx="1.5" fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.3" />
      <circle cx="40" cy="38" r="1.5" fill={GOLD} />
      {/* 金属条带 */}
      <rect x="14" y="42" width="52" height="3" rx="1" fill={`${GOLD}18`} stroke={GOLD} strokeWidth="1" opacity="0.5" />
      <rect x="14" y="49" width="52" height="3" rx="1" fill={`${GOLD}18`} stroke={GOLD} strokeWidth="1" opacity="0.5" />
      {/* 铆钉 */}
      <circle cx="20" cy="43.5" r="2" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="0.8" />
      <circle cx="60" cy="43.5" r="2" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="0.8" />
      <circle cx="20" cy="50.5" r="2" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="0.8" />
      <circle cx="60" cy="50.5" r="2" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="0.8" />
      {/* 散落的小物件 */}
      <circle cx="14" cy="64" r="3" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="1" />
      <rect x="24" y="61" width="5" height="5" rx="1" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="1" transform="rotate(15 26 63)" />
      <polygon points="38,60 42,58 46,60 44,65 40,66 36,65" fill={`${GOLD}12`} stroke={GOLD} strokeWidth="1" opacity="0.7" />
      <circle cx="60" cy="63" r="2.5" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="0.8" />
      {/* 发光粒子 */}
      <circle cx="12" cy="28" r="1.5" fill={GOLD} opacity="0.3" />
      <circle cx="68" cy="26" r="1" fill={GOLD} opacity="0.25" />
      <circle cx="10" cy="48" r="1" fill={GOLD} opacity="0.2" />
    </svg>
  )
}

function SynthesisGraphIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      {/* 炼金/合成 — 六芒星中的蒸馏瓶 */}
      {/* 外圈 */}
      <circle cx="40" cy="40" r="34" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.5" />
      <circle cx="40" cy="40" r="30" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.3" />
      {/* 六芒星 */}
      <polygon points="40,10 66,25 66,55 40,70 14,55 14,25" fill="none" stroke={GOLD} strokeWidth="1.3" opacity="0.35" />
      <polygon points="40,10 40,70 14,25" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.2" />
      <polygon points="66,25 14,25 40,55" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.2" />
      {/* 中心蒸馏瓶 */}
      <circle cx="40" cy="32" r="7" fill={`${GOLD}18`} stroke={GOLD} strokeWidth="1.5" />
      <ellipse cx="40" cy="45" rx="9" ry="10" fill={`${GOLD}12`} stroke={GOLD} strokeWidth="1.5" />
      {/* 瓶颈连接 */}
      <line x1="40" y1="27" x2="40" y2="35" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      {/* 瓶内液体 */}
      <ellipse cx="40" cy="41" rx="7" ry="5" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
      {/* 瓶口火焰/蒸汽 */}
      <path d="M 36 25 C 38 21, 42 21, 44 25" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <circle cx="40" cy="19" r="2" fill={`${GOLD}18`} stroke={GOLD} strokeWidth="0.8" opacity="0.5" />
      {/* 连接箭头 — 左上→瓶，右上→瓶，瓶→下左，瓶→下右 */}
      <circle cx="22" cy="36" r="4" fill={`${GOLD}12`} stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <line x1="26" y1="34" x2="33" y2="31" stroke={GOLD} strokeWidth="1.2" opacity="0.4" markerEnd="url(#sgArrow)" />
      <circle cx="58" cy="36" r="4" fill={`${GOLD}12`} stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <line x1="54" y1="34" x2="47" y2="31" stroke={GOLD} strokeWidth="1.2" opacity="0.4" markerEnd="url(#sgArrow)" />
      <circle cx="22" cy="54" r="4" fill={`${GOLD}12`} stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <line x1="33" y1="50" x2="26" y2="53" stroke={GOLD} strokeWidth="1.2" opacity="0.4" markerEnd="url(#sgArrow)" />
      <circle cx="58" cy="54" r="4" fill={`${GOLD}12`} stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <line x1="47" y1="50" x2="54" y2="53" stroke={GOLD} strokeWidth="1.2" opacity="0.4" markerEnd="url(#sgArrow)" />
      {/* 节点内小圆 */}
      <circle cx="22" cy="36" r="2" fill={GOLD} opacity="0.4" />
      <circle cx="58" cy="36" r="2" fill={GOLD} opacity="0.4" />
      <circle cx="22" cy="54" r="2" fill={GOLD} opacity="0.4" />
      <circle cx="58" cy="54" r="2" fill={GOLD} opacity="0.4" />
      {/* 箭头标记 */}
      <defs>
        <marker id="sgArrow" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0,0 5,2 0,4" fill={GOLD} opacity="0.4" />
        </marker>
      </defs>
    </svg>
  )
}
