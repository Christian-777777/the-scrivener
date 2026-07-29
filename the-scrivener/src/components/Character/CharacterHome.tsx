// ========================================
// 人物库 — 入口缓冲页（人物集 / 人物图谱）
// ========================================

import { useAppStore } from '@/store/useAppStore'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function CharacterHome() {
  const characters = useAppStore((s) => s.characters)
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldCharacters = characters.filter((c) => c.worldId === currentWorldId)

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
          <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>人物库</h2>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '24px', alignItems: 'stretch' }}>
        {/* 人物集 */}
        <div onClick={() => navigateTo('characterList', '人物集')} className="map-home-card"
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
            <CharacterListIcon />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            人物集
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            {worldCharacters.length} 个人物
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-light)', textAlign: 'center', lineHeight: '1.8', maxWidth: '200px', position: 'relative', zIndex: 1 }}>
            创建人物档案、编辑详细信息、管理分类标签
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: GOLD, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7, position: 'relative', zIndex: 1 }}>
            进入 →
          </div>
        </div>

        {/* 人物图谱 */}
        <div onClick={() => navigateTo('characterGraph', '人物图谱')} className="map-home-card"
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
            <CharacterGraphIcon />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: GOLD, letterSpacing: '2px', position: 'relative', zIndex: 1 }}>
            人物图谱
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
            关系可视化
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-light)', textAlign: 'center', lineHeight: '1.8', maxWidth: '200px', position: 'relative', zIndex: 1 }}>
            构建人物关系网络、绘制关系图谱、编辑关系文本
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

function CharacterListIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      <rect x="8" y="5" width="36" height="58" rx="2" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <rect x="11" y="8" width="30" height="52" rx="1" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.4" />
      {[16,22,28,34,40,46,52].map((y)=><line key={`ll${y}`} x1="15" y1={y} x2="37" y2={y} stroke={GOLD} strokeWidth="1.2" opacity={0.3} strokeLinecap="round" />)}
      <rect x="15" y="13" width="10" height="10" rx="1" fill={`${GOLD}33`} stroke={GOLD} strokeWidth="1.2" />
      <text x="18" y="21" fontSize="7" fontWeight="bold" fill={GOLD} fontFamily="serif">A</text>
      <rect x="36" y="5" width="36" height="58" rx="2" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <rect x="39" y="8" width="30" height="52" rx="1" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.4" />
      <circle cx="54" cy="22" r="9" fill={`${GOLD}18`} stroke={GOLD} strokeWidth="1.5" />
      <path d="M45 44 C45 35 63 35 63 44" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      {[36,42,48,54].map((y)=><line key={`rl${y}`} x1="41" y1={y} x2="63" y2={y} stroke={GOLD} strokeWidth="1" opacity={0.25} strokeLinecap="round" />)}
      <line x1="44" y1="5" x2="44" y2="63" stroke={GOLD} strokeWidth="2.5" opacity="0.6" />
      <line x1="43" y1="5" x2="43" y2="63" stroke={GOLD} strokeWidth="0.8" opacity="0.3" />
      <rect x="17" y="65" width="46" height="8" rx="2" fill="none" stroke={GOLD} strokeWidth="2" />
      <line x1="22" y1="65" x2="22" y2="73" stroke={GOLD} strokeWidth="1" opacity="0.5" />
      <line x1="58" y1="65" x2="58" y2="73" stroke={GOLD} strokeWidth="1" opacity="0.5" />
      <path d="M 17 69 L 63 69" stroke={GOLD} strokeWidth="0.8" opacity="0.3" />
    </svg>
  )
}

function CharacterGraphIcon() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
      <rect x="10" y="4" width="60" height="52" rx="3" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <rect x="14" y="8" width="52" height="44" rx="1.5" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.3" />
      <rect x="8" y="2" width="64" height="5" rx="2" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="1.5" />
      <circle cx="12" cy="4.5" r="2" fill={GOLD} opacity="0.5" />
      <circle cx="68" cy="4.5" r="2" fill={GOLD} opacity="0.5" />
      <rect x="8" y="56" width="64" height="5" rx="2" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="1.5" />
      <circle cx="12" cy="58.5" r="2" fill={GOLD} opacity="0.5" />
      <circle cx="68" cy="58.5" r="2" fill={GOLD} opacity="0.5" />
      <circle cx="40" cy="16" r="6" fill={`${GOLD}25`} stroke={GOLD} strokeWidth="1.5" />
      <circle cx="40" cy="16" r="3" fill={GOLD} opacity="0.5" />
      <polygon points="37,12 40,9 43,12" fill="none" stroke={GOLD} strokeWidth="1" strokeLinejoin="round" />
      <line x1="40" y1="22" x2="40" y2="28" stroke={GOLD} strokeWidth="1.8" />
      <line x1="25" y1="28" x2="55" y2="28" stroke={GOLD} strokeWidth="1.8" />
      <line x1="25" y1="28" x2="25" y2="36" stroke={GOLD} strokeWidth="1.5" />
      <line x1="55" y1="28" x2="55" y2="36" stroke={GOLD} strokeWidth="1.5" />
      <line x1="40" y1="28" x2="40" y2="36" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="25" cy="42" r="5" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="1.3" />
      <circle cx="25" cy="42" r="2.5" fill={GOLD} opacity="0.4" />
      <line x1="25" y1="36" x2="25" y2="37" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="45" r="5" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="1.3" />
      <circle cx="40" cy="45" r="2.5" fill={GOLD} opacity="0.4" />
      <line x1="40" y1="36" x2="40" y2="40" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="55" cy="42" r="5" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="1.3" />
      <circle cx="55" cy="42" r="2.5" fill={GOLD} opacity="0.4" />
      <line x1="55" y1="36" x2="55" y2="37" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="55" y1="47" x2="55" y2="50" stroke={GOLD} strokeWidth="1" opacity="0.5" />
      <line x1="48" y1="50" x2="62" y2="50" stroke={GOLD} strokeWidth="1" opacity="0.4" />
      <circle cx="50" cy="53" r="3" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="0.8" opacity={0.5} />
      <circle cx="60" cy="53" r="3" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="0.8" opacity={0.5} />
      <line x1="50" y1="50" x2="50" y2="51" stroke={GOLD} strokeWidth="0.8" opacity={0.4} />
      <line x1="60" y1="50" x2="60" y2="51" stroke={GOLD} strokeWidth="0.8" opacity={0.4} />
      <path d="M 8 58 L 6 68 L 9 70 L 10 58" fill="none" stroke={GOLD} strokeWidth="1.5" opacity={0.4} strokeLinejoin="round" />
      <path d="M 72 58 L 74 68 L 71 70 L 70 58" fill="none" stroke={GOLD} strokeWidth="1.5" opacity={0.4} strokeLinejoin="round" />
    </svg>
  )
}
