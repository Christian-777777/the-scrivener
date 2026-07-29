// ========================================
// 人物图标系统 — 16枚精细描线图标
// 中世奇幻风格，职业+种族混合
// ========================================

import { Fragment } from 'react'

/** 判断字符icon是图片dataURL还是预设key */
export function isImageIcon(icon?: string): boolean {
  return !!icon && icon.startsWith('data:')
}

export const CHAR_ICONS = [
  { key:'mage',    label:'法师' },
  { key:'warrior', label:'战士' },
  { key:'knight',  label:'骑士' },
  { key:'archer',  label:'弓手' },
  { key:'rogue',   label:'刺客' },
  { key:'priest',  label:'祭司' },
  { key:'king',    label:'国王' },
  { key:'deity',   label:'神明' },
  { key:'elf',     label:'精灵' },
  { key:'dragon',  label:'龙族' },
  { key:'orc',     label:'兽人' },
  { key:'dwarf',   label:'矮人' },
  { key:'angel',   label:'天使' },
  { key:'demon',   label:'恶魔' },
  { key:'undead',  label:'亡灵' },
  { key:'beast',   label:'兽族' },
]

export function renderCharIcon(key: string, r: number, color: string): React.ReactNode {
  const c = color || '#b8860b'
  const sw = r * 0.18

  switch (key) {

    // ═══ 法师 — 尖顶宽檐巫师帽 + 三星 ═══
    case 'mage': return <>
      <path d={`M ${-r*0.55},${r*0.3} L ${r*0.55},${r*0.3} L ${r*0.55},${r*0.55} Q ${r*0.55},${r*0.8} 0,${r*0.85} Q ${-r*0.55},${r*0.8} ${-r*0.55},${r*0.55} Z`}
        fill={`${c}22`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.7},${r*0.3} L ${0},${-r*0.85} L ${r*0.7},${r*0.3}`}
        fill={`${c}18`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <line x1={-r*0.85} y1={r*0.3} x2={r*0.85} y2={r*0.3} stroke={c} strokeWidth={sw*1.1} strokeLinecap="round" />
      <path d={`M ${-r*0.5},${-r*0.15} L ${-r*0.5},${r*0.2}`} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" opacity={0.6} />
      {[[-0.18,-0.45],[0.22,-0.55],[-0.05,-0.7]].map(([sx,sy])=>(
        <polygon key={`${sx}${sy}`} points={`${sx*r-r*0.06},${sy*r} ${sx*r},${sy*r-r*0.08} ${sx*r+r*0.06},${sy*r} ${sx*r},${sy*r+r*0.08}`}
          fill={c} stroke={c} strokeWidth={sw*0.3} strokeLinejoin="round" />
      ))}
    </>

    // ═══ 战士 — 交叉双剑 + 圆盾 ═══
    case 'warrior': return <>
      <circle cx={0} cy={r*0.15} r={r*0.45} fill={`${c}15`} stroke={c} strokeWidth={sw} />
      <circle cx={0} cy={r*0.15} r={r*0.25} fill={`${c}10`} stroke={c} strokeWidth={sw*0.6} />
      <line x1={-r*0.75} y1={-r*0.7} x2={r*0.75} y2={r*0.65} stroke={c} strokeWidth={sw*0.9} strokeLinecap="round" />
      <line x1={-r*0.75} y1={r*0.65} x2={r*0.75} y2={-r*0.7} stroke={c} strokeWidth={sw*0.9} strokeLinecap="round" />
      <line x1={-r*0.03} y1={-r*0.45} x2={-r*0.03} y2={-r*0.85} stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
      <line x1={r*0.03} y1={-r*0.45} x2={r*0.03} y2={-r*0.85} stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
      <line x1={-r*0.12} y1={-r*0.7} x2={r*0.12} y2={-r*0.7} stroke={c} strokeWidth={sw*0.6} strokeLinecap="round" />
    </>

    // ═══ 骑士 — 全覆式头盔 ═══
    case 'knight': return <>
      <path d={`M ${-r*0.65},${-r*0.2} L ${-r*0.65},${r*0.6} Q ${-r*0.65},${r*0.85} 0,${r*0.85} Q ${r*0.65},${r*0.85} ${r*0.65},${r*0.6} L ${r*0.65},${-r*0.2} Z`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.55},${-r*0.2} Q ${-r*0.55},${-r*0.75} 0,${-r*0.8} Q ${r*0.55},${-r*0.75} ${r*0.55},${-r*0.2}`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <line x1={-r*0.35} y1={-r*0.1} x2={r*0.35} y2={-r*0.1} stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
      <line x1={0} y1={-r*0.1} x2={0} y2={r*0.55} stroke={c} strokeWidth={sw*0.35} />
      <line x1={-r*0.02} y1={r*0.2} x2={r*0.25} y2={r*0.2} stroke={c} strokeWidth={sw*0.35} />
      <line x1={r*0.02} y1={r*0.2} x2={-r*0.25} y2={r*0.2} stroke={c} strokeWidth={sw*0.35} />
      <line x1={-r*0.02} y1={r*0.35} x2={r*0.2} y2={r*0.35} stroke={c} strokeWidth={sw*0.35} />
      <line x1={r*0.02} y1={r*0.35} x2={-r*0.2} y2={r*0.35} stroke={c} strokeWidth={sw*0.35} />
    </>

    // ═══ 弓手 — 弯弓 + 箭 ═══
    case 'archer': return <>
      <path d={`M ${-r*0.3},${-r*0.85} Q ${-r*0.95},${-r*0.2} ${-r*0.3},${r*0.85}`}
        fill="none" stroke={c} strokeWidth={sw*0.8} strokeLinecap="round" />
      <path d={`M ${r*0.3},${-r*0.85} Q ${r*0.95},${-r*0.2} ${r*0.3},${r*0.85}`}
        fill="none" stroke={c} strokeWidth={sw*0.8} strokeLinecap="round" />
      <line x1={-r*0.3} y1={-r*0.85} x2={r*0.3} y2={-r*0.85} stroke={c} strokeWidth={sw*0.4} />
      <line x1={-r*0.3} y1={r*0.85} x2={r*0.3} y2={r*0.85} stroke={c} strokeWidth={sw*0.4} />
      <line x1={-r*0.85} y1={0} x2={r*0.3} y2={0} stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
      <polygon points={`${r*0.25},${-r*0.12} ${r*0.5},0 ${r*0.25},${r*0.12}`} fill={c} />
      <line x1={-r*0.45} y1={-r*0.15} x2={-r*0.3} y2={0} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
      <line x1={-r*0.45} y1={r*0.15} x2={-r*0.3} y2={0} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
    </>

    // ═══ 刺客 — 兜帽 + 匕首 ═══
    case 'rogue': return <>
      <path d={`M ${-r*0.75},${r*0.2} Q ${-r*0.6},${-r*0.5} 0,${-r*0.6} Q ${r*0.6},${-r*0.5} ${r*0.75},${r*0.2}`}
        fill={`${c}18`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.65},${r*0.2} L ${-r*0.65},${r*0.65} Q ${-r*0.65},${r*0.85} 0,${r*0.85} Q ${r*0.65},${r*0.85} ${r*0.65},${r*0.65} L ${r*0.65},${r*0.2}`}
        fill={`${c}14`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.25},${-r*0.45} Q ${-r*0.6},${-r*0.8} ${-r*0.5},${r*0} Z`} fill={`${c}0a`} stroke={c} strokeWidth={sw*0.5} />
      <line x1={-r*0.3} y1={-r*0.15} x2={r*0.3} y2={-r*0.15} stroke={c} strokeWidth={sw*0.6} strokeLinecap="round" />
      <line x1={r*0.1} y1={r*0} x2={r*0.85} y2={-r*0.3} stroke={c} strokeWidth={sw*0.7} strokeLinecap="round" />
      <line x1={r*0.2} y1={r*0.25} x2={r*0.85} y2={-r*0.15} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
      <line x1={r*0.1} y1={r*0} x2={r*0.2} y2={r*0.25} stroke={c} strokeWidth={sw*0.6} strokeLinecap="round" />
    </>

    // ═══ 祭司 — 圣光十字 + 圆环 ═══
    case 'priest': return <>
      <circle cx={0} cy={0} r={r*0.7} fill="none" stroke={c} strokeWidth={sw*0.7} />
      <circle cx={0} cy={0} r={r*0.55} fill="none" stroke={c} strokeWidth={sw*0.4} opacity={0.5} />
      <rect x={-r*0.16} y={-r*0.7} width={r*0.32} height={r*1.4} rx={r*0.08} fill={c} opacity={0.85} />
      <rect x={-r*0.6} y={-r*0.16} width={r*1.2} height={r*0.32} rx={r*0.08} fill={c} opacity={0.85} />
      <circle cx={0} cy={0} r={r*0.2} fill={`${c}33`} stroke={c} strokeWidth={sw*0.5} />
      {[[0,-0.72],[0,0.72],[-0.72,0],[0.72,0]].map(([px,py])=>(
        <polygon key={`${px}${py}`} points={`${px*r},${(py-0.08)*r} ${(px+0.08)*r},${py*r} ${px*r},${(py+0.08)*r} ${(px-0.08)*r},${py*r}`}
          fill={c} stroke={c} strokeWidth={sw*0.2} strokeLinejoin="round" />
      ))}
    </>

    // ═══ 国王 — 皇冠 + 宝石 + 权杖 ═══
    case 'king': return <>
      <path d={`M ${-r*0.8},${r*0.35} L ${-r*0.8},${r*0.7} L ${r*0.8},${r*0.7} L ${r*0.8},${r*0.35}`}
        fill={`${c}18`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`${-r*0.85},${r*0.35} ${-r*0.65},${-r*0.55} ${-r*0.45},${r*0.35}`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`${-r*0.55},${r*0.35} ${-r*0.2},${-r*0.8} ${r*0},${r*0.35}`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`${r*0},${r*0.35} ${r*0.35},${-r*0.75} ${r*0.6},${r*0.35}`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`${r*0.5},${r*0.35} ${r*0.7},${-r*0.5} ${r*0.85},${r*0.35}`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx={0} cy={-r*0.45} r={r*0.1} fill={c} />
      <circle cx={-r*0.55} cy={-r*0.12} r={r*0.07} fill={c} opacity={0.7} />
      <circle cx={r*0.55} cy={-r*0.12} r={r*0.07} fill={c} opacity={0.7} />
      <line x1={0} y1={r*0.45} x2={0} y2={-r*0.2} stroke={c} strokeWidth={sw*0.6} strokeLinecap="round" />
    </>

    // ═══ 神明 — 三重光环 + 天眼 ═══
    case 'deity': return <>
      <circle cx={0} cy={0} r={r*0.85} fill="none" stroke={c} strokeWidth={sw*0.5} strokeDasharray={`${r*0.15} ${r*0.1}`} opacity={0.6} />
      <circle cx={0} cy={0} r={r*0.55} fill="none" stroke={c} strokeWidth={sw*0.7} opacity={0.8} />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg)=>{
        const rad=(deg*Math.PI)/180
        return <line key={deg} x1={Math.cos(rad)*r*0.58} y1={Math.sin(rad)*r*0.58}
          x2={Math.cos(rad)*r*0.82} y2={Math.sin(rad)*r*0.82}
          stroke={c} strokeWidth={sw*0.35} opacity={0.5} />
      })}
      <ellipse cx={0} cy={0} rx={r*0.28} ry={r*0.22} fill={`${c}15`} stroke={c} strokeWidth={sw*0.6} />
      <circle cx={0} cy={0} r={r*0.1} fill={c} />
      <path d={`M ${-r*0.2},${r*0.05} Q 0,${-r*0.1} ${r*0.2},${r*0.05}`} fill="none" stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
    </>

    // ═══ 精灵 — 尖耳 + 星辉 + 藤蔓 ═══
    case 'elf': return <>
      <path d={`M ${-r*0.45},${-r*0.15} L ${-r*0.85},${-r*0.6} L ${-r*0.5},${-r*0.1} Z`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw*0.7} strokeLinejoin="round" />
      <path d={`M ${r*0.45},${-r*0.15} L ${r*0.85},${-r*0.6} L ${r*0.5},${-r*0.1} Z`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw*0.7} strokeLinejoin="round" />
      <ellipse cx={0} cy={-r*0.05} rx={r*0.4} ry={r*0.55} fill={`${c}12`} stroke={c} strokeWidth={sw*0.7} />
      <ellipse cx={0} cy={-r*0.05} rx={r*0.2} ry={r*0.35} fill={`${c}08`} stroke={c} strokeWidth={sw*0.4} />
      <ellipse cx={-r*0.15} cy={-r*0.1} rx={r*0.08} ry={r*0.12} fill={c} />
      <ellipse cx={r*0.15} cy={-r*0.1} rx={r*0.08} ry={r*0.12} fill={c} />
      {[-30,30,150,210].map((deg)=>{
        const rad=(deg*Math.PI)/180
        const px=Math.cos(rad)*r*0.7;const py=Math.sin(rad)*r*0.65
        return <polygon key={deg} points={`${px-r*0.05},${py} ${px},${py-r*0.07} ${px+r*0.05},${py} ${px},${py+r*0.07}`}
          fill={c} opacity={0.6} />
      })}
      <path d={`M ${-r*0.4},${r*0.5} Q ${-r*0.7},${r*0.8} ${-r*0.5},${r*0.9} Q ${-r*0.2},${r*0.7} 0,${r*0.8}`}
        fill="none" stroke={c} strokeWidth={sw*0.4} opacity={0.5} />
      <path d={`M ${r*0.4},${r*0.5} Q ${r*0.7},${r*0.8} ${r*0.5},${r*0.9} Q ${r*0.2},${r*0.7} 0,${r*0.8}`}
        fill="none" stroke={c} strokeWidth={sw*0.4} opacity={0.5} />
    </>

    // ═══ 龙族 — 龙首剪影 + 火焰 ═══
    case 'dragon': return <>
      <path d={`M ${-r*0.7},${r*0.4} Q ${-r*0.85},0 ${-r*0.5},${-r*0.4} L ${-r*0.25},${-r*0.65} L 0,${-r*0.45} L ${r*0.2},${-r*0.7} L ${r*0.4},${-r*0.45} Q ${r*0.8},${-r*0.1} ${r*0.75},${r*0.35} Q ${r*0.6},${r*0.8} 0,${r*0.75} Q ${-r*0.6},${r*0.8} ${-r*0.7},${r*0.4} Z`}
        fill={`${c}1e`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <ellipse cx={-r*0.15} cy={-r*0.15} rx={r*0.12} ry={r*0.08} fill={c} opacity={0.7} />
      <ellipse cx={-r*0.15} cy={-r*0.15} rx={r*0.06} ry={r*0.04} fill={`${c}33`} />
      <ellipse cx={r*0.2} cy={-r*0.2} rx={r*0.1} ry={r*0.06} fill={c} opacity={0.7} />
      <ellipse cx={r*0.2} cy={-r*0.2} rx={r*0.05} ry={r*0.03} fill={`${c}33`} />
      <path d={`M 0,${r*0.4} Q ${-r*0.25},${r*0.15} ${-r*0.2},${r*0.55} Q ${-r*0.1},${r*0.3} 0,${r*0.7} Q ${r*0.1},${r*0.3} ${r*0.2},${r*0.55} Q ${r*0.25},${r*0.15} 0,${r*0.4} Z`}
        fill={`${c}22`} stroke={c} strokeWidth={sw*0.5} strokeLinejoin="round" />
    </>

    // ═══ 兽人 — 獠牙 + 战纹 ═══
    case 'orc': return <>
      <path d={`M ${-r*0.65},${-r*0.2} Q ${-r*0.75},${r*0.3} ${-r*0.5},${r*0.6} L ${-r*0.2},${r*0.35} L ${-r*0.15},${r*0.8} L ${r*0.15},${r*0.8} L ${r*0.2},${r*0.35} L ${r*0.5},${r*0.6} Q ${r*0.75},${r*0.3} ${r*0.65},${-r*0.2} Z`}
        fill={`${c}1c`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.15},${r*0.3} L ${-r*0.05},${r*0.85} L ${r*0.02},${r*0.3} Z`} fill={`${c}88`} />
      <path d={`M ${r*0.02},${r*0.3} L ${r*0.12},${r*0.85} L ${r*0.2},${r*0.3} Z`} fill={`${c}88`} />
      <circle cx={-r*0.25} cy={-r*0.1} r={r*0.1} fill={c} />
      <circle cx={r*0.25} cy={-r*0.1} r={r*0.1} fill={c} />
      <line x1={-r*0.5} y1={-r*0.5} x2={-r*0.1} y2={-r*0.5} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
      <line x1={-r*0.45} y1={-r*0.65} x2={-r*0.15} y2={-r*0.65} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
      <line x1={r*0.1} y1={-r*0.5} x2={r*0.5} y2={-r*0.5} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
      <line x1={r*0.15} y1={-r*0.65} x2={r*0.45} y2={-r*0.65} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
    </>

    // ═══ 矮人 — 交叉锤斧 + 铁砧 ═══
    case 'dwarf': return <>
      <rect x={-r*0.5} y={r*0.15} width={r} height={r*0.6} rx={r*0.05} fill={`${c}12`} stroke={c} strokeWidth={sw*0.7} />
      <rect x={-r*0.6} y={r*0.6} width={r*1.2} height={r*0.25} rx={r*0.04} fill={`${c}18`} stroke={c} strokeWidth={sw*0.6} />
      <line x1={-r*0.65} y1={r*0.15} x2={r*0.55} y2={-r*0.7} stroke={c} strokeWidth={sw*1} strokeLinecap="round" />
      <rect x={r*0.35} y={-r*0.85} width={r*0.4} height={r*0.3} rx={r*0.06} fill={`${c}1a`} stroke={c} strokeWidth={sw*0.7} />
      <line x1={r*0.65} y1={r*0.15} x2={-r*0.55} y2={-r*0.7} stroke={c} strokeWidth={sw*1} strokeLinecap="round" />
      <path d={`M ${-r*0.7},${-r*0.8} Q ${-r*0.55},${-r*0.65} ${-r*0.35},${-r*0.75} L ${-r*0.45},${-r*0.55} Q ${-r*0.55},${-r*0.55} ${-r*0.6},${-r*0.65} Z`}
        fill={`${c}1a`} stroke={c} strokeWidth={sw*0.6} strokeLinejoin="round" />
    </>

    // ═══ 天使 — 双翼 + 光环 ═══
    case 'angel': return <>
      <circle cx={0} cy={-r*0.3} r={r*0.5} fill="none" stroke={c} strokeWidth={sw*0.5} opacity={0.6} />
      <path d={`M ${-r*0.1},0 Q ${-r*0.5},${-r*0.25} ${-r*0.85},${-r*0.45} Q ${-r*0.8},${-r*0.05} ${-r*0.85},${r*0.35} Q ${-r*0.45},${r*0.15} ${-r*0.1},${r*0.15}`}
        fill={`${c}18`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.1},0 Q ${-r*0.4},${-r*0.35} ${-r*0.7},${-r*0.3} Q ${-r*0.6},${-r*0.05} ${-r*0.7},${r*0.25} Q ${-r*0.35},${r*0.05} ${-r*0.1},${r*0.15}`}
        fill={`${c}0c`} stroke={c} strokeWidth={sw*0.5} strokeLinejoin="round" />
      <path d={`M ${r*0.1},0 Q ${r*0.5},${-r*0.25} ${r*0.85},${-r*0.45} Q ${r*0.8},${-r*0.05} ${r*0.85},${r*0.35} Q ${r*0.45},${r*0.15} ${r*0.1},${r*0.15}`}
        fill={`${c}18`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${r*0.1},0 Q ${r*0.4},${-r*0.35} ${r*0.7},${-r*0.3} Q ${r*0.6},${-r*0.05} ${r*0.7},${r*0.25} Q ${r*0.35},${r*0.05} ${r*0.1},${r*0.15}`}
        fill={`${c}0c`} stroke={c} strokeWidth={sw*0.5} strokeLinejoin="round" />
      <ellipse cx={0} cy={r*0.15} rx={r*0.25} ry={r*0.55} fill={`${c}1a`} stroke={c} strokeWidth={sw*0.7} />
      <circle cx={0} cy={-r*0.35} r={r*0.2} fill={`${c}18`} stroke={c} strokeWidth={sw*0.6} />
    </>

    // ═══ 恶魔 — 羊角 + 叉戟 + 蝠翼 ═══
    case 'demon': return <>
      <path d={`M ${-r*0.3},${-r*0.3} Q ${-r*0.8},${-r*0.9} ${-r*0.5},${-r*0.2}`} fill="none" stroke={c} strokeWidth={sw*1.2} strokeLinecap="round" />
      <path d={`M ${r*0.3},${-r*0.3} Q ${r*0.8},${-r*0.9} ${r*0.5},${-r*0.2}`} fill="none" stroke={c} strokeWidth={sw*1.2} strokeLinecap="round" />
      <path d={`M ${-r*0.15},${r*0.1} Q ${-r*0.55},${-r*0.1} ${-r*0.75},${-r*0.35} Q ${-r*0.6},${r*0} ${-r*0.8},${r*0.2} Q ${-r*0.55},${r*0.15} ${-r*0.7},${r*0.45} Q ${-r*0.4},${r*0.3} ${-r*0.15},${r*0.2}`}
        fill={`${c}14`} stroke={c} strokeWidth={sw*0.6} strokeLinejoin="round" />
      <path d={`M ${r*0.15},${r*0.1} Q ${r*0.55},${-r*0.1} ${r*0.75},${-r*0.35} Q ${r*0.6},${r*0} ${r*0.8},${r*0.2} Q ${r*0.55},${r*0.15} ${r*0.7},${r*0.45} Q ${r*0.4},${r*0.3} ${r*0.15},${r*0.2}`}
        fill={`${c}14`} stroke={c} strokeWidth={sw*0.6} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={r*0.35} ry={r*0.45} fill={`${c}1a`} stroke={c} strokeWidth={sw*0.7} />
      <circle cx={-r*0.12} cy={-r*0.05} r={r*0.08} fill={c} />
      <circle cx={r*0.12} cy={-r*0.05} r={r*0.08} fill={c} />
      <line x1={0} y1={r*0.25} x2={0} y2={-r*0.6} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" />
      <path d={`M ${-r*0.15},${-r*0.55} L 0,${-r*0.8} L ${r*0.15},${-r*0.55}`} fill="none" stroke={c} strokeWidth={sw*0.6} strokeLinejoin="round" />
    </>

    // ═══ 亡灵 — 骷髅头 + 暗纹 ═══
    case 'undead': return <>
      <path d={`M ${-r*0.6},${r*0.15} Q ${-r*0.65},${-r*0.5} 0,${-r*0.65} Q ${r*0.65},${-r*0.5} ${r*0.6},${r*0.15}`}
        fill={`${c}1c`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${-r*0.5},${r*0.15} L ${-r*0.45},${r*0.75} L ${r*0.45},${r*0.75} L ${r*0.5},${r*0.15}`}
        fill={`${c}15`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <ellipse cx={-r*0.25} cy={-r*0.15} rx={r*0.16} ry={r*0.2} fill={`${c}33`} stroke={c} strokeWidth={sw*0.6} />
      <ellipse cx={r*0.25} cy={-r*0.15} rx={r*0.16} ry={r*0.2} fill={`${c}33`} stroke={c} strokeWidth={sw*0.6} />
      <polygon points={`${-r*0.1},${r*0.1} 0,${r*0.2} ${r*0.1},${r*0.1}`} fill="none" stroke={c} strokeWidth={sw*0.5} strokeLinejoin="round" />
      <line x1={-r*0.3} y1={r*0.45} x2={r*0.3} y2={r*0.45} stroke={c} strokeWidth={sw*0.4} strokeLinecap="round" />
      <line x1={-r*0.15} y1={r*0.45} x2={-r*0.15} y2={r*0.7} stroke={c} strokeWidth={sw*0.35} />
      <line x1={r*0.15} y1={r*0.45} x2={r*0.15} y2={r*0.7} stroke={c} strokeWidth={sw*0.35} />
      <path d={`M ${-r*0.2},${-r*0.4} Q 0,${-r*0.5} ${r*0.2},${-r*0.4}`} fill="none" stroke={c} strokeWidth={sw*0.4} opacity={0.5} />
    </>

    // ═══ 兽族 — 狼爪印 + 爪痕 ═══
    case 'beast': return <>
      <path d={`M ${-r*0.45},${r*0.1} Q ${-r*0.55},${r*0.4} 0,${r*0.55} Q ${r*0.55},${r*0.4} ${r*0.45},${r*0.1} Q ${r*0.2},${r*0.35} 0,${r*0.3} Q ${-r*0.2},${r*0.35} ${-r*0.45},${r*0.1} Z`}
        fill={`${c}22`} stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <ellipse cx={-r*0.35} cy={-r*0.3} rx={r*0.14} ry={r*0.22} fill={`${c}1c`} stroke={c} strokeWidth={sw*0.8} />
      <ellipse cx={-r*0.05} cy={-r*0.55} rx={r*0.14} ry={r*0.22} fill={`${c}1c`} stroke={c} strokeWidth={sw*0.8} />
      <ellipse cx={r*0.05} cy={-r*0.55} rx={r*0.14} ry={r*0.22} fill={`${c}1c`} stroke={c} strokeWidth={sw*0.8} />
      <ellipse cx={r*0.35} cy={-r*0.3} rx={r*0.14} ry={r*0.22} fill={`${c}1c`} stroke={c} strokeWidth={sw*0.8} />
      <line x1={r*0.4} y1={r*0.65} x2={r*0.75} y2={r*0.85} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" opacity={0.4} />
      <line x1={r*0.5} y1={r*0.5} x2={r*0.85} y2={r*0.7} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" opacity={0.4} />
      <line x1={r*0.55} y1={r*0.35} x2={r*0.9} y2={r*0.55} stroke={c} strokeWidth={sw*0.5} strokeLinecap="round" opacity={0.4} />
    </>

    default: return <circle cx={0} cy={0} r={r*0.55} fill={`${c}18`} stroke={c} strokeWidth={sw} />
  }
}
