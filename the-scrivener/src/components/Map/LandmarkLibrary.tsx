// ========================================
// 地标文库 — 搜索+过滤 ｜ 书脊 ｜ 卡片网格
// ========================================

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { Landmark, WorldMap, MapRegion } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { GOLD, GOLD_LIGHT, darken, ringColor } from '@/utils/color'

const LANDMARK_TYPE_LABELS: Record<string, string> = {
  capital: '王都', city: '城市', village: '村落', tribe: '部落', port: '港口',
  forest: '森林', lake: '湖泊', mountain: '山脉', ruins: '遗迹', cave: '洞穴',
  desert: '沙漠', glacier: '冰川', swamp: '沼泽', plains: '平原', volcano: '火山',
  isle: '海岛',
}

const ALL_TYPES = Object.keys(LANDMARK_TYPE_LABELS)

function getIconName(lm: Landmark): string {
  return lm.icon || 'star'
}


/** 在半径 r 的圆形内绘制中心符号（精简版，供 EmblemSvg 用） */
function drawEmblem(icon: string, r: number): React.ReactNode {
  const c = '#f0e4c8', sw = r * 0.28
  switch (icon) {
    case 'star': return <polygon points={`0,${-r} ${r*0.23},${-r*0.31} ${r*0.95},${-r*0.31} ${r*0.36},${r*0.12} ${r*0.59},${r*0.81} 0,${r*0.38} ${-r*0.59},${r*0.81} ${-r*0.36},${r*0.12} ${-r*0.95},${-r*0.31} ${-r*0.23},${-r*0.31}`} fill={c} stroke={c} strokeWidth={sw*0.4} strokeLinejoin="round" />
    case 'castle': return <rect x={-r*0.72} y={-r*0.72} width={r*1.44} height={r*1.44} fill="none" stroke={c} strokeWidth={sw} rx={r*0.12} />
    case 'house': return <><polygon points={`0,${-r*0.75} ${-r*0.7},${r*0.15} ${r*0.7},${r*0.15}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" /><rect x={-r*0.38} y={r*0.1} width={r*0.76} height={r*0.67} fill="none" stroke={c} strokeWidth={sw*0.7} /></>
    case 'tent': return <polygon points={`0,${-r} ${-r*0.85},${r*0.65} ${r*0.85},${r*0.65}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    case 'anchor': return <><circle cx={0} cy={-r*0.65} r={r*0.22} fill="none" stroke={c} strokeWidth={sw*0.8} /><line x1={-r*0.7} y1={-r*0.15} x2={r*0.7} y2={-r*0.15} stroke={c} strokeWidth={sw*0.8} strokeLinecap="round" /><line x1={0} y1={-r*0.43} x2={0} y2={r*0.75} stroke={c} strokeWidth={sw*0.9} strokeLinecap="round" /><path d={`M 0,${r*0.15} Q ${-r*0.6},${-r*0.1} ${-r*0.6},${r*0.65}`} fill="none" stroke={c} strokeWidth={sw*0.65} strokeLinecap="round" /><path d={`M 0,${r*0.15} Q ${r*0.6},${-r*0.1} ${r*0.6},${r*0.65}`} fill="none" stroke={c} strokeWidth={sw*0.65} strokeLinecap="round" /></>
    case 'tree': return <><polygon points={`0,${-r} ${-r*0.8},${r*0.45} ${r*0.8},${r*0.45}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" /><rect x={-r*0.12} y={r*0.4} width={r*0.24} height={r*0.4} fill={c} rx={r*0.06} /></>
    case 'peak': return <><polygon points={`${-r*0.9},${r*0.7} ${-r*0.35},${-r*0.7} 0,${r*0.1}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" /><polygon points={`0,${r*0.1} ${r*0.45},${-r*0.75} ${r*0.9},${r*0.7}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" /></>
    case 'ruins': return <polygon points={`0,${-r} ${r*0.72},0 0,${r} ${-r*0.72},0`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    case 'cave': return <><path d={`M ${-r*0.65},${r*0.75} L ${-r*0.55},${-r*0.3} A ${r*0.55},${r*0.55} 0 0,1 ${r*0.55},${-r*0.3} L ${r*0.65},${r*0.75}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" /><rect x={-r*0.25} y={r*0.1} width={r*0.5} height={r*0.5} rx={r*0.2} fill={c} opacity={0.45} /></>
    case 'sun': return <>{[0,45,90,135,180,225,270,315].map((deg) => { const rd=(deg*Math.PI)/180; return <line key={deg} x1={Math.cos(rd)*r*0.45} y1={Math.sin(rd)*r*0.45} x2={Math.cos(rd)*r*0.85} y2={Math.sin(rd)*r*0.85} stroke={c} strokeWidth={sw*0.6} strokeLinecap="round" /> })}<circle cx={0} cy={0} r={r*0.38} fill={c} /></>
    case 'cross': return <><rect x={-r*0.18} y={-r*0.85} width={r*0.36} height={r*1.7} rx={r*0.09} fill={c} /><rect x={-r*0.65} y={-r*0.18} width={r*1.3} height={r*0.36} rx={r*0.09} fill={c} /><circle cx={0} cy={0} r={r*0.2} fill="none" stroke={c} strokeWidth={sw*0.5} /></>
    case 'moon': return <path d={`M 0,${-r*0.85} A ${r*0.85},${r*0.85} 0 1,1 0,${r*0.85} A ${r*0.6},${r*0.6} 0 1,0 0,${-r*0.85} Z`} fill={c} />
    case 'shield': return <path d={`M 0,${-r*0.9} L ${r*0.65},${-r*0.4} L ${r*0.65},${r*0.2} Q ${r*0.65},${r*0.65} 0,${r*0.9} Q ${-r*0.65},${r*0.65} ${-r*0.65},${r*0.2} L ${-r*0.65},${-r*0.4} Z`} fill="none" stroke={c} strokeWidth={sw*0.8} strokeLinejoin="round" />
    case 'grain': return <><line x1={0} y1={r*0.85} x2={0} y2={-r*0.5} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />{[-0.2,0.05,0.3].map((y,i)=><circle key={`l${i}`} cx={-r*0.25} cy={r*y} r={r*0.12} fill={c} />)}{[-0.2,0.05,0.3].map((y,i)=><circle key={`r${i}`} cx={r*0.25} cy={r*y} r={r*0.12} fill={c} />)}</>
    case 'flame': return <path d={`M 0,${-r*0.9} Q ${r*0.55},${-r*0.3} ${r*0.35},${r*0.35} Q ${r*0.2},${r*0.7} 0,${r*0.85} Q ${-r*0.2},${r*0.7} ${-r*0.35},${r*0.35} Q ${-r*0.55},${-r*0.3} 0,${-r*0.9} Z`} fill={c} />
    case 'waves': return <><path d={`M ${-r*0.85},${-r*0.45} Q ${-r*0.35},${-r*0.8} 0,${-r*0.45} Q ${r*0.35},${-r*0.1} ${r*0.85},${-r*0.45}`} fill="none" stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" /><path d={`M ${-r*0.85},${r*0.05} Q ${-r*0.35},${-r*0.3} 0,${r*0.05} Q ${r*0.35},${r*0.4} ${r*0.85},${r*0.05}`} fill="none" stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" /><path d={`M ${-r*0.85},${r*0.55} Q ${-r*0.35},${r*0.2} 0,${r*0.55} Q ${r*0.35},${r*0.9} ${r*0.85},${r*0.55}`} fill="none" stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" /></>
    default: return <circle cx={0} cy={0} r={r*0.55} fill={c} />
  }
}

/** 渲染带徽记图形的圆形徽章 */
function EmblemSvg({ icon, color, size = 18 }: { icon: string; color: string; size?: number }) {
  const rc = ringColor(color), r = 10
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size}>
      <circle cx={0} cy={0} r={r} fill={color} stroke={rc} strokeWidth={1.6} />
      {drawEmblem(icon, 5)}
    </svg>
  )
}

export function LandmarkLibrary() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const landmarks = useAppStore((s) => s.landmarks) as Landmark[]
  const addLandmark = useAppStore((s) => s.addLandmark)
  const updateLandmark = useAppStore((s) => s.updateLandmark)
  const deleteLandmark = useAppStore((s) => s.deleteLandmark)
  const maps = useAppStore((s) => s.maps)
  const regions = useAppStore((s) => s.regions)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldLandmarks = useMemo(
    () => landmarks.filter((l) => l.worldId === currentWorldId),
    [landmarks, currentWorldId]
  )

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Landmark | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // 搜索 + 类型过滤 + 按名称去重（文库条目优先）
  const filtered = useMemo(() => {
    let results = worldLandmarks.filter((l) => !!l.name)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      results = results.filter((l) => l.name.toLowerCase().includes(q)
        || (l.region || '').toLowerCase().includes(q)
        || (l.description || '').toLowerCase().includes(q))
    }
    if (filterType) {
      results = results.filter((l) => l.type === filterType)
    }
    // 按名称去重：文库条目（无 mapId）优先，否则取第一个
    const seen = new Map<string, Landmark>()
    for (const l of results) {
      if (!seen.has(l.name)) { seen.set(l.name, l); continue }
      // 文库条目优先替换任何已有的地图条目
      const existing = seen.get(l.name)!
      const libEntry = !l.positions || Object.keys(l.positions).length === 0 || Object.keys(l.positions).every(k => !k)
    }
    results = Array.from(seen.values())
    results.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    return results
  }, [worldLandmarks, search, filterType])

  // 优先返回文库主条目（无 mapId），没有则返回传参本身
  const resolveMaster = (lm: Landmark): Landmark => {
    const master = worldLandmarks.find((l) => l.name === lm.name && (!l.positions || Object.keys(l.positions).length === 0 || !Object.keys(l.positions).some(k => k)))
    return master || lm
  }

  const handleJumpToMap = (lm: Landmark) => {
    const m = (() => { const p = lm.positions; if (!p) return null; const keys = Object.keys(p).filter(k => k); if (keys.length === 0) return null; return maps.find((mp) => mp.id === keys[0]) })()
    if (m) {
      useAppStore.getState().setCurrentMap(m.id)
      navigateTo('map', '地图编辑')
    }
  }

  // ── 左侧列表项 ──
  const listItem = (lm: Landmark, active: boolean) => (
    <div key={lm.id} onClick={() => setSelectedId(lm.id)}
      style={{
        padding: '9px 14px', borderRadius: '8px', cursor: 'pointer',
        fontSize: '14px', fontWeight: 400,
        color: active ? GOLD : 'var(--color-text)',
        background: active ? 'rgba(184,134,11,0.12)' : 'transparent',
        border: '1.5px solid transparent',
        borderColor: active ? GOLD : 'transparent',
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '3px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(184,134,11,0.08)'
        e.currentTarget.style.borderColor = GOLD_LIGHT
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'transparent'
        }
      }}>
      <span style={{ display:'inline-block', width:'8px', height:'8px', borderRadius:'50%',
        background: lm.color || GOLD, flexShrink: 0 }} />
      <span style={{ flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {lm.name}
      </span>
      <span style={{ fontSize:'10px', color:'var(--color-text-muted)', flexShrink: 0 }}>
        {LANDMARK_TYPE_LABELS[lm.type] || lm.type}
      </span>
    </div>
  )

  // ── 卡片 ──
  // 选中项优先解析为文库主条目
  const rawSelected = filtered.find((l) => l.id === selectedId)
  const selected = rawSelected ? resolveMaster(rawSelected) : undefined

  return (
    <div style={{ display:'flex', height:'100%', position:'relative' }}>
      {/* ═══════ 左侧面板 ═══════ */}
      <div style={{
        flex:'0 0 50%', minWidth:0, display:'flex', flexDirection:'column',
        padding:'24px 28px',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <h2 style={{ fontSize:'18px', color:GOLD, margin:0, letterSpacing:'2px' }}>地标文库</h2>
          <div onClick={goBack} style={{ padding:'4px 10px', borderRadius:'5px', cursor:'pointer',
            fontSize:'12px', color:'var(--color-text-light)', border:'1px solid var(--color-page-shadow)' }}>
            ← 返回
          </div>
        </div>

        <input className="input" placeholder="搜索地标..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom:'10px', fontSize:'13px', padding:'8px 12px' }} />

        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginBottom:'12px' }}>
          <FilterChip label="全部" active={filterType === ''} onClick={() => setFilterType('')} />
          {ALL_TYPES.map((t) => (
            <FilterChip key={t} label={LANDMARK_TYPE_LABELS[t]} active={filterType === t}
              onClick={() => setFilterType(filterType === t ? '' : t)} />
          ))}
        </div>

        <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginBottom:'8px' }}>
          {filtered.length} 个地标
        </div>

        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 10px', color:'var(--color-text-muted)', fontSize:'13px' }}>
              暂无匹配的地标
            </div>
          ) : (
            filtered.map((lm) => listItem(lm, lm.id === selectedId))
          )}
        </div>

        <div style={{ borderTop:'1px solid var(--color-page-shadow)', paddingTop:'12px', marginTop:'8px' }}>
          <div onClick={() => setShowCreate(true)} style={{
            padding:'10px 14px', borderRadius:'8px', cursor:'pointer',
            border:`1.5px dashed ${GOLD}55`, color:GOLD, fontSize:'13px',
            fontWeight:600, textAlign:'center', transition:'all 0.15s ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(184,134,11,0.08)'; e.currentTarget.style.borderColor=GOLD_LIGHT }}
            onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=`${GOLD}55` }}>
            + 创建新地标
          </div>
        </div>
      </div>

      {/* ═══════ 书脊（居中） ═══════ */}
      <div style={{
        width:'3px', flexShrink:0,
        background:'linear-gradient(90deg, #8b6914, #4a3728 50%, #8b6914)',
        boxShadow:'0 0 8px rgba(0,0,0,0.3), inset 0 0 4px rgba(0,0,0,0.2)',
      }} />
      <div style={{
        position:'absolute', top:0, bottom:0,
        left:'calc(50% - 8px)', width:'16px',
        background:'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)',
        pointerEvents:'none', zIndex:1,
      }} />

      {/* ═══════ 右侧：卡片网格 ═══════ */}
      <div style={{
        flex:'0 0 50%', minWidth:0, padding:'24px 28px', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 顶部信息 + 选中项详情条 */}
        {selected && (
          <div style={{
            display:'flex', alignItems:'center', gap:'14px',
            padding:'10px 14px', marginBottom:'12px', borderRadius:'10px',
            background:`${selected.color || GOLD}10`, border:`1.5px solid ${selected.color || GOLD}33`,
            flexShrink:0,
          }}>
            <EmblemSvg icon={selected.icon || 'star'} color={selected.color || GOLD} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'14px', fontWeight:600, color:'var(--color-text)' }}>{selected.name}</div>
              <div style={{ fontSize:'10px', color:'var(--color-text-muted)' }}>
                {LANDMARK_TYPE_LABELS[selected.type] || selected.type}
                {selected.region && ` · ${selected.region}`}
                {` · ${selected.size || 20}px`}
                {(()=>{ const p = selected.positions; if(!p) return ''; const k = Object.keys(p).filter(k=>k)[0]; if(!k) return ''; const m = maps.find(mp=>mp.id===k); return m ? ` · ${m.dimensionName}` : '' })()}
              </div>
            </div>
            <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
              <button className="btn btn-primary" style={{ fontSize:'12px', padding:'5px 12px' }}
                onClick={() => setEditing(selected)}>编辑</button>
              {(()=>{ const p = selected.positions; if(!p) return false; return Object.keys(p).filter(k=>k).length > 0 })() && (
                <button className="btn" style={{ fontSize:'12px', padding:'5px 12px' }}
                  onClick={() => handleJumpToMap(selected)}>地图 →</button>
              )}
              <button className="btn btn-danger" style={{ fontSize:'12px', padding:'5px 12px' }}
                onClick={() => { if(confirm(`删除「${selected.name}」？`)) { deleteLandmark(selected.id); setSelectedId(null) }}}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 卡片网格 */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%',
              color:'var(--color-text-muted)', fontSize:'14px' }}>
              选择或创建地标
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))',
              gap:'10px', alignContent:'start',
            }}>
              {filtered.map((lm) => (
                <LandmarkCard key={lm.id} lm={lm} maps={maps} regions={regions}
                  active={lm.id === selectedId}
                  onClick={() => setSelectedId(lm.id === selectedId ? null : lm.id)}
                  onDoubleClick={() => setEditing(resolveMaster(lm))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ 弹窗 ═══ */}
      {showCreate && (
        <LibraryLandmarkEditor
          lm={{ id:'', worldId:currentWorldId!, mapId:'', name:'', type:'city', color:GOLD, size:20, x:0, y:0 } as Landmark}
          onSave={(lm) => {
            addLandmark({ ...lm, x: 0, y: 0, size: lm.size || 20 })
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editing && (
        <LibraryLandmarkEditor
          lm={editing}
          onSave={(lm) => {
            updateLandmark(lm.id, {
              name: lm.name, type: lm.type, icon: lm.icon,
              region: lm.region, color: lm.color, size: lm.size, description: lm.description,
            })
            setEditing(null)
          }}
          onDelete={() => {
            if (confirm(`删除「${editing.name}」？`)) { deleteLandmark(editing.id); setEditing(null); setSelectedId(null) }
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ═══ 过滤标签 ═══
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      padding:'5px 12px', borderRadius:'6px', cursor:'pointer',
      fontSize:'12px', fontWeight:400,
      color:active?GOLD:'var(--color-text-light)',
      background:active?'rgba(184,134,11,0.12)':'transparent',
      border:'1px solid', borderColor:active?GOLD:'var(--color-page-shadow)',
    }}>{label}</div>
  )
}

// ═══ 地标卡片 ═══
// ═══ 图标选择器（与 MapPage 共用同一套 16 枚徽记） ═══
const LIB_ICON_OPTIONS = [
  { key:'star', label:'星徽' }, { key:'castle', label:'城徽' }, { key:'house', label:'屋徽' },
  { key:'tent', label:'帐徽' }, { key:'anchor', label:'锚徽' }, { key:'tree', label:'树徽' },
  { key:'peak', label:'山徽' }, { key:'ruins', label:'墟徽' }, { key:'cave', label:'洞徽' },
  { key:'sun', label:'日徽' }, { key:'cross', label:'圣徽' }, { key:'moon', label:'月徽' },
  { key:'shield', label:'盾徽' }, { key:'grain', label:'穗徽' }, { key:'flame', label:'火徽' },
  { key:'waves', label:'水徽' },
]
const LIB_TYPE_DEFAULT: Record<string,string> = {
  capital:'star', city:'castle', village:'house', tribe:'tent', port:'anchor',
  forest:'tree', lake:'waves', mountain:'peak', ruins:'ruins', cave:'cave',
  desert:'sun', glacier:'moon', swamp:'cross', plains:'grain', volcano:'flame', isle:'shield',
}

function IconPicker({ icon, tp, color, onChange }: { icon: string; tp: string; color: string; onChange: (k: string) => void }) {
  const effective = icon || LIB_TYPE_DEFAULT[tp] || 'castle'
  const rc = ringColor(color)
  return (
    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
      {LIB_ICON_OPTIONS.map((opt) => {
        const active = opt.key === effective
        return (
          <div key={opt.key} onClick={() => onChange(opt.key)} title={opt.label}
            style={{
              width:'32px', height:'32px', borderRadius:'7px',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              border: active ? `2px solid ${GOLD_LIGHT}` : '1.5px solid rgba(139,105,20,0.25)',
              background: active ? 'rgba(184,134,11,0.1)' : 'rgba(245,230,200,0.25)',
              boxShadow: active ? `0 0 6px ${GOLD}33` : 'none',
              transition:'all 0.12s ease', transform: active ? 'scale(1.1)' : 'scale(1)',
            }}>
            <svg viewBox="-10 -10 20 20" width="18" height="18">
              <circle cx={0} cy={0} r={9} fill={color} stroke={rc} strokeWidth={1.5} />
              {drawEmblem(opt.key, 5)}
            </svg>
          </div>
        )
      })}
    </div>
  )
}

function LandmarkCard({ lm, maps, regions, active, onClick, onDoubleClick }: {
  lm: Landmark; maps: WorldMap[]; regions: MapRegion[]; active: boolean; onClick: () => void; onDoubleClick: () => void;
}) {
  const map = (() => { const p = lm.positions; if (!p) return null; const k = Object.keys(p).filter(k=>k)[0]; return k ? maps.find((m) => m.id === k) : null })()
  const regionObj = regions.find((r) => r.name === lm.region && r.worldId === lm.worldId)
  const borderColor = lm.color || GOLD

  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick}
      style={{
        background: active ? `${borderColor}16` : 'rgba(245,230,200,0.35)',
        border: '1.5px solid transparent',
        borderColor: active ? borderColor : 'var(--color-page-shadow)',
        borderRadius:'10px', padding:'10px 12px', cursor:'pointer',
        display:'flex', flexDirection:'column', gap:'4px',
        position:'relative', overflow:'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = borderColor
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.08), 0 0 12px ${borderColor}22`
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-page-shadow)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.background = 'rgba(245,230,200,0.35)'
        } else {
          e.currentTarget.style.borderColor = borderColor
          e.currentTarget.style.boxShadow = 'none'
        }
      }}>
      {/* 装饰顶条 */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'2.5px',
        background:borderColor, borderRadius:'10px 10px 0 0', opacity:0.6,
        transition:'opacity 0.2s ease',
      }} />

      {/* 图标 + 名称行 */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'3px' }}>
        <EmblemSvg icon={lm.icon || 'star'} color={lm.color || GOLD} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize:'12px', fontWeight:600, color:'var(--color-text)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{lm.name}</div>
          <div style={{ fontSize:'10px', color:'var(--color-text-muted)' }}>
            {LANDMARK_TYPE_LABELS[lm.type] || lm.type}
          </div>
        </div>
      </div>

      {/* 信息标签行 */}
      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
        {lm.region && (
          <span style={{ fontSize:'9px', padding:'1px 6px', borderRadius:'3px',
            color: regionObj ? regionObj.color : 'var(--color-text-muted)',
            background: `${regionObj ? regionObj.color : '#888'}14`,
            border:`1px solid ${regionObj ? regionObj.color : '#888'}22`,
          }}>{lm.region}</span>
        )}
        {map && (
          <span style={{ fontSize:'9px', padding:'1px 6px', borderRadius:'3px',
            color:'var(--color-text-muted)', background:'rgba(139,105,20,0.08)',
            border:'1px solid rgba(139,105,20,0.18)',
          }}>{map.dimensionName}</span>
        )}
        {(!lm.positions || Object.keys(lm.positions).length === 0 || !Object.keys(lm.positions).some(k=>k)) && (
          <span style={{ fontSize:'9px', padding:'1px 6px', borderRadius:'3px',
            color:'var(--color-text-muted)', fontStyle:'italic',
          }}>仅文库</span>
        )}
        <span style={{ fontSize:'9px', padding:'1px 6px', borderRadius:'3px',
          color:'var(--color-text-muted)', background:'rgba(139,105,20,0.06)',
          border:'1px solid rgba(139,105,20,0.12)',
        }}>{lm.size || 20}px</span>
      </div>

      {/* 描述片段 */}
      {lm.description && (
        <div style={{
          fontSize:'11px', color:'var(--color-text-light)', lineHeight:'1.5',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
          overflow:'hidden',
        }}>{lm.description}</div>
      )}
    </div>
  )
}

// ═══ 地标编辑器（文库） ═══
function LibraryLandmarkEditor({ lm, onSave, onDelete, onClose }: {
  lm: Landmark; onSave: (lm: Landmark) => void; onDelete?: () => void; onClose: () => void;
}) {
  const isNew = !lm.id
  const [nm, setNm] = useState(lm.name)
  const [tp, setTp] = useState(lm.type)
  const [icon, setIcon] = useState(lm.icon || '')
  const [region, setRegion] = useState(lm.region || '')
  const [cl, setCl] = useState(lm.color || GOLD)
  const [sz, setSz] = useState(lm.size || 20)
  const [desc, setDesc] = useState(lm.description || '')

  const allWorldLandmarks = useAppStore((s) => s.landmarks).filter((l) => l.worldId === lm.worldId)
  const sameNameExists = !!(nm.trim() && allWorldLandmarks.some(
    (l) => l.name === nm.trim() && l.id !== lm.id
  ))
  const sameNameInLibrary = sameNameExists && allWorldLandmarks.some(
    (l) => l.name === nm.trim() && l.id !== lm.id
  )
  const crossMapOnly = sameNameExists && !sameNameInLibrary // 仅在跨地图存在 → 允许创建但提示

  const hs = () => {
    if (!nm.trim()) return
    if (sameNameInLibrary) return
    onSave({ ...lm, name: nm.trim(), type: tp, icon: icon || undefined, region: region || undefined, color: cl, size: sz, description: desc })
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth:'540px', width:'90%' }}>
        <h2>{isNew ? '创建地标' : '编辑地标'}</h2>
        <div className="form-group"><label>名称 *</label>
          <input className="input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="地标名称..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && nm.trim() && !sameNameInLibrary) hs() }} />
          {sameNameInLibrary && (
            <div style={{ marginTop:'5px', fontSize:'12px', color:'#b43c3c', display:'flex', alignItems:'center', gap:'4px' }}>
              <span>✕</span> 名称唯一，该地标已存在
            </div>
          )}
          {crossMapOnly && (
            <div style={{ marginTop:'5px', fontSize:'12px', color: GOLD, display:'flex', alignItems:'center', gap:'4px' }}>
              <span>ℹ</span> 已有同名标签，将自动继承其属性
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:'12px' }}>
          <div className="form-group" style={{ flex:1 }}><label>类型</label>
            <select className="input" value={tp} onChange={(e) => setTp(e.target.value as Landmark['type'])}>
              {ALL_TYPES.map((t) => (<option key={t} value={t}>{LANDMARK_TYPE_LABELS[t]}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ flex:1 }}><label>所属区域</label>
            <input className="input" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="可选..." />
          </div>
        </div>
        <div className="form-group"><label>图标</label>
          <IconPicker icon={icon} tp={tp} color={cl} onChange={setIcon} />
        </div>
        <div className="form-group"><label>描述</label>
          <textarea className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="地标描述..." rows={3}
            style={{ resize:'vertical', fontFamily:'inherit' }} />
        </div>
        <div style={{ display:'flex', gap:'12px' }}>
          <div className="form-group" style={{ flex:1 }}><label>颜色</label>
            <ColorPicker value={cl} onChange={setCl} />
          </div>
          <div className="form-group" style={{ flex:1 }}><label>大小: {sz}px</label>
            <input type="range" min="6" max="48" value={sz} onChange={(e) => setSz(Number(e.target.value))}
              style={{ width:'100%', accentColor:GOLD }} />
          </div>
        </div>
        <div className="form-actions" style={{ justifyContent:'space-between' }}>
          <div>{onDelete && <button className="btn btn-danger" onClick={onDelete}>删除</button>}</div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn" onClick={onClose}>取消</button>
            <button className="btn btn-primary" disabled={!nm.trim() || sameNameInLibrary} onClick={hs}>{isNew ? '创建' : '保存'}</button>
          </div>
        </div>
      </div>
    </div>, document.body
  )
}
