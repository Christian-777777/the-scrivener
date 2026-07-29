// ========================================
// 人物图谱 — 左侧搜索+人物列表 | 书脊 | 右侧图谱画布
// 圆形节点 · SVG连线 · 拖入添加 · 右键编辑关系
// ========================================

import { useState, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { Character, CharacterGraph, CharacterRelation } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { renderCharIcon, isImageIcon } from '@/components/Common/CharacterIcons'
import { GOLD, GOLD_LIGHT, darken, hexAlpha } from '@/utils/color'

const NODE_R = 28

// ═══ 工具函数 ═══
function primaryColor(c: Character): string { return c.tags[0]?.color || GOLD }

function layoutCircular(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * 2 * Math.PI - Math.PI / 2
    return { x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) }
  })
}

// ═══ 关系线路径计算 — 从圆边到圆边 ═══
// NODE_R = 圆半径(包含3px边框)，所以外缘 = NODE_R
function edgePoints(sp: { x: number; y: number }, tp: { x: number; y: number }, gap: number) {
  const dx = tp.x - sp.x; const dy = tp.y - sp.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / dist; const uy = dy / dist
  return {
    sx: sp.x + ux * (NODE_R - gap),
    sy: sp.y + uy * (NODE_R - gap),
    tx: tp.x - ux * (NODE_R - gap),
    ty: tp.y - uy * (NODE_R - gap),
  }
}

// ═══ 主组件 ═══
export function CharacterGraphPage() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const characters = useAppStore((s) => s.characters)
  const characterGraphs = useAppStore((s) => s.characterGraphs)
  const currentGraphId = useAppStore((s) => s.currentCharacterGraphId)
  const addCharacterGraph = useAppStore((s) => s.addCharacterGraph)
  const updateCharacterGraph = useAppStore((s) => s.updateCharacterGraph)
  const deleteCharacterGraph = useAppStore((s) => s.deleteCharacterGraph)
  const setCurrentCharacterGraph = useAppStore((s) => s.setCurrentCharacterGraph)
  const addCharacterRelation = useAppStore((s) => s.addCharacterRelation)
  const updateCharacterRelation = useAppStore((s) => s.updateCharacterRelation)
  const deleteCharacterRelation = useAppStore((s) => s.deleteCharacterRelation)
  const updateCharacter = useAppStore((s) => s.updateCharacter)
  const goBack = useAppStore((s) => s.goBack)

  const worldChars = useMemo(() => characters.filter((c) => c.worldId === currentWorldId), [characters, currentWorldId])
  const worldGraphs = useMemo(() => characterGraphs.filter((g) => g.worldId === currentWorldId), [characterGraphs, currentWorldId])
  const graph = worldGraphs.find((g) => g.id === currentGraphId) || null

  // ═══ 左侧搜索 ═══
  const [search, setSearch] = useState('')
  const leftChars = useMemo(() => {
    let list = worldChars.filter((c) => !!c.name)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.identity || '').toLowerCase().includes(q))
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }, [worldChars, search])

  const [rightView, setRightView] = useState<'list' | 'canvas'>(graph ? 'canvas' : 'list')

  // ═══ 节点位置 ═══
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  const lastLayoutRef = useRef<string>('')
  const graphCharIds = graph?.characterIds || []
  const sortedIds = [...graphCharIds].sort().join(',')
  if (sortedIds !== lastLayoutRef.current && graphCharIds.length > 0) {
    lastLayoutRef.current = sortedIds
    const exist: Record<string, { x: number; y: number }> = { ...nodePositions }
    const cx = 380, cy = 300, rad = Math.min(240, graphCharIds.length * 50)
    const layout = layoutCircular(graphCharIds.length, cx, cy, rad)
    graphCharIds.forEach((id, i) => { if (!exist[id]) exist[id] = layout[i] })
    for (const k of Object.keys(exist)) { if (!graphCharIds.includes(k)) delete exist[k] }
    if (JSON.stringify(exist) !== JSON.stringify(nodePositions)) {
      setTimeout(() => setNodePositions({ ...exist }), 0)
    }
  }

  // ═══ 画布状态 ═══
  const [mode, setMode] = useState<'view' | 'connect'>('view')
  const [scale, setScale] = useState(0.75)
  const [offX, setOffX] = useState(40)
  const [offY, setOffY] = useState(30)
  const [dragging, setDragging] = useState<{ charId: string } | null>(null)
  const [panning, setPanning] = useState<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const [connecting, setConnecting] = useState<{ fromId: string; x: number; y: number } | null>(null)
  const [hoveredRelId, setHoveredRelId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // 弹窗
  const [showGraphEditor, setShowGraphEditor] = useState<{ isNew: boolean } | null>(null)
  const [editingRelation, setEditingRelation] = useState<CharacterRelation | null>(null)
  const [creatingRelation, setCreatingRelation] = useState<{ src: string; tgt: string } | null>(null)
  const [detailChar, setDetailChar] = useState<Character | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const svgGRef = useRef<SVGGElement | null>(null)
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragOffsetRef = useRef<{ ox: number; oy: number }>({ ox: 0, oy: 0 })

  // ═══ 坐标转换 ═══
  const toCanvas = useCallback((sx: number, sy: number) => {
    const el = canvasRef.current; if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return { x: (sx - r.left - offX) / scale, y: (sy - r.top - offY) / scale }
  }, [scale, offX, offY])

  // ═══ 拖拽即时 DOM 更新（绕过 React 渲染周期，零延迟） ═══
  const applyDragToDOM = useCallback((charId: string) => {
    const pos = dragPosRef.current
    // 节点圆 + 标签
    const circleEl = document.querySelector(`[data-char-id="${charId}"]`) as HTMLDivElement | null
    if (circleEl) {
      const r = NODE_R
      circleEl.style.left = `${pos.x}px`
      circleEl.style.top = `${pos.y}px`
      // 标签 div 是 circleEl 的兄弟
      const labelEl = circleEl.parentElement?.children[1] as HTMLDivElement | undefined
      if (labelEl) {
        labelEl.style.left = `${pos.x}px`
        labelEl.style.top = `${pos.y + r + 5}px`
      }
    }
    // 关联的 SVG 连线
    const svgG = svgGRef.current
    const rels = graph?.relations
    if (!svgG || !rels) return
    for (const rel of rels) {
      if (rel.sourceId !== charId && rel.targetId !== charId) continue
      const g = svgG.querySelector(`[data-rel-id="${rel.id}"]`)
      if (!g) continue
      const sp = rel.sourceId === charId ? pos : nodePositions[rel.sourceId]
      const tp = rel.targetId === charId ? pos : nodePositions[rel.targetId]
      if (!sp || !tp) continue
      const ep = edgePoints(sp, tp, 2)
      const d = rel.type === 'rightAngle'
        ? `M ${ep.sx},${ep.sy} L ${ep.tx},${ep.sy} L ${ep.tx},${ep.ty}`
        : `M ${ep.sx},${ep.sy} L ${ep.tx},${ep.ty}`
      const paths = g.querySelectorAll('path')
      paths.forEach((p) => { p.setAttribute('d', d); (p as SVGPathElement).style.transition = 'none' })
      // 更新悬浮文字位置
      const text = g.querySelector('text')
      if (text) {
        const mx = (ep.sx + ep.tx) / 2; const my = (ep.sy + ep.ty) / 2
        text.setAttribute('x', String(mx)); text.setAttribute('y', String(my - 10))
      }
    }
  }, [graph?.relations, nodePositions])

  // ═══ 画布交互 ═══
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const el = canvasRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left; const my = e.clientY - rect.top
    const cx = (mx - offX) / scale; const cy = (my - offY) / scale
    const ns = Math.max(0.15, Math.min(3, scale * (e.deltaY > 0 ? 0.9 : 1.111)))
    setScale(ns); setOffX(mx - cx * ns); setOffY(my - cy * ns)
  }, [scale, offX, offY])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const t = e.target as HTMLElement
    const nodeEl = t.closest('[data-char-id]')
    if (nodeEl) {
      const charId = nodeEl.getAttribute('data-char-id')!
      if (mode === 'connect') {
        const pos = nodePositions[charId]; if (!pos) return
        setConnecting({ fromId: charId, x: pos.x, y: pos.y })
      } else {
        const pos = nodePositions[charId]; if (!pos) return
        // 初始化 dragPosRef 为当前节点位置，确保首次渲染时 ref 已有正确值
        dragPosRef.current = { x: pos.x, y: pos.y }
        const c = toCanvas(e.clientX, e.clientY)
        dragOffsetRef.current = { ox: pos.x - c.x, oy: pos.y - c.y }
        setDragging({ charId })
      }
      e.preventDefault(); e.stopPropagation()
      return
    }
    setPanning({ sx: e.clientX, sy: e.clientY, ox: offX, oy: offY })
  }, [mode, nodePositions, offX, offY, toCanvas])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const c = toCanvas(e.clientX, e.clientY)
      // 即时更新 ref（不丢任何事件）
      dragPosRef.current = {
        x: Math.round(c.x + dragOffsetRef.current.ox),
        y: Math.round(c.y + dragOffsetRef.current.oy),
      }
      // 直接操作 DOM，绕过 React 渲染周期 → 零延迟跟随
      applyDragToDOM(dragging.charId)
      return
    }
    if (panning) { setOffX(panning.ox + e.clientX - panning.sx); setOffY(panning.oy + e.clientY - panning.sy); return }
    if (connecting) {
      const c = toCanvas(e.clientX, e.clientY)
      setConnecting((p) => p ? { ...p, x: c.x, y: c.y } : null)
    }
  }, [dragging, panning, connecting, toCanvas, applyDragToDOM])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      // 最终位置落库（state），后续 React 重新接管
      const c = toCanvas(e.clientX, e.clientY)
      dragPosRef.current = {
        x: Math.round(c.x + dragOffsetRef.current.ox),
        y: Math.round(c.y + dragOffsetRef.current.oy),
      }
      setNodePositions((p) => ({ ...p, [dragging.charId]: { ...dragPosRef.current } }))
      setDragging(null)
      return
    }
    if (connecting) {
      const t = e.target as HTMLElement
      const nodeEl = t.closest('[data-char-id]')
      if (nodeEl && graph) {
        const tid = nodeEl.getAttribute('data-char-id')!
        if (tid !== connecting.fromId) setCreatingRelation({ src: connecting.fromId, tgt: tid })
      }
      setConnecting(null)
    }
    if (panning) setPanning(null)
  }, [dragging, panning, connecting, graph, toCanvas])

  // ═══ 拖入 ═══
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const charId = e.dataTransfer.getData('text/char-id')
    if (!charId || !graph) return
    const pos = toCanvas(e.clientX, e.clientY)
    if (!graph.characterIds.includes(charId)) {
      updateCharacterGraph(graph.id, { characterIds: Array.from(new Set([...graph.characterIds, charId])) })
      setNodePositions((p) => ({ ...p, [charId]: { x: Math.round(pos.x), y: Math.round(pos.y) } }))
    }
  }, [graph, toCanvas, updateCharacterGraph])

  const addToGraph = useCallback((charId: string) => {
    if (!graph) return
    if (!graph.characterIds.includes(charId)) {
      updateCharacterGraph(graph.id, { characterIds: Array.from(new Set([...graph.characterIds, charId])) })
      setNodePositions((p) => ({ ...p, [charId]: { x: 380 + Math.round((Math.random() - 0.5) * 80), y: 300 + Math.round((Math.random() - 0.5) * 80) } }))
    }
    if (rightView === 'list') setRightView('canvas')
  }, [graph, rightView, updateCharacterGraph])

  const removeFromGraph = (charId: string) => {
    if (!graph) return
    const ids = graph.characterIds.filter((id) => id !== charId)
    const rels = graph.relations.filter((r) => r.sourceId !== charId && r.targetId !== charId)
    updateCharacterGraph(graph.id, { characterIds: ids, relations: rels })
    setNodePositions((p) => { const n = { ...p }; delete n[charId]; return n })
  }

  const openGraph = (id: string) => { setCurrentCharacterGraph(id); setRightView('canvas') }
  const handleCreateGraph = () => setShowGraphEditor({ isNew: true })
  const handleEditGraph = () => { if (graph) setShowGraphEditor({ isNew: false }) }

  const relations = graph?.relations || []
  const graphChars = useMemo(() => graphCharIds.map((id) => worldChars.find((c) => c.id === id)!).filter(Boolean), [graphCharIds, worldChars])

  const handleSaveRelation = (rel: CharacterRelation) => {
    if (rel.id) { updateCharacterRelation(rel.id, { type: rel.type, direction: rel.direction, text: rel.text || undefined, color: rel.color }) }
    else if (creatingRelation && graph) {
      addCharacterRelation({ graphId: graph.id, sourceId: creatingRelation.src, targetId: creatingRelation.tgt, type: rel.type, direction: rel.direction, text: rel.text || undefined, color: rel.color })
    }
    setEditingRelation(null); setCreatingRelation(null)
  }

  const openDetail = useCallback((ch: Character) => setDetailChar(ch), [])

  // ═══ 左侧列表项 ═══
  const listItem = (ch: Character) => {
    const pc = primaryColor(ch)
    const inGraph = graph && graphCharIds.includes(ch.id)
    return (
      <div key={ch.id} draggable
        onDragStart={(e) => { e.dataTransfer.setData('text/char-id', ch.id); (e.target as HTMLElement).style.opacity = '0.5' }}
        onDragEnd={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
        onClick={() => { if (inGraph) removeFromGraph(ch.id); else addToGraph(ch.id) }}
        onDoubleClick={() => openDetail(ch)}
        title={inGraph ? '点击移出图谱 · 双击查看详情' : '点击添加到图谱 · 双击查看详情 · 拖入右侧画布'}
        style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'14px 8px 12px',
          borderRadius:'10px',cursor:'grab',fontSize:'12px',color:'var(--color-text)',
          border:inGraph?`1.5px solid ${hexAlpha(pc,0.5)}`:'1.5px solid var(--color-page-shadow)',
          background:inGraph?`${hexAlpha(pc,0.12)}`:'rgba(245,230,200,0.3)',transition:'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',position:'relative' }}
        onMouseEnter={(ev) => { ev.currentTarget.style.borderColor=pc;ev.currentTarget.style.background=hexAlpha(pc,0.1);ev.currentTarget.style.boxShadow=`0 0 12px ${hexAlpha(pc,0.25)}` }}
        onMouseLeave={(ev) => { ev.currentTarget.style.borderColor=inGraph?hexAlpha(pc,0.5):'var(--color-page-shadow)';ev.currentTarget.style.background=inGraph?hexAlpha(pc,0.12):'rgba(245,230,200,0.3)';ev.currentTarget.style.boxShadow='none' }}>
        {inGraph && <div style={{ position:'absolute',top:'3px',right:'5px',fontSize:'10px',color:pc,opacity:0.7 }}>✓</div>}
        {ch.icon ? (isImageIcon(ch.icon) ? (
          <div style={{ width:'38px',height:'38px',borderRadius:'50%',overflow:'hidden',border:`2px solid ${darken(pc,0.3)}`,flexShrink:0 }}>
            <img src={ch.icon} alt={ch.name} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
          </div>
        ) : (
          <svg viewBox="-10 -10 20 20" width="38" height="38" style={{ flexShrink:0 }}>
            {renderCharIcon(ch.icon, 8, pc)}
          </svg>
        )) : (
          <div style={{ width:'38px',height:'38px',borderRadius:'50%',background:pc,flexShrink:0,
            border:`2px solid ${darken(pc,0.35)}`,display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',fontWeight:700,color:'#f5e6c8' }}>{ch.name.charAt(0)}</div>
        )}
        <span style={{ maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600,lineHeight:1.2,textAlign:'center',fontSize:'13px' }}>{ch.name}</span>
        {ch.tags.length>0 && <div style={{ display:'flex',gap:'2px',flexWrap:'wrap',justifyContent:'center' }}>{ch.tags.slice(0,2).map((t)=>(
          <span key={t.id} style={{ width:'5px',height:'5px',borderRadius:'50%',background:t.color,border:`0.5px solid ${darken(t.color,0.3)}` }} />))}{ch.tags.length>2 && <span style={{ fontSize:'8px',color:'var(--color-text-muted)' }}>+</span>}</div>}
      </div>
    )
  }

  return (
    <div style={{ display:'flex',height:'100%',position:'relative' }}>
      {/* 左侧面板 */}
      <div style={{ flex:'0 0 38%', minWidth:0,display:'flex',flexDirection:'column',padding:'24px 22px',overflow:'hidden' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px' }}>
          <h2 style={{ fontSize:'18px',color:GOLD,margin:0,letterSpacing:'2px' }}>人物图谱</h2>
          <div onClick={goBack} style={{ padding:'4px 10px',borderRadius:'5px',cursor:'pointer',fontSize:'12px',color:'var(--color-text-light)',border:'1px solid var(--color-page-shadow)' }}>← 返回</div>
        </div>
        <input className="input" placeholder="搜索人物..." value={search} onChange={(e)=>setSearch(e.target.value)} style={{ marginBottom:'10px',fontSize:'13px',padding:'8px 12px' }} />
        <div style={{ fontSize:'11px',color:'var(--color-text-muted)',marginBottom:'8px' }}>{leftChars.length} 个人物 · {graph?`${graphCharIds.length} 在图谱中`:'未选择图谱'}</div>
        <div style={{ fontSize:'11px',color:'var(--color-text-muted)',marginBottom:'10px',fontStyle:'italic' }}>点击添加/移出 · 拖入右侧画布定位 · 双击查看详情</div>
        <div style={{ flex:1,overflowY:'auto',overflowX:'hidden' }}>
          {leftChars.length===0 ? <div style={{ textAlign:'center',padding:'30px',color:'var(--color-text-muted)',fontSize:'13px' }}>无匹配人物</div> : <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',alignContent:'start',paddingRight:'4px' }}>{leftChars.map(listItem)}</div>}
        </div>
      </div>

      {/* 书脊 */}
      <div style={{ width:'3px',flexShrink:0,background:'linear-gradient(90deg, #8b6914, #4a3728 50%, #8b6914)',boxShadow:'0 0 8px rgba(0,0,0,0.3), inset 0 0 4px rgba(0,0,0,0.2)' }} />
      <div style={{ position:'absolute',top:0,bottom:0,left:'calc(38% - 8px)',width:'16px',background:'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)',pointerEvents:'none',zIndex:1 }} />

      {/* 右侧面板 */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',padding:'24px 22px',background:'rgba(245,230,200,0.15)' }}>
        {rightView==='list'||!graph?(
          <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
            <h3 style={{ fontSize:'16px',color:GOLD,marginBottom:'14px',letterSpacing:'1px' }}>人物关系图谱</h3>
            {worldGraphs.length===0 ? <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'12px' }}><GraphEmptyIcon /><p style={{ color:'var(--color-text-muted)',fontSize:'13px' }}>尚未创建关系图谱</p></div>
            : <div style={{ flex:1,overflowY:'auto',overflowX:'hidden' }}>{worldGraphs.map((g)=>(
              <div key={g.id} onClick={()=>openGraph(g.id)} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',borderRadius:'10px',cursor:'pointer',marginBottom:'8px',border:`1.5px solid ${g.id===currentGraphId?GOLD:'var(--color-page-shadow)'}`,background:g.id===currentGraphId?'rgba(184,134,11,0.1)':'rgba(245,230,200,0.3)',transition:'all 0.2s ease' }}
                onMouseEnter={(ev)=>{ev.currentTarget.style.borderColor=GOLD_LIGHT;ev.currentTarget.style.background='rgba(184,134,11,0.08)';ev.currentTarget.style.transform='translateX(3px)'}}
                onMouseLeave={(ev)=>{ev.currentTarget.style.borderColor=g.id===currentGraphId?GOLD:'var(--color-page-shadow)';ev.currentTarget.style.background=g.id===currentGraphId?'rgba(184,134,11,0.1)':'rgba(245,230,200,0.3)';ev.currentTarget.style.transform='translateX(0)'}}>
                <span style={{ width:'14px',height:'14px',borderRadius:'50%',background:g.color,flexShrink:0,border:`2px solid ${darken(g.color,0.3)}` }} />
                <div style={{ flex:1 }}><div style={{ fontSize:'15px',fontWeight:600,color:'var(--color-text)' }}>{g.name}</div><div style={{ fontSize:'11px',color:'var(--color-text-muted)',marginTop:'2px' }}>{g.characterIds.length} 人 · {g.relations.length} 关系</div></div>
                <span style={{ fontSize:'18px',color:GOLD,opacity:0.5 }}>›</span>
              </div>))}</div>}
            <div style={{ borderTop:'1px solid var(--color-page-shadow)',paddingTop:'12px',marginTop:'8px' }}>
              <div onClick={handleCreateGraph} style={{ padding:'12px',borderRadius:'8px',cursor:'pointer',textAlign:'center',border:`1.5px dashed ${GOLD}55`,color:GOLD,fontSize:'14px',fontWeight:600 }}
                onMouseEnter={(ev)=>{ev.currentTarget.style.background='rgba(184,134,11,0.08)';ev.currentTarget.style.borderColor=GOLD_LIGHT}} onMouseLeave={(ev)=>{ev.currentTarget.style.background='transparent';ev.currentTarget.style.borderColor=`${GOLD}55`}}>+ 新建人物关系图谱</div>
            </div>
          </div>
        ):(
          /* ── 画布视图 ── */
          <div style={{ display:'flex',flexDirection:'column',height:'100%',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px',flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                <button className="btn" style={{ fontSize:'12px',padding:'4px 10px' }} onClick={()=>setRightView('list')}>← 图谱列表</button>
                <span style={{ fontSize:'14px',fontWeight:600,color:GOLD }}>{graph?.name}</span>
              </div>
              <span style={{ fontSize:'12px',color:'var(--color-text-muted)' }}>{graphCharIds.length} 人 · {relations.length} 关系</span>
            </div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px',flexShrink:0 }}>
              <div style={{ display:'flex',gap:'4px' }}>
                <button className={`btn${mode==='view'?' btn-primary':''}`} onClick={()=>{setMode('view');setConnecting(null)}} style={{ fontSize:'12px',padding:'3px 10px' }}>查看</button>
                <button className={`btn${mode==='connect'?' btn-primary':''}`} onClick={()=>setMode('connect')} style={{ fontSize:'12px',padding:'3px 10px' }}>连线</button>
              </div>
              <div style={{ display:'flex',gap:'4px' }}>
                <button className="btn" style={{ fontSize:'12px',padding:'3px 8px' }} onClick={handleEditGraph}>设置</button>
                <button className="btn" style={{ fontSize:'12px',padding:'3px 8px' }} onClick={()=>{setScale(0.75);setOffX(40);setOffY(30)}}>重置</button>
                <button className="btn btn-danger" style={{ fontSize:'12px',padding:'3px 8px' }} onClick={()=>{if(graph)setDeleteConfirm(graph.id)}}>删除</button>
              </div>
            </div>

            {/* 画布 */}
            <div ref={canvasRef} style={{ flex:1,position:'relative',overflow:'hidden',borderRadius:'8px',border:'3px solid var(--color-page-shadow)',background:'#e0ceaa',cursor:dragging?'grabbing':panning?'grabbing':mode==='connect'?'crosshair':'grab' }}
              onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
              onMouseLeave={()=>{if(dragging){setNodePositions((p)=>({...p,[dragging.charId]:{...dragPosRef.current}}))};setDragging(null);setPanning(null);if(!creatingRelation)setConnecting(null)}}
              onContextMenu={(e)=>{if(mode==='connect'){e.preventDefault();setConnecting(null)}}}
              onDragOver={handleDragOver} onDrop={handleDrop} tabIndex={0}>
              <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0,background:`radial-gradient(ellipse at 30% 20%, #f0e0c0 0%, #e8d5b0 40%, #dcc8a0 100%), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,105,20,0.03) 3px, rgba(139,105,20,0.03) 6px)` }} />
              <div style={{ position:'absolute',inset:'12px',border:'1.5px solid rgba(139,105,20,0.2)',borderRadius:'2px',pointerEvents:'none',zIndex:0 }} />

              <div style={{ position:'absolute',transform:`translate(${offX}px,${offY}px) scale(${scale})`,transformOrigin:'0 0',width:0,height:0,zIndex:1 }}>
                <svg style={{ position:'absolute',inset:0,overflow:'visible',pointerEvents:'none' }} width={1} height={1}>
                  <defs>
                    <marker id="cgArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill={GOLD} /></marker>
                    <marker id="cgArrowHover" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill={GOLD_LIGHT} /></marker>
                  </defs>
                  <g ref={svgGRef} pointerEvents="auto">
                    {relations.map((rel)=>{
                      // 拖拽中：被拖拽节点的位置直接从 ref 读取（首次渲染时 ref 已有正确值）
                      const sp=dragging&&rel.sourceId===dragging.charId?dragPosRef.current:nodePositions[rel.sourceId]
                      const tp=dragging&&rel.targetId===dragging.charId?dragPosRef.current:nodePositions[rel.targetId]
                      if(!sp||!tp) return null
                      const ep=edgePoints(sp,tp,2)
                      const dx=tp.x-sp.x;const dy=tp.y-sp.y
                      const midX=(ep.sx+ep.tx)/2;const midY=(ep.sy+ep.ty)/2
                      const isHover=!dragging && hoveredRelId===rel.id
                      const relColor=rel.color||GOLD
                      const d=rel.type==='rightAngle'?`M ${ep.sx},${ep.sy} L ${ep.tx},${ep.sy} L ${ep.tx},${ep.ty}`:`M ${ep.sx},${ep.sy} L ${ep.tx},${ep.ty}`
                      const showArrow=rel.direction!=='twoWay'
                      const me=showArrow?(isHover?'url(#cgArrowHover)':'url(#cgArrow)'):undefined
                      const ms=rel.direction==='twoWay'?(isHover?'url(#cgArrowHover)':'url(#cgArrow)'):undefined
                      return (
                        <g key={rel.id} data-rel-id={rel.id}>
                          <path d={d} fill="none" stroke="transparent" strokeWidth={16} style={{ cursor:'pointer' }}
                            onMouseEnter={()=>{if(!dragging)setHoveredRelId(rel.id)}} onMouseLeave={()=>{if(!dragging)setHoveredRelId(null)}}
                            onClick={(ev)=>{ev.stopPropagation();setEditingRelation({...rel})}}
                            onContextMenu={(ev)=>{ev.preventDefault();ev.stopPropagation();setEditingRelation({...rel})}} />
                          <path d={d} fill="none" stroke={relColor} strokeWidth={isHover?2.5:1.8} opacity={isHover?1:0.65}
                            markerStart={ms} markerEnd={me} style={{ transition:dragging?'none':'all 0.15s ease',pointerEvents:'none' }} />
                          {rel.text && isHover && <text x={midX} y={midY-10} textAnchor="middle" fill={relColor} fontSize="11" fontWeight={600} style={{ pointerEvents:'none' }}>{rel.text}</text>}
                        </g>
                      )
                    })}
                    {connecting && (
                      <line x1={nodePositions[connecting.fromId]?.x||0} y1={nodePositions[connecting.fromId]?.y||0} x2={connecting.x} y2={connecting.y}
                        stroke={GOLD_LIGHT} strokeWidth="2" strokeDasharray="6 4" opacity="0.7" markerEnd="url(#cgArrow)" pointerEvents="none" />
                    )}
                  </g>
                </svg>

                {/* 节点 */}
                {graphChars.map((ch)=>{
                  if(!ch) return null
                  const isDrag=dragging?.charId===ch.id
                  // 拖拽中：节点位置直接从 ref 读取，确保与连线同步不脱节
                  const pos=isDrag?dragPosRef.current:nodePositions[ch.id];if(!pos) return null
                  const pc=primaryColor(ch);const r=NODE_R
                  const isSource=connecting?.fromId===ch.id
                  return (
                    <div key={ch.id}>
                      <div data-char-id={ch.id} style={{ position:'absolute',left:pos.x,top:pos.y,width:r*2,height:r*2,
                        borderRadius:'50%',transform:`translate(-${r}px,-${r}px)`,background:pc,
                        border:`3px solid ${isSource?GOLD_LIGHT:darken(pc,0.4)}`,
                        boxShadow:isDrag?`0 8px 28px rgba(0,0,0,0.25),0 0 20px ${hexAlpha(pc,0.5)}`:isSource?`0 6px 20px rgba(0,0,0,0.2),0 0 16px ${hexAlpha(pc,0.55)}`:`0 3px 12px rgba(0,0,0,0.12),0 0 8px ${hexAlpha(pc,0.2)}`,
                        cursor:mode==='connect'?(isSource?'pointer':'crosshair'):'grab',transition:isDrag?'none':'box-shadow 0.2s ease, border-color 0.2s ease',
                        zIndex:isDrag?10:2,display:'flex',alignItems:'center',justifyContent:'center' }}
                        onMouseEnter={()=>{if(!dragging)setHoveredNodeId(ch.id)}} onMouseLeave={()=>{if(hoveredNodeId===ch.id)setHoveredNodeId(null)}}
                        onDoubleClick={()=>openDetail(ch)} title="双击查看详情 · 从左侧面板移出图谱">
                        {hoveredNodeId===ch.id && (
                          <div onClick={(ev)=>{ev.stopPropagation();ev.preventDefault();removeFromGraph(ch.id);setHoveredNodeId(null)}}
                            style={{ position:'absolute',top:'-6px',right:'-6px',width:'18px',height:'18px',borderRadius:'50%',
                              background:'#b43c3c',border:'1.5px solid #f5e6c8',display:'flex',alignItems:'center',justifyContent:'center',
                              cursor:'pointer',zIndex:5,fontSize:'10px',color:'#f5e6c8',fontWeight:700,lineHeight:1 }} title="从图谱中移除">✕</div>
                        )}
                        {ch.icon ? (isImageIcon(ch.icon) ? (
                          <div style={{ width:r*1.5, height:r*1.5, borderRadius:'50%', overflow:'hidden', pointerEvents:'none' }}>
                            <img src={ch.icon} alt={ch.name} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
                          </div>
                        ) : (
                          <svg viewBox="-10 -10 20 20" width={r*1.5} height={r*1.5} style={{ pointerEvents:'none' }}>
                            {renderCharIcon(ch.icon, 8, '#f5e6c8')}
                          </svg>
                        )) : (
                          <svg viewBox="-10 -10 20 20" width={r*1.2} height={r*1.2} style={{ pointerEvents:'none', opacity:0.4 }}>
                            <circle cx={0} cy={0} r={7} fill="none" stroke="#f5e6c8" strokeWidth={1.8} />
                          </svg>
                        )}
                      </div>
                      <div style={{ position:'absolute',left:pos.x,top:pos.y+r+5,transform:'translateX(-50%)',pointerEvents:'none',zIndex:1,textAlign:'center',maxWidth:'90px' }}>
                        <span style={{ fontSize:'12px',fontWeight:700,color:'var(--color-text)',textShadow:'0 0 4px rgba(245,230,200,0.8)',lineHeight:1.2 }}>{ch.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ position:'absolute',bottom:'8px',right:'12px',fontSize:'11px',color:'var(--color-text-muted)',background:'rgba(245,230,200,0.7)',padding:'2px 7px',borderRadius:'4px',pointerEvents:'none',zIndex:20 }}>{Math.round(scale*100)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* 弹窗 */}
      {showGraphEditor && <GraphEditorModal isNew={showGraphEditor.isNew} graph={graph}
        onSave={(n,c)=>{if(showGraphEditor.isNew){addCharacterGraph(n,c);setRightView('canvas')}else if(graph)updateCharacterGraph(graph.id,{name:n,color:c});setShowGraphEditor(null)}}
        onClose={()=>setShowGraphEditor(null)} />}
      {deleteConfirm && <DeleteGraphModal graphName={worldGraphs.find((g)=>g.id===deleteConfirm)?.name||''}
        onConfirm={()=>{deleteCharacterGraph(deleteConfirm);setDeleteConfirm(null);setRightView('list')}} onClose={()=>setDeleteConfirm(null)} />}
      {editingRelation && <RelationEditorModal relation={editingRelation}
        sourceName={worldChars.find((c)=>c.id===editingRelation.sourceId)?.name||'?'} targetName={worldChars.find((c)=>c.id===editingRelation.targetId)?.name||'?'}
        onSave={handleSaveRelation} onDelete={()=>{deleteCharacterRelation(editingRelation.id);setEditingRelation(null)}} onClose={()=>setEditingRelation(null)} />}
      {creatingRelation && <RelationEditorModal relation={{ id:'',graphId:graph?.id||'',sourceId:creatingRelation.src,targetId:creatingRelation.tgt,type:'line',direction:'oneWay' } as CharacterRelation}
        sourceName={worldChars.find((c)=>c.id===creatingRelation.src)?.name||'?'} targetName={worldChars.find((c)=>c.id===creatingRelation.tgt)?.name||'?'}
        onSave={handleSaveRelation} onClose={()=>setCreatingRelation(null)} />}
      {detailChar && <CharacterDetailModal character={detailChar}
        onEdit={(c)=>{updateCharacter(c.id,{name:c.name,identity:c.identity,race:c.race,birthplace:c.birthplace,age:c.age,birthDate:c.birthDate,power:c.power,title:c.title,tags:c.tags,description:c.description});setDetailChar(null)}}
        onClose={()=>setDetailChar(null)} />}
    </div>
  )
}

// ═══════════════ 子组件 ═══════════════

function CharacterDetailModal({ character, onEdit, onClose }: { character: Character; onEdit: (c:Character)=>void; onClose: ()=>void }) {
  const [editing,setEditing]=useState(false);const [nm,setNm]=useState(character.name);const [identity,setIdentity]=useState(character.identity||'')
  const [race,setRace]=useState(character.race||'');const [birthplace,setBirthplace]=useState(character.birthplace||'');const [age,setAge]=useState(character.age||'')
  const [birthDate,setBirthDate]=useState(character.birthDate||'');const [power,setPower]=useState(character.power||'');const [title,setTitle]=useState(character.title||'');const [desc,setDesc]=useState(character.description||'')
  return createPortal(<div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e)=>e.stopPropagation()} style={{ maxWidth:'520px',width:'90%',maxHeight:'85vh',overflowY:'auto',overflowX:'hidden' }}>
    <h2>{editing?'编辑人物':'人物详情'}</h2>
    <div style={{ display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'14px' }}>{character.tags.map((t)=>(<span key={t.id} style={{ padding:'3px 8px',borderRadius:'4px',fontSize:'11px',fontWeight:500,color:t.color,background:`${t.color}14`,border:`1px solid ${t.color}44` }}>{t.name}</span>))}</div>
    {editing?<>
      <div className="form-group"><label>姓名 *</label><input className="input" value={nm} onChange={(e)=>setNm(e.target.value)} autoFocus /></div>
      <div style={{ display:'flex',gap:'12px' }}><div className="form-group" style={{ flex:1 }}><label>身份</label><input className="input" value={identity} onChange={(e)=>setIdentity(e.target.value)} /></div><div className="form-group" style={{ flex:1 }}><label>种族</label><input className="input" value={race} onChange={(e)=>setRace(e.target.value)} /></div></div>
      <div style={{ display:'flex',gap:'12px' }}><div className="form-group" style={{ flex:1 }}><label>出生地</label><input className="input" value={birthplace} onChange={(e)=>setBirthplace(e.target.value)} /></div><div className="form-group" style={{ flex:1 }}><label>年龄</label><input className="input" value={age} onChange={(e)=>setAge(e.target.value)} /></div></div>
      <div style={{ display:'flex',gap:'12px' }}><div className="form-group" style={{ flex:1 }}><label>出生日期</label><input className="input" value={birthDate} onChange={(e)=>setBirthDate(e.target.value)} /></div><div className="form-group" style={{ flex:1 }}><label>实力</label><input className="input" value={power} onChange={(e)=>setPower(e.target.value)} /></div></div>
      <div className="form-group"><label>称号</label><input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
      <div className="form-group"><label>描述</label><textarea className="input" value={desc} onChange={(e)=>setDesc(e.target.value)} rows={3} style={{ resize:'vertical',fontFamily:'inherit' }} /></div>
    </>:<>
      <h3 style={{ fontSize:'20px',fontWeight:700,color:'var(--color-text)',margin:'0 0 16px' }}>{character.name}</h3>
      <div style={{ display:'flex',flexDirection:'column',gap:'8px',marginBottom:'16px' }}>{[['身份',character.identity],['种族',character.race],['出生地',character.birthplace],['年龄',character.age],['出生日期',character.birthDate],['实力',character.power],['称号',character.title]].filter(([,v])=>v).map(([l,v])=>(<div key={l!} style={{ display:'flex',gap:'12px',fontSize:'14px' }}><span style={{ color:'var(--color-text-muted)',minWidth:'70px',fontWeight:500 }}>{l}</span><span style={{ color:'var(--color-text)' }}>{v as string}</span></div>))}</div>
      <div style={{ fontSize:'14px',color:'var(--color-text-light)',lineHeight:'1.8',whiteSpace:'pre-wrap',marginBottom:'16px' }}>{character.description||'暂无描述'}</div>
    </>}
    <div className="form-actions"><button className="btn" onClick={onClose}>关闭</button>{editing?<button className="btn btn-primary" disabled={!nm.trim()} onClick={()=>{onEdit({...character,name:nm.trim(),identity,race,birthplace,age,birthDate,power,title,description:desc});setEditing(false)}}>保存</button>:<button className="btn btn-primary" onClick={()=>setEditing(true)}>编辑</button>}</div>
  </div></div>,document.body)
}

function GraphEditorModal({ isNew,graph,onSave,onClose }: { isNew:boolean;graph:CharacterGraph|null;onSave:(n:string,c:string)=>void;onClose:()=>void }) {
  const [nm,setNm]=useState(graph?.name||'');const [cl,setCl]=useState(graph?.color||GOLD)
  return createPortal(<div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e)=>e.stopPropagation()} style={{ maxWidth:'420px' }}>
    <h2>{isNew?'创建图谱':'编辑图谱'}</h2>
    <div className="form-group"><label>图谱名称 *</label><input className="input" value={nm} onChange={(e)=>setNm(e.target.value)} placeholder="如：势力关系、家族谱系..." autoFocus onKeyDown={(e)=>{if(e.key==='Enter'&&nm.trim())onSave(nm.trim(),cl)}} /></div>
    <div className="form-group"><label>图谱颜色</label><ColorPicker value={cl} onChange={setCl} /></div>
    <div className="form-actions"><button className="btn" onClick={onClose}>取消</button><button className="btn btn-primary" disabled={!nm.trim()} onClick={()=>onSave(nm.trim(),cl)}>{isNew?'创建':'保存'}</button></div>
  </div></div>,document.body)
}

function DeleteGraphModal({ graphName,onConfirm,onClose }: { graphName:string;onConfirm:()=>void;onClose:()=>void }) {
  const [input,setInput]=useState('');const canDelete=input.trim()===graphName
  return createPortal(<div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e)=>e.stopPropagation()} style={{ maxWidth:'440px' }}>
    <h2 style={{ color:'#b43c3c' }}>删除图谱</h2>
    <div style={{ marginBottom:'18px',fontSize:'14px',color:'var(--color-text-light)',lineHeight:'1.7',textAlign:'center' }}>此操作不可撤销。图谱中的<b>所有关系连线</b>也将被永久删除。</div>
    <div className="form-group"><label>请输入图谱名称 <b style={{ color:'#b43c3c' }}>{graphName}</b> 以确认：</label><input className="input" value={input} onChange={(e)=>setInput(e.target.value)} placeholder={graphName} autoFocus onKeyDown={(e)=>{if(e.key==='Enter'&&canDelete)onConfirm()}} /></div>
    <div className="form-actions"><button className="btn" onClick={onClose}>取消</button><button className="btn btn-danger" disabled={!canDelete} onClick={onConfirm} style={{ opacity:canDelete?1:0.4 }}>确认删除</button></div>
  </div></div>,document.body)
}

function RelationEditorModal({ relation,sourceName,targetName,onSave,onDelete,onClose }: {
  relation:CharacterRelation;sourceName:string;targetName:string;onSave:(r:CharacterRelation)=>void;onDelete?:()=>void;onClose:()=>void
}) {
  const isNew=!relation.id;const [type,setType]=useState(relation.type||'line');const [dir,setDir]=useState(relation.direction||'oneWay');const [text,setText]=useState(relation.text||'');const [color,setColor]=useState(relation.color||GOLD)
  const save=()=>onSave({...relation,type,direction:dir,text,color})
  return createPortal(<div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e)=>e.stopPropagation()} style={{ maxWidth:'460px' }}>
    <h2>{isNew?'创建关系':'编辑关系'}</h2>
    <div style={{ textAlign:'center',marginBottom:'20px',fontSize:'14px',color:'var(--color-text-light)' }}><span style={{ fontWeight:600,color:GOLD }}>{sourceName}</span><span style={{ margin:'0 8px',opacity:0.4 }}>→</span><span style={{ fontWeight:600,color:GOLD }}>{targetName}</span></div>
    <div className="form-group"><label>连线颜色</label><ColorPicker value={color} onChange={setColor} /></div>
    <div className="form-group"><label>连线样式</label>
      <div style={{ display:'flex',gap:'8px' }}>
        <div onClick={()=>setType('line')} style={{ flex:1,padding:'10px',borderRadius:'8px',cursor:'pointer',textAlign:'center',fontSize:'13px',border:`2px solid ${type==='line'?GOLD:'var(--color-page-shadow)'}`,background:type==='line'?'rgba(184,134,11,0.1)':'transparent',color:type==='line'?GOLD:'var(--color-text-light)' }}><svg width="40" height="20"><line x1="4" y1="10" x2="36" y2="10" stroke={type==='line'?GOLD:'#888'} strokeWidth="2" /></svg><div>直线</div></div>
        <div onClick={()=>setType('rightAngle')} style={{ flex:1,padding:'10px',borderRadius:'8px',cursor:'pointer',textAlign:'center',fontSize:'13px',border:`2px solid ${type==='rightAngle'?GOLD:'var(--color-page-shadow)'}`,background:type==='rightAngle'?'rgba(184,134,11,0.1)':'transparent',color:type==='rightAngle'?GOLD:'var(--color-text-light)' }}><svg width="40" height="20"><path d="M 4,15 L 20,15 L 20,5 L 36,5" fill="none" stroke={type==='rightAngle'?GOLD:'#888'} strokeWidth="2" /></svg><div>直角</div></div>
      </div>
    </div>
    <div className="form-group"><label>方向</label>
      <div style={{ display:'flex',gap:'8px' }}>
        <div onClick={()=>setDir('oneWay')} style={{ flex:1,padding:'10px',borderRadius:'8px',cursor:'pointer',textAlign:'center',fontSize:'13px',border:`2px solid ${dir==='oneWay'?GOLD:'var(--color-page-shadow)'}`,background:dir==='oneWay'?'rgba(184,134,11,0.1)':'transparent',color:dir==='oneWay'?GOLD:'var(--color-text-light)' }}>单向 →</div>
        <div onClick={()=>setDir('twoWay')} style={{ flex:1,padding:'10px',borderRadius:'8px',cursor:'pointer',textAlign:'center',fontSize:'13px',border:`2px solid ${dir==='twoWay'?GOLD:'var(--color-page-shadow)'}`,background:dir==='twoWay'?'rgba(184,134,11,0.1)':'transparent',color:dir==='twoWay'?GOLD:'var(--color-text-light)' }}>双向 ⇄</div>
      </div>
    </div>
    <div className="form-group"><label>关系描述（仅悬浮时显示）</label><input className="input" value={text} onChange={(e)=>setText(e.target.value)} placeholder="如：父子、师徒、结盟、敌对..." autoFocus onKeyDown={(e)=>{if(e.key==='Enter')save()}} /></div>
    <div className="form-actions" style={{ justifyContent:'space-between' }}><div>{onDelete&&<button className="btn btn-danger" onClick={onDelete}>删除关系</button>}</div><div style={{ display:'flex',gap:'10px' }}><button className="btn" onClick={onClose}>取消</button><button className="btn btn-primary" onClick={save}>{isNew?'创建':'保存'}</button></div></div>
  </div></div>,document.body)
}

function GraphEmptyIcon() {
  return <svg viewBox="0 0 80 80" width="80" height="80" fill="none"><circle cx="30" cy="25" r="9" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.5" /><circle cx="55" cy="40" r="9" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.5" /><circle cx="35" cy="60" r="9" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.5" /><line x1="37" y1="29" x2="48" y2="37" stroke={GOLD} strokeWidth="1.5" opacity="0.4" /><line x1="35" y1="33" x2="38" y2="53" stroke={GOLD} strokeWidth="1.5" opacity="0.4" /><line x1="49" y1="47" x2="42" y2="55" stroke={GOLD} strokeWidth="1.5" opacity="0.4" /></svg>
}
