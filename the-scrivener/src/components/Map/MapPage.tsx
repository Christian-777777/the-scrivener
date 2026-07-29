// ========================================
// 世界地图 - 可缩放画布 + 地标 + 区域
// 坐标空间: 1200 × 800
// ========================================

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { Landmark, MapRegion } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { GOLD, GOLD_LIGHT, darken, ringColor, hexAlpha } from '@/utils/color'

const COORD_W = 1200
const COORD_H = 800
const LANDMARK_TYPES: { key: Landmark['type']; label: string }[] = [
  { key: 'capital',  label: '王都' },
  { key: 'city',     label: '城市' },
  { key: 'village',  label: '村落' },
  { key: 'tribe',    label: '部落' },
  { key: 'port',     label: '港口' },
  { key: 'forest',   label: '森林' },
  { key: 'lake',     label: '湖泊' },
  { key: 'mountain', label: '山脉' },
  { key: 'ruins',    label: '遗迹' },
  { key: 'cave',     label: '洞穴' },
  { key: 'desert',   label: '沙漠' },
  { key: 'glacier',  label: '冰川' },
  { key: 'swamp',    label: '沼泽' },
  { key: 'plains',   label: '平原' },
  { key: 'volcano',  label: '火山' },
  { key: 'isle',     label: '海岛' },
]

type MapMode = 'view' | 'landmark' | 'region'

const minMax = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// ═══ 中世纪纹章徽记系统 ═══
//
// 设计思路：
//   每个图标是一个统一的圆形徽章（像蜡封或硬币），
//   外层是深色描边环，中层是地标颜色填充，
//   中心用浅色（羊皮纸色）绘制简洁的符号。
//   视觉统一 = 美术感的关键。
//
const ICON_OPTIONS = [
  { key: 'star',      label: '星徽' },
  { key: 'castle',    label: '城徽' },
  { key: 'house',     label: '屋徽' },
  { key: 'tent',      label: '帐徽' },
  { key: 'anchor',    label: '锚徽' },
  { key: 'tree',      label: '树徽' },
  { key: 'peak',      label: '山徽' },
  { key: 'ruins',     label: '墟徽' },
  { key: 'cave',      label: '洞徽' },
  { key: 'sun',       label: '日徽' },
  { key: 'cross',     label: '圣徽' },
  { key: 'moon',      label: '月徽' },
  { key: 'shield',    label: '盾徽' },
  { key: 'grain',     label: '穗徽' },
  { key: 'flame',     label: '火徽' },
  { key: 'waves',     label: '水徽' },
]

const TYPE_DEFAULT_ICON: Record<string, string> = {
  capital: 'star',   city: 'castle',    village: 'house',
  tribe: 'tent',      port: 'anchor',    forest: 'tree',
  lake: 'waves',      mountain: 'peak',  ruins: 'ruins',
  cave: 'cave',       desert: 'sun',     glacier: 'moon',
  swamp: 'cross',     plains: 'grain',   volcano: 'flame',
  isle: 'shield',
}

function getIconName(lm: Landmark): string {
  return lm.icon || TYPE_DEFAULT_ICON[lm.type] || 'castle'
}



/** 徽章中心符号色：羊皮纸浅色，与地图背景协调 */
const EMBLEM_COLOR = '#f0e4c8'

/**
 * 渲染圆形徽章：
 *   - 外环用 ringColor (深色)
 *   - 填充用地标颜色
 *   - 中心符号用羊皮纸色
 */
function renderIconShape(icon: string, s: number, color: string): React.ReactNode {
  const rc = ringColor(color)
  const r = 9*s          // 外环半径
  const sr = 5.5*s       // 符号缩放半径
  const ringW = 1.8*s    // 环宽

  // 圆形徽章基底（所有图标共享）
  const badge = (
    <circle cx={0} cy={0} r={r} fill={color} stroke={rc} strokeWidth={ringW} />
  )

  // 中心符号
  const symbol = renderEmblem(icon, sr)

  return <>{badge}{symbol}</>
}

/** 在半径 r 的圆形内绘制简洁中心符号 */
function renderEmblem(icon: string, r: number): React.ReactNode {
  const c = EMBLEM_COLOR
  const sw = r * 0.28  // 线宽与半径成比例

  switch (icon) {
    // ★ 五角星
    case 'star':
      return <polygon
        points={`0,${-r} ${r*0.23},${-r*0.31} ${r*0.95},${-r*0.31} ${r*0.36},${r*0.12} ${r*0.59},${r*0.81} 0,${r*0.38} ${-r*0.59},${r*0.81} ${-r*0.36},${r*0.12} ${-r*0.95},${-r*0.31} ${-r*0.23},${-r*0.31}`}
        fill={c} stroke={c} strokeWidth={sw*0.4} strokeLinejoin="round" />

    // □ 方形（城壁）
    case 'castle':
      return <rect x={-r*0.72} y={-r*0.72} width={r*1.44} height={r*1.44} fill="none" stroke={c} strokeWidth={sw} rx={r*0.12} />

    // ⌂ 屋形
    case 'house':
      return (<>
        <polygon points={`0,${-r*0.75} ${-r*0.7},${r*0.15} ${r*0.7},${r*0.15}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        <rect x={-r*0.38} y={r*0.1} width={r*0.76} height={r*0.67} fill="none" stroke={c} strokeWidth={sw*0.7} />
      </>)

    // ▲ 三角（营帐）
    case 'tent':
      return <polygon points={`0,${-r} ${-r*0.85},${r*0.65} ${r*0.85},${r*0.65}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />

    // ⚓ 船锚
    case 'anchor':
      return (<>
        <circle cx={0} cy={-r*0.65} r={r*0.22} fill="none" stroke={c} strokeWidth={sw*0.8} />
        <line x1={-r*0.7} y1={-r*0.15} x2={r*0.7} y2={-r*0.15} stroke={c} strokeWidth={sw*0.8} strokeLinecap="round" />
        <line x1={0} y1={-r*0.43} x2={0} y2={r*0.75} stroke={c} strokeWidth={sw*0.9} strokeLinecap="round" />
        <path d={`M 0,${r*0.15} Q ${-r*0.6},${-r*0.1} ${-r*0.6},${r*0.65}`} fill="none" stroke={c} strokeWidth={sw*0.65} strokeLinecap="round" />
        <path d={`M 0,${r*0.15} Q ${r*0.6},${-r*0.1} ${r*0.6},${r*0.65}`} fill="none" stroke={c} strokeWidth={sw*0.65} strokeLinecap="round" />
      </>)

    // 松树：三角形树冠 + 短干
    case 'tree':
      return (<>
        <polygon points={`0,${-r} ${-r*0.8},${r*0.45} ${r*0.8},${r*0.45}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        <rect x={-r*0.12} y={r*0.4} width={r*0.24} height={r*0.4} fill={c} rx={r*0.06} />
      </>)

    // ⛰ 双峰
    case 'peak':
      return (<>
        <polygon points={`${-r*0.9},${r*0.7} ${-r*0.35},${-r*0.7} 0,${r*0.1}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        <polygon points={`0,${r*0.1} ${r*0.45},${-r*0.75} ${r*0.9},${r*0.7}`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      </>)

    // ◆ 菱形（废墟/遗迹）
    case 'ruins':
      return <polygon points={`0,${-r} ${r*0.72},0 0,${r} ${-r*0.72},0`} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />

    // 洞窟：拱形入口
    case 'cave':
      return (<>
        <path d={`M ${-r*0.65},${r*0.75} L ${-r*0.55},${-r*0.3} A ${r*0.55},${r*0.55} 0 0,1 ${r*0.55},${-r*0.3} L ${r*0.65},${r*0.75}`}
          fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        <rect x={-r*0.25} y={r*0.1} width={r*0.5} height={r*0.5} rx={r*0.2} fill={c} opacity={0.45} />
      </>)

    // ☀ 太阳：圆 + 八射
    case 'sun':
      return (<>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          return <line key={deg} x1={Math.cos(rad)*r*0.45} y1={Math.sin(rad)*r*0.45}
            x2={Math.cos(rad)*r*0.85} y2={Math.sin(rad)*r*0.85}
            stroke={c} strokeWidth={sw*0.6} strokeLinecap="round" />
        })}
        <circle cx={0} cy={0} r={r*0.38} fill={c} />
      </>)

    // ✚ 十字
    case 'cross':
      return (<>
        <rect x={-r*0.18} y={-r*0.85} width={r*0.36} height={r*1.7} rx={r*0.09} fill={c} />
        <rect x={-r*0.65} y={-r*0.18} width={r*1.3} height={r*0.36} rx={r*0.09} fill={c} />
        <circle cx={0} cy={0} r={r*0.2} fill="none" stroke={c} strokeWidth={sw*0.5} />
      </>)

    // ☾ 月牙
    case 'moon':
      return <path d={`M 0,${-r*0.85} A ${r*0.85},${r*0.85} 0 1,1 0,${r*0.85} A ${r*0.6},${r*0.6} 0 1,0 0,${-r*0.85} Z`} fill={c} />

    // 盾形
    case 'shield':
      return <path d={`M 0,${-r*0.9} L ${r*0.65},${-r*0.4} L ${r*0.65},${r*0.2} Q ${r*0.65},${r*0.65} 0,${r*0.9} Q ${-r*0.65},${r*0.65} ${-r*0.65},${r*0.2} L ${-r*0.65},${-r*0.4} Z`}
        fill="none" stroke={c} strokeWidth={sw*0.8} strokeLinejoin="round" />

    // 麦穗：中茎 + 三对侧粒
    case 'grain':
      return (<>
        <line x1={0} y1={r*0.85} x2={0} y2={-r*0.5} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
        {[-0.2, 0.05, 0.3].map((y, i) => (
          <circle key={`l${i}`} cx={-r*0.25} cy={r*y} r={r*0.12} fill={c} />
        ))}
        {[-0.2, 0.05, 0.3].map((y, i) => (
          <circle key={`r${i}`} cx={r*0.25} cy={r*y} r={r*0.12} fill={c} />
        ))}
      </>)

    // 火焰
    case 'flame':
      return <path d={`M 0,${-r*0.9} Q ${r*0.55},${-r*0.3} ${r*0.35},${r*0.35} Q ${r*0.2},${r*0.7} 0,${r*0.85} Q ${-r*0.2},${r*0.7} ${-r*0.35},${r*0.35} Q ${-r*0.55},${-r*0.3} 0,${-r*0.9} Z`}
        fill={c} />

    // 水纹：三道横波
    case 'waves':
      return (<>
        <path d={`M ${-r*0.85},${-r*0.45} Q ${-r*0.35},${-r*0.8} 0,${-r*0.45} Q ${r*0.35},${-r*0.1} ${r*0.85},${-r*0.45}`}
          fill="none" stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
        <path d={`M ${-r*0.85},${r*0.05} Q ${-r*0.35},${-r*0.3} 0,${r*0.05} Q ${r*0.35},${r*0.4} ${r*0.85},${r*0.05}`}
          fill="none" stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
        <path d={`M ${-r*0.85},${r*0.55} Q ${-r*0.35},${r*0.2} 0,${r*0.55} Q ${r*0.35},${r*0.9} ${r*0.85},${r*0.55}`}
          fill="none" stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
      </>)

    default:
      return <circle cx={0} cy={0} r={r*0.55} fill={c} />
  }
}

// ═══ 羊皮纸背景 ═══
function ParchmentBg({ w, h }: { w: number; h: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: `
        radial-gradient(ellipse at 30% 20%, #f0e0c0 0%, #e8d5b0 40%, #dcc8a0 100%),
        repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,105,20,0.03) 3px, rgba(139,105,20,0.03) 6px)
      `,
      border: '3px solid var(--color-page-shadow)',
      borderRadius: '4px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: '12px',
        border: '1.5px solid rgba(139,105,20,0.2)',
        borderRadius: '2px', pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', top: '24px', right: '24px', width: '60px', height: '60px', opacity: 0.15, pointerEvents: 'none' }}>
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="28" fill="none" stroke="#8b6914" strokeWidth="1" />
          <circle cx="30" cy="30" r="24" fill="none" stroke="#8b6914" strokeWidth="0.5" />
          <polygon points="30,5 34,28 30,30 26,28" fill="#8b6914" />
          <polygon points="30,55 26,32 30,30 34,32" fill="#8b691488" />
          <polygon points="5,30 28,26 30,30 28,34" fill="#8b6914" />
          <polygon points="55,30 32,34 30,30 32,26" fill="#8b691488" />
          <circle cx="30" cy="30" r="3" fill="#8b6914" />
        </svg>
      </div>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
        {Array.from({ length: 23 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={h} stroke="#8b6914" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 50} x2={w} y2={(i + 1) * 50} stroke="#8b6914" strokeWidth="0.5" />
        ))}
      </svg>
    </div>
  )
}

// ═══ 地标悬浮信息窗 ═══
function LandmarkPopup({ lm, onClose, mapMode, onEdit, anchor }: {
  lm: Landmark; onClose: () => void; mapMode: MapMode; onEdit: () => void; anchor: { x: number; y: number } | null;
}) {
  // 没有锚点则回退到居中
  const hasAnchor = anchor != null
  const popupWidth = 280
  const offsetFromIcon = 28 // 图标右下偏移

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'fixed',
        ...(hasAnchor
          ? { left: Math.min(anchor!.x + offsetFromIcon, window.innerWidth - popupWidth - 16), top: Math.min(anchor!.y + offsetFromIcon, window.innerHeight - 240) }
          : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }),
        width: `${popupWidth}px`, padding: '16px 20px', borderRadius: '12px',
        background: hexAlpha(lm.color, 0.18),
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1.5px solid ${hexAlpha(lm.color, 0.45)}`,
        boxShadow: `0 6px 24px rgba(0,0,0,0.3), 0 0 16px ${hexAlpha(lm.color, 0.25)}`,
        zIndex: 501,
        animation: 'popupFadeIn 0.18s ease',
      }}>
        <style>{`
          @keyframes popupFadeIn {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div style={{ fontSize: '11px', color: hexAlpha(lm.color, 0.85), marginBottom: '3px', fontWeight: 500 }}>
          {LANDMARK_TYPES.find(t => t.key === lm.type)?.label || lm.type}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>{lm.name}</div>
        {lm.region && <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginBottom: '4px' }}>所属区域: {lm.region}</div>}
        <div style={{ fontSize: '13px', color: 'var(--color-text-light)', lineHeight: '1.7', marginBottom: '14px' }}>{lm.description || '暂无描述'}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {mapMode === 'landmark' && <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { onEdit(); onClose() }}>编辑</button>}
          <button className="btn" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>, document.body)
}

// ═══ 地标编辑器弹窗 ═══
function LandmarkEditor({ lm, onSave, onDelete, onClose }: {
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

  // 同名检测：仅当此名称已存在于当前地图时才阻止
  const allWorldLm = useAppStore((s) => s.landmarks).filter((l) => l.worldId === lm.worldId)
  const currentMapId = useAppStore((s) => s.currentMapId)
  const alreadyOnMap = isNew && !!(nm.trim() && allWorldLm.some(
    (l) => l.name === nm.trim() && l.positions?.[currentMapId || '']
  ))
  const existsInWorld = isNew && !alreadyOnMap && !!(nm.trim() && allWorldLm.some(
    (l) => l.name === nm.trim()
  ))

  const hs = () => {
    if (!nm.trim() || alreadyOnMap) return
    onSave({ ...lm, name: nm.trim(), type: tp, icon: icon || undefined, region: region || undefined, color: cl, size: sz, description: desc })
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '90%' }}>
        <h2>{isNew ? '添加地标' : '编辑地标'}</h2>
        <div className="form-group"><label>名称 *</label>
          <input className="input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="地标名称..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && nm.trim() && !alreadyOnMap) hs() }} />
          {alreadyOnMap && (
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#b43c3c', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>✕</span> 该地图上已存在同名地标
            </div>
          )}
          {!alreadyOnMap && existsInWorld && (
            <div style={{ marginTop: '5px', fontSize: '12px', color: GOLD, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>ℹ</span> 已有同名标签，将自动继承其属性
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="form-group" style={{ flex: 1 }}><label>类型</label>
            <select className="input" value={tp} onChange={(e) => setTp(e.target.value as Landmark['type'])}>
              {LANDMARK_TYPES.map((t) => (<option key={t.key} value={t.key}>{t.label}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}><label>所属区域</label>
            <input className="input" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="可选..." />
          </div>
        </div>
        <div className="form-group"><label>图标</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ICON_OPTIONS.map((opt) => {
              const sel = icon || TYPE_DEFAULT_ICON[tp] || 'circle'
              const active = opt.key === sel
              return (
                <div key={opt.key} onClick={() => setIcon(opt.key)}
                  title={opt.label}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    border: active ? `2.5px solid ${GOLD_LIGHT}` : '1.5px solid rgba(139,105,20,0.3)',
                    background: active ? 'rgba(184,134,11,0.12)' : 'rgba(245,230,200,0.3)',
                    boxShadow: active ? `0 0 8px ${GOLD}44` : 'none',
                    transition: 'all 0.15s ease',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  <svg viewBox="-12 -12 24 24" width="20" height="20">
                    {renderIconShape(opt.key, 1, cl)}
                  </svg>
                </div>
              )
            })}
          </div>
        </div>
        <div className="form-group"><label>描述</label>
          <textarea className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="地标描述..." rows={3}
            style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="form-group" style={{ flex: 1 }}><label>颜色</label>
            <ColorPicker value={cl} onChange={setCl} />
          </div>
          <div className="form-group" style={{ flex: 1 }}><label>大小: {sz}px</label>
            <input type="range" min="4" max="48" value={sz} onChange={(e) => setSz(Number(e.target.value))}
              style={{ width: '100%', accentColor: GOLD }} />
          </div>
        </div>
        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <div>{onDelete && <button className="btn btn-danger" onClick={onDelete}>删除</button>}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={onClose}>取消</button>
            <button className="btn btn-primary" disabled={!nm.trim() || alreadyOnMap} onClick={hs}>{isNew ? '添加' : '保存'}</button>
          </div>
        </div>
      </div>
    </div>, document.body)
}

// ═══ 区域编辑器弹窗 ═══
function RegionEditor({ region, onSave, onDelete, onClose }: {
  region: MapRegion; onSave: (r: MapRegion) => void; onDelete?: () => void; onClose: () => void;
}) {
  const isNew = !region.id
  const [nm, setNm] = useState(region.name)
  const [belonging, setBelonging] = useState(region.belonging || '')
  const [cl, setCl] = useState(region.color || '#b43c3c')
  const [bw, setBw] = useState(region.borderWidth || 2)

  const hs = () => {
    if (!nm.trim()) return
    onSave({ ...region, name: nm.trim(), belonging: belonging || undefined, color: cl, borderWidth: bw })
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '90%' }}>
        <h2>{isNew ? '创建区域' : '编辑区域'}</h2>
        <div className="form-group"><label>区域名称 *</label>
          <input className="input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="区域名称..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && nm.trim()) hs() }} />
        </div>
        <div className="form-group"><label>所属势力</label>
          <input className="input" value={belonging} onChange={(e) => setBelonging(e.target.value)} placeholder="可选..." />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="form-group" style={{ flex: 1 }}><label>颜色</label>
            <ColorPicker value={cl} onChange={setCl} />
          </div>
          <div className="form-group" style={{ flex: 1 }}><label>边框: {bw}px</label>
            <input type="range" min="1" max="6" value={bw} onChange={(e) => setBw(Number(e.target.value))}
              style={{ width: '100%', accentColor: GOLD }} />
          </div>
        </div>
        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <div>{onDelete && <button className="btn btn-danger" onClick={onDelete}>删除</button>}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={onClose}>取消</button>
            <button className="btn btn-primary" disabled={!nm.trim()} onClick={hs}>{isNew ? '创建' : '保存'}</button>
          </div>
        </div>
      </div>
    </div>, document.body)
}

// ═══ 创建地图弹窗 ═══
function CreateMapModal({ onClose }: { onClose: () => void }) {
  const [nm, setNm] = useState('')
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const addMap = useAppStore((s) => s.addMap)

  const h = () => {
    if (!nm.trim() || !currentWorldId) return
    addMap(nm.trim(), currentWorldId)
    onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <h2>创建维度/地图</h2>
        <div className="form-group"><label>地图名称 *</label>
          <input className="input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="如：主大陆、北境、灵界..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') h() }} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" disabled={!nm.trim()} onClick={h}>创建</button>
        </div>
      </div>
    </div>, document.body)
}

// ═══════════════════════════════════════════
// 地图主页面
// ═══════════════════════════════════════════
export function MapPage() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const maps = useAppStore((s) => s.maps)
  const currentMapId = useAppStore((s) => s.currentMapId)
  const setCurrentMap = useAppStore((s) => s.setCurrentMap)
  const addLandmark = useAppStore((s) => s.addLandmark)
  const updateLandmark = useAppStore((s) => s.updateLandmark)
  const deleteLandmark = useAppStore((s) => s.deleteLandmark)
  const addRegion = useAppStore((s) => s.addRegion)
  const updateRegion = useAppStore((s) => s.updateRegion)
  const deleteRegion = useAppStore((s) => s.deleteRegion)
  const updateMap = useAppStore((s) => s.updateMap)
  const deleteMap = useAppStore((s) => s.deleteMap)
  const goBack = useAppStore((s) => s.goBack)

  const worldMaps = maps.filter((m) => m.worldId === currentWorldId)
  const currentMap = worldMaps.find((m) => m.id === currentMapId) || worldMaps[0] || null
  const allWorldLandmarks = useAppStore((s) => s.landmarks).filter((l) => l.worldId === currentWorldId)
  const landmarks = allWorldLandmarks.filter((l) => l.positions?.[currentMapId || ''])
  const getPos = (lm: Landmark) => lm.positions?.[currentMapId || ''] || { x: lm.x, y: lm.y }
  const regions = (currentMap?.regions || []) as MapRegion[]

const [mapMode, setMapMode] = useState<MapMode>('view')
  const [scale, setScale] = useState(0.65)
  const [offsetX, setOffsetX] = useState(60)
  const [offsetY, setOffsetY] = useState(40)

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null)
  const [popupAnchor, setPopupAnchor] = useState<{ x: number; y: number } | null>(null)
  const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null)
  const [editingRegion, setEditingRegion] = useState<MapRegion | null>(null)

  const [drawing, setDrawing] = useState<{ x: number; y: number }[]>([])
  const [isBrushing, setIsBrushing] = useState(false)
  const [brushColor, setBrushColor] = useState('#b43c3c')
  const [brushSize, setBrushSize] = useState(4)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [screenCursor, setScreenCursor] = useState({ x: 0, y: 0 })

  const [dragging, setDragging] = useState<{ lmId: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [panning, setPanning] = useState<{ startX: number; startY: number; origOffX: number; origOffY: number } | null>(null)

  const [showCreateMap, setShowCreateMap] = useState(false)
  const [showMapList, setShowMapList] = useState(false)
  const dragPosRef = useRef<{ x: number; y: number } | null>(null)
  const [, setDragTick] = useState(0)
  const [hoveredLmId, setHoveredLmId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const screenToCoord = useCallback((sx: number, sy: number) => {
    const el = containerRef.current; if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return { x: (sx - r.left - offsetX) / scale, y: (sy - r.top - offsetY) / scale }
  }, [scale, offsetX, offsetY])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const el = containerRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left; const my = e.clientY - rect.top
    const imgX = (mx - offsetX) / scale; const imgY = (my - offsetY) / scale
    const ns = minMax(scale * (e.deltaY > 0 ? 0.9 : 1.111), 0.15, 4)
    setScale(ns); setOffsetX(mx - imgX * ns); setOffsetY(my - imgY * ns)
  }, [scale, offsetX, offsetY])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    if (dragging) return
    const target = e.target as Element
    const lmEl = target.closest('[data-landmark-id]')
    if (lmEl) {
      // 查看模式下点击地标 → 不启动平移，防止连续渲染导致悬浮窗抖动
      if (mapMode === 'view') return
      if (mapMode === 'landmark') {
        e.preventDefault(); e.stopPropagation()
        const lmId = lmEl.getAttribute('data-landmark-id')!
        const lm = landmarks.find((l) => l.id === lmId)
        if (!lm) return
        setDragging({ lmId, startX: e.clientX, startY: e.clientY, origX: getPos(lm).x, origY: getPos(lm).y })
        return
      }
    }
    setPanning({ startX: e.clientX, startY: e.clientY, origOffX: offsetX, origOffY: offsetY })
  }, [mapMode, dragging, landmarks, offsetX, offsetY])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current!
    const rect = el.getBoundingClientRect()
    setScreenCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    const c = screenToCoord(e.clientX, e.clientY)
    setCursorPos(c)
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / scale
      const dy = (e.clientY - dragging.startY) / scale
      dragPosRef.current = { x: dragging.origX + dx, y: dragging.origY + dy }
      setDragTick((t) => t + 1)
      return
    }
    if (panning) {
      setOffsetX(panning.origOffX + (e.clientX - panning.startX))
      setOffsetY(panning.origOffY + (e.clientY - panning.startY))
    }
  }, [dragging, panning, scale, screenToCoord])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const dx = Math.abs(e.clientX - dragging.startX)
      const dy = Math.abs(e.clientY - dragging.startY)
      if (dx < 3 && dy < 3) {
        const lm = landmarks.find((l) => l.id === dragging.lmId)
        if (lm && mapMode === 'view') setSelectedLandmark(lm)
      } else {
        // 拖拽结束，同步更新 positions
        const lm = allWorldLandmarks.find((l) => l.id === dragging.lmId)
        const newPositions = { ...(lm?.positions || {}), [currentMapId!]: { x: dragPosRef.current!.x, y: dragPosRef.current!.y } }
        updateLandmark(dragging.lmId, { x: dragPosRef.current!.x, y: dragPosRef.current!.y, positions: newPositions })
      }
      dragPosRef.current = null
      setDragging(null)
      return
    }
    if (panning) {
      const dx = Math.abs(e.clientX - panning.startX)
      const dy = Math.abs(e.clientY - panning.startY)
      if (dx < 3 && dy < 3) {
// region drawing: brush-based (mousedown→stroke→mouseup close)
      }
      setPanning(null)
    }
  }, [dragging, panning, landmarks, mapMode, currentMap, currentWorldId, screenToCoord])

  const startBrush = useCallback((e: React.MouseEvent) => {
    if (mapMode !== 'region' || e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const c = screenToCoord(e.clientX, e.clientY)
    setDrawing([{ x: Math.round(c.x), y: Math.round(c.y) }])
    setIsBrushing(true)
  }, [mapMode, screenToCoord])

  const brushMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current!
    const rect = el.getBoundingClientRect()
    setScreenCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    const c = screenToCoord(e.clientX, e.clientY)
    setCursorPos(c)
    if (!isBrushing) return
    e.preventDefault()
    const px = Math.round(c.x); const py = Math.round(c.y)
    setDrawing((prev) => {
      const last = prev[prev.length - 1]
      if (!last) return prev
      if (Math.abs(px - last.x) < 2 && Math.abs(py - last.y) < 2) return prev
      return [...prev, { x: px, y: py }]
    })
  }, [isBrushing, screenToCoord])

  const finishBrush = useCallback(() => {
    if (!isBrushing || !currentMap) return
    setIsBrushing(false)
    if (drawing.length < 20) { setDrawing([]); return }
    const first = drawing[0]; const last = drawing[drawing.length - 1]
    const dist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2)
    if (dist > 30) { setDrawing([]); return }
    const cx = Math.round(drawing.reduce((s, p) => s + p.x, 0) / drawing.length)
    const cy = Math.round(drawing.reduce((s, p) => s + p.y, 0) / drawing.length)
    setEditingRegion({
      id: '', worldId: currentWorldId!, mapId: currentMap.id,
      name: '', color: brushColor, borderWidth: brushSize,
      pathPoints: drawing, centerX: cx, centerY: cy,
    } as MapRegion)
    setDrawing([])
  }, [isBrushing, drawing, currentMap, currentWorldId, brushColor, brushSize])

  const handleDoubleClick = useCallback(() => {
  }, [])

  const handleRegionClick = useCallback((region: MapRegion) => {
    if (mapMode === 'region') setEditingRegion({ ...region })
  }, [mapMode])

  const handleLandmarkRightClick = useCallback((e: React.MouseEvent, lm: Landmark) => {
    if (mapMode !== 'landmark') return
    e.preventDefault(); e.stopPropagation()
    setEditingLandmark({ ...lm })
  }, [mapMode])

  const handleSaveLandmark = (lm: Landmark) => {
    if (lm.id) updateLandmark(lm.id, lm)
    else addLandmark(lm)
    setEditingLandmark(null)
  }

  const handleSaveRegion = (r: MapRegion) => {
    if (r.id) updateRegion(r.id, r)
    else addRegion(r)
    setEditingRegion(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !currentMap) return
    const reader = new FileReader()
    reader.onload = () => updateMap(currentMap.id, { backgroundImage: reader.result as string })
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (worldMaps.length > 0 && !currentMapId) setCurrentMap(worldMaps[0].id)
  }, [worldMaps, currentMapId, setCurrentMap])

  // 无地图状态
  if (worldMaps.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '2px solid var(--color-accent)' }}>
            <button className="btn" onClick={goBack}>← 返回</button>
            <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>世界地图</h2>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>🗺</div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>尚未创建任何地图维度</p>
            <button className="btn btn-primary" onClick={() => setShowCreateMap(true)}>+ 创建地图</button>
          </div>
        </div>
        {showCreateMap && <CreateMapModal onClose={() => setShowCreateMap(false)} />}
      </div>
    )
  }

  if (!currentMap) return null

  const bgImage = currentMap.backgroundImage

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '2px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn" onClick={goBack}>← 返回</button>
            <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>世界地图</h2>
            <div style={{ position: 'relative' }}>
              <button className="btn" style={{ fontSize: '13px', padding: '5px 12px' }} onClick={() => setShowMapList(!showMapList)}>{currentMap.dimensionName} ▾</button>
              {showMapList && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: 'var(--color-page)', borderRadius: '8px', border: '2px solid var(--color-accent)', boxShadow: 'var(--shadow-lg)', minWidth: '180px', padding: '4px 0' }}>
                  {worldMaps.map((m) => (
                    <div key={m.id} onClick={() => { setCurrentMap(m.id); setShowMapList(false) }} style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: m.id===currentMap.id?GOLD:'var(--color-text)', background: m.id===currentMap.id?'rgba(184,134,11,0.1)':undefined }}>
                      <span>{m.dimensionName}{m.backgroundImage ? ' 📷' : ''}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--color-page-shadow)', margin: '4px 0' }} />
                  <div onClick={() => { setShowCreateMap(true); setShowMapList(false) }} style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: GOLD }}>+ 新建地图</div>
                </div>
              )}
            </div>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{landmarks.length} 地标 · {regions.length} 区域</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className={`btn${mapMode==='view'?' btn-primary':''}`} onClick={() => { setMapMode('view'); setDrawing([]) }} style={{ fontSize:'13px', padding:'5px 14px' }}>查看</button>
            <button className={`btn${mapMode==='landmark'?' btn-primary':''}`} onClick={() => { setMapMode('landmark'); setDrawing([]) }} style={{ fontSize:'13px', padding:'5px 14px' }}>编辑地标</button>
            <button className={`btn${mapMode==='region'?' btn-primary':''}`} onClick={() => { setMapMode('region'); setDrawing([]) }} style={{ fontSize:'13px', padding:'5px 14px' }}>编辑区域</button>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            <button className="btn" style={{ fontSize:'13px', padding:'5px 12px' }} onClick={() => fileInputRef.current?.click()}>{bgImage?'更换底图':'上传底图'}</button>
            {bgImage && <button className="btn btn-danger" style={{ fontSize:'13px', padding:'5px 12px' }} onClick={() => updateMap(currentMap.id,{backgroundImage:undefined})}>移除底图</button>}
            <button className="btn" style={{ fontSize:'13px', padding:'5px 12px' }} onClick={() => { setScale(0.65); setOffsetX(60); setOffsetY(40) }}>重置视图</button>
            {mapMode==='region' && (
              <>
                <span style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>画笔 <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} style={{ width:'22px', height:'22px', border:'none', background:'none', cursor:'pointer', padding:0 }} /></span>
                <span style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>粗细 <input type="range" min="1" max="8" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width:'50px', accentColor:brushColor }} /></span>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 32px', flexShrink: 0, fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
        {mapMode==='view' && '滚轮缩放 · 拖拽平移 · 点击地标查看详情'}
        {mapMode==='landmark' && '右键空白创建地标 · 拖拽移动 · 右键编辑'}
        {mapMode==='region' && '按住描绘封闭图形 · 松开自动判定封闭 · 点击已有区域编辑'}
      </div>
      <div ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={(e) => { if (mapMode==='region') startBrush(e); else handleMouseDown(e) }}
        onMouseMove={(e) => { if (isBrushing) brushMove(e); else handleMouseMove(e) }}
        onMouseUp={(e) => { if (isBrushing) finishBrush(); else handleMouseUp(e) }}
        onMouseLeave={() => { if (isBrushing) finishBrush(); setPanning(null); setDragging(null); setHoveredLmId(null) }}
        onContextMenu={(e) => {
          if (mapMode==='landmark' && currentMap) { e.preventDefault(); const c=screenToCoord(e.clientX,e.clientY);
            setEditingLandmark({ id:'', worldId:currentWorldId!, name:'', type:'city', color:GOLD, size:20, x:Math.round(c.x), y:Math.round(c.y), positions: { [currentMap.id]: { x: Math.round(c.x), y: Math.round(c.y) } } } as Landmark) }}}
        style={{ flex:1, margin:'0 24px 24px', position:'relative', overflow:'hidden', borderRadius:'8px', border:'3px solid var(--color-page-shadow)', background:'#d4c0a0', cursor:dragging?'grabbing':panning?'grabbing':(mapMode==='view'?'grab':'crosshair') }}
      >
        <div style={{ position:'absolute', transform:`translate(${offsetX}px,${offsetY}px) scale(${scale})`, transformOrigin:'0 0', width:COORD_W, height:COORD_H }}>
          {bgImage ? <img src={bgImage} alt="" style={{ width:COORD_W, height:COORD_H, objectFit:'contain', display:'block' }} draggable={false} /> : <ParchmentBg w={COORD_W} h={COORD_H} />}
          <svg style={{ position:'absolute', inset:0, width:COORD_W, height:COORD_H, overflow:'visible', pointerEvents:mapMode==='region'?'auto':'none' }}>
            {regions.map((r) => {
              if (r.pathPoints.length<3) return null
              const pts=r.pathPoints.map((p)=>`${p.x},${p.y}`).join(' ')
              return (<g key={r.id}>
                <polygon points={pts} fill={hexAlpha(r.color,0.2)} stroke={r.color} strokeWidth={editingRegion?.id===r.id?r.borderWidth+1:r.borderWidth} style={{ cursor:mapMode==='region'?'pointer':'default' }} onClick={(e)=>{e.stopPropagation();handleRegionClick(r)}} />
                <text x={r.centerX} y={r.centerY} textAnchor="middle" dominantBaseline="central" fill={r.color} fontSize="13" fontWeight="600" style={{ textShadow:'0 0 6px rgba(0,0,0,0.3)', pointerEvents:'none' }}>{r.name}</text>
              </g>)
            })}
            {drawing.length>=2 && <polyline points={drawing.map((p)=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={brushColor} strokeWidth={brushSize} strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />}
            {drawing.length>=1 && isBrushing && <line x1={drawing[drawing.length-1].x} y1={drawing[drawing.length-1].y} x2={cursorPos.x} y2={cursorPos.y} stroke={brushColor} strokeWidth={brushSize*0.7} strokeDasharray="4 3" opacity="0.5" />}
          </svg>
          <svg style={{ position:'absolute', inset:0, width:COORD_W, height:COORD_H, overflow:'visible', pointerEvents:mapMode==='landmark'?'auto':'none' }}>
            {landmarks.map((lm) => {
              const sz=lm.size||20, isDrag=dragging?.lmId===lm.id, isHover=hoveredLmId===lm.id
              const pos=getPos(lm); const dx=isDrag&&dragPosRef.current?dragPosRef.current.x:pos.x, dy=isDrag&&dragPosRef.current?dragPosRef.current.y:pos.y
              const c=lm.color||GOLD, s=sz/24, sc=(isDrag||isHover)?1.2:1
              return (
                <g key={lm.id} data-landmark-id={lm.id} transform={`translate(${dx},${dy}) scale(${sc})`}
                  style={{ cursor:mapMode==='landmark'?'grab':'pointer', opacity:isDrag?0.8:1, transition:isDrag?'none':'transform 0.15s ease,opacity 0.15s ease' }}
                  onMouseEnter={(e)=>{if(!isDrag){e.stopPropagation();setHoveredLmId(lm.id)}}}
                  onMouseLeave={(e)=>{if(hoveredLmId===lm.id){e.stopPropagation();setHoveredLmId(null)}}}
                  onContextMenu={(e)=>handleLandmarkRightClick(e,lm)}>
                  {renderIconShape(getIconName(lm), s, c)}
                </g>
              )
            })}
            {landmarks.map((lm) => {
              if (hoveredLmId!==lm.id) return null
              const sz=lm.size||20, isDrag=dragging?.lmId===lm.id
              const pos=getPos(lm); const dx=isDrag&&dragPosRef.current?dragPosRef.current.x:pos.x, dy=isDrag&&dragPosRef.current?dragPosRef.current.y:pos.y
              const c=lm.color||GOLD, ls=Math.round(sz*0.5), lss=Math.round(ls*0.82)
              const gap=sz*0.4+4, topY=dy+gap
              return (
                <g key={'t'+lm.id} style={{ pointerEvents:'none' }}>
                  {lm.region && <text x={dx} y={topY} textAnchor="middle" dominantBaseline="hanging" fill={c} opacity={0.8} fontWeight={500} fontSize={lss}>{lm.region}</text>}
                  <text x={dx} y={lm.region?topY+lss*1.2:topY} textAnchor="middle" dominantBaseline="hanging" fill={c} fontWeight={700} fontSize={ls}>{lm.name}</text>
                </g>
              )
            })}
          </svg>

          {mapMode==='view' && (
            <svg style={{ position:'absolute', inset:0, width:COORD_W, height:COORD_H, overflow:'visible', pointerEvents:'auto' }}>
              {landmarks.map((lm) => (
                <circle key={lm.id} data-landmark-id={lm.id} cx={getPos(lm).x} cy={getPos(lm).y} r={(lm.size||20)*0.8} fill="transparent" style={{ cursor:'pointer' }}
                  onClick={(e)=>{e.stopPropagation();const r=containerRef.current?.getBoundingClientRect();if(r)setPopupAnchor({x:r.left+getPos(lm).x*scale+offsetX,y:r.top+getPos(lm).y*scale+offsetY});setSelectedLandmark(lm)}}
                  onMouseEnter={()=>setHoveredLmId(lm.id)}
                  onMouseLeave={()=>setHoveredLmId(null)} />
              ))}
            </svg>
          )}
        </div>
        {mapMode==='region' && !isBrushing && <div style={{ position:'absolute', left:screenCursor.x, top:screenCursor.y, width:brushSize*scale, height:brushSize*scale, borderRadius:'50%', border:`1.5px solid ${brushColor}`, background:`${brushColor}22`, transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:50 }} />}
        <div style={{ position:'absolute', bottom:'10px', right:'14px', fontSize:'12px', color:'var(--color-text-muted)', background:'rgba(245,230,200,0.75)', padding:'2px 8px', borderRadius:'4px', pointerEvents:'none' }}>{Math.round(scale*100)}%</div>
      </div>
      {worldMaps.length>1 && <div style={{ padding:'0 32px 16px', textAlign:'center', flexShrink:0 }}><button className="btn btn-danger" style={{ fontSize:'12px', padding:'4px 12px' }} onClick={()=>{if(confirm(`确定删除地图「${currentMap.dimensionName}」？`))deleteMap(currentMap.id)}}>删除当前地图</button></div>}
      {showCreateMap && <CreateMapModal onClose={()=>setShowCreateMap(false)} />}
      {selectedLandmark && mapMode==='view' && <LandmarkPopup lm={selectedLandmark} mapMode={mapMode} anchor={popupAnchor} onClose={()=>{setSelectedLandmark(null);setPopupAnchor(null)}} onEdit={()=>{setEditingLandmark(selectedLandmark);setSelectedLandmark(null);setPopupAnchor(null)}} />}
      {editingLandmark && <LandmarkEditor lm={editingLandmark} onSave={handleSaveLandmark} onDelete={editingLandmark.id?()=>{deleteLandmark(editingLandmark.id);setEditingLandmark(null)}:undefined} onClose={()=>setEditingLandmark(null)} />}
      {editingRegion && <RegionEditor region={editingRegion} onSave={handleSaveRegion} onDelete={editingRegion.id?()=>{deleteRegion(editingRegion.id);setEditingRegion(null)}:undefined} onClose={()=>setEditingRegion(null)} />}
    </div>
  )
}
