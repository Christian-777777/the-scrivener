// ========================================
// 怪物手册 — 入口缓冲页
// ========================================

import { useAppStore } from '@/store/useAppStore'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function MonsterHome() {
  const monsters = useAppStore((s) => s.monsters)
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldMonsters = monsters.filter((m) => m.worldId === currentWorldId)

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
          <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>怪物手册</h2>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '24px', alignItems: 'stretch' }}>
        {/* 怪物集 */}
        <div onClick={() => navigateTo('monsterList', '怪物集')} className="map-home-card"
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
            <MonsterListIcon />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            怪物集
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            {worldMonsters.length} 种怪物
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-light)', textAlign: 'center', lineHeight: '1.8', maxWidth: '200px', position: 'relative', zIndex: 1 }}>
            创建怪物图鉴、编辑详细信息、管理分类标签
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: GOLD, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7, position: 'relative', zIndex: 1 }}>
            进入 →
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        选择入口进入对应功能页面
      </div>
    </div>
  )
}

function MonsterListIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      {/* 中世纪怪物/兽类图鉴 — 摊开的书本 + 龙/兽侧影 */}
      {/* 书本 */}
      <rect x="14" y="18" width="24" height="44" rx="1.5" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <rect x="38" y="18" width="24" height="44" rx="1.5" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <line x1="38" y1="18" x2="38" y2="62" stroke={GOLD} strokeWidth="2.5" opacity="0.6" />
      {/* 左页：龙形轮廓 */}
      <path d="M 20 52 C 20 48 22 44 26 42 C 28 40 30 36 30 32 C 30 28 28 26 26 26 C 24 26 22 28 22 30 C 22 28 20 26 18 26 C 16 26 14 28 14 32 C 14 38 18 48 20 52 Z" fill={`${GOLD}18`} stroke={GOLD} strokeWidth="1.5" />
      <circle cx="26" cy="25" r="1.2" fill={GOLD} opacity="0.6" />
      {/* 右页：利爪痕迹 */}
      <path d="M 44 28 L 52 24 M 44 34 L 54 30 M 44 40 L 52 36 M 44 46 L 50 42" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <path d="M 48 24 L 55 28 M 48 30 L 57 34 M 48 36 L 55 40" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
      {/* 封面装饰 */}
      <rect x="10" y="16" width="4" height="48" rx="1" fill={`${GOLD}25`} stroke={GOLD} strokeWidth="1.2" />
      <rect x="62" y="16" width="4" height="48" rx="1" fill={`${GOLD}25`} stroke={GOLD} strokeWidth="1.2" />
      {/* 书脊装饰 */}
      <circle cx="26" cy="68" r="2" fill={GOLD} opacity="0.3" />
      <circle cx="50" cy="68" r="2" fill={GOLD} opacity="0.3" />
      {/* 底部装饰线 */}
      <line x1="14" y1="60" x2="36" y2="60" stroke={GOLD} strokeWidth="1" opacity="0.3" />
      <line x1="40" y1="60" x2="62" y2="60" stroke={GOLD} strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
