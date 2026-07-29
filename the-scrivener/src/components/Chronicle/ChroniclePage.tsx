// ========================================
// 世界编年史 - 纵向时间轴编辑器
// 分支: 内嵌父节点行，CSS transform 相对轴线偏移
// ========================================

import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { TimelineNode, Era } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { GOLD, GOLD_LIGHT } from '@/utils/color'
const DEFAULT_COLOR = '#8B7355'
const DRAG_THRESHOLD = 5

type EditorMode = 'normal' | 'edit' | 'era'

interface HoverPopup {
  node: TimelineNode; color: string; x: number; y: number
}

export function ChroniclePage() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const timelineNodes = useAppStore((s) => s.timelineNodes)
  const eras = useAppStore((s) => s.eras)
  const addTimelineNode = useAppStore((s) => s.addTimelineNode)
  const updateTimelineNode = useAppStore((s) => s.updateTimelineNode)
  const deleteTimelineNode = useAppStore((s) => s.deleteTimelineNode)
  const addEra = useAppStore((s) => s.addEra)
  const updateEra = useAppStore((s) => s.updateEra)
  const deleteEra = useAppStore((s) => s.deleteEra)
  const goBack = useAppStore((s) => s.goBack)

  const [mode, setMode] = useState<EditorMode>('normal')
  const [popup, setPopup] = useState<HoverPopup | null>(null)
  const [editingNode, setEditingNode] = useState<TimelineNode | null>(null)
  const [selectedEraNodes, setSelectedEraNodes] = useState<string[]>([])
  const [eraEditor, setEraEditor] = useState<{ isNew: boolean; era?: Era } | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [, forceTick] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    parentId: string; axisX: number; startY: number // parent dot 在容器内的 Y
    curX: number; curY: number; repositionId?: string
  } | null>(null)
  const dragStarted = useRef(false)
  const dragOrigin = useRef({ x: 0, y: 0 }) // 拖拽起点 (容器坐标)

  const worldNodes = timelineNodes.filter((n) => n.worldId === currentWorldId).sort((a, b) => a.position - b.position)
  const worldEras = eras.filter((e) => e.worldId === currentWorldId)
  const rootNodes = worldNodes.filter((n) => !n.parentId)
  const getBranches = (parentId: string) => worldNodes.filter((n) => n.parentId === parentId)

  const isConsecutive = (ids: string[]) => {
    if (ids.length <= 1) return true
    const p = rootNodes.filter((n) => ids.includes(n.id)).map((n) => n.position).sort((a, b) => a - b)
    for (let i = 1; i < p.length; i++) if (p[i] - p[i - 1] !== 1) return false
    return true
  }
  const canCreateEra = mode === 'era' && selectedEraNodes.length > 0 && isConsecutive(selectedEraNodes)

  // 容器坐标转换
  const toC = (vx: number, vy: number) => {
    const el = scrollRef.current; if (!el) return { x: vx, y: vy }
    const r = el.getBoundingClientRect()
    return { x: vx - r.left + el.scrollLeft, y: vy - r.top + el.scrollTop }
  }

  const handleAddRoot = () => {
    const mp = worldNodes.reduce((m, n) => Math.max(m, n.position), -1)
    setEditingNode({ id: '', worldId: currentWorldId!, eventName: '', eventTime: '', eventContent: '', color: GOLD, position: mp + 1 })
  }

  const handleSave = (n: TimelineNode) => {
    if (!n.eventName.trim()) return
    if (n.id) updateTimelineNode(n.id, { eventName: n.eventName, eventTime: n.eventTime, eventContent: n.eventContent, color: n.color, position: n.position, parentId: n.parentId, branchOffset: n.branchOffset })
    else addTimelineNode({ worldId: n.worldId, eventName: n.eventName, eventTime: n.eventTime, eventContent: n.eventContent, color: n.color, position: n.position, parentId: n.parentId, branchOffset: n.branchOffset })
    setEditingNode(null)
  }

  const handleDelete = (id: string) => { deleteTimelineNode(id); setEditingNode(null) }

  const handleContextMenu = useCallback((e: React.MouseEvent, node: TimelineNode) => {
    if (mode !== 'edit') return; e.preventDefault(); e.stopPropagation(); setEditingNode({ ...node })
  }, [mode])

  const handleNodeClick = (e: React.MouseEvent, node: TimelineNode, color: string) => {
    if (mode === 'era' || dragStarted.current) return
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPopup(popup?.node.id === node.id ? null : { node, color, x: rect.right + 12, y: rect.top - 8 })
  }

  // ═══ 拖拽 ═══
  const startDrag = (e: React.MouseEvent, parentId: string, parentDotY: number, repositionId?: string) => {
    if (mode !== 'edit' || e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const c = toC(e.clientX, e.clientY)
    dragOrigin.current = { x: c.x, y: c.y }
    dragStarted.current = false
    const el = scrollRef.current; const ax = el ? el.getBoundingClientRect().width / 2 : 0
    dragRef.current = { parentId, axisX: ax, startY: parentDotY, curX: c.x, curY: c.y, repositionId }
    setIsDragging(true)
  }

  const onDragMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return; e.preventDefault()
    const c = toC(e.clientX, e.clientY)
    if (!dragStarted.current && (Math.abs(c.x - dragOrigin.current.x) > DRAG_THRESHOLD || Math.abs(c.y - dragOrigin.current.y) > DRAG_THRESHOLD)) dragStarted.current = true
    dragRef.current.curX = c.x; dragRef.current.curY = c.y
    forceTick((t) => t + 1)
  }

  const onDragUp = () => {
    const d = dragRef.current; if (!d) return
    if (!dragStarted.current) { setIsDragging(false); dragRef.current = null; return }
    const ox = d.curX - d.axisX; const oy = d.curY - d.startY
    if (d.repositionId) updateTimelineNode(d.repositionId, { branchOffset: { x: ox, y: oy } })
    else setEditingNode({ id: '', worldId: currentWorldId!, eventName: '', eventTime: '', eventContent: '', color: GOLD, position: 0, parentId: d.parentId, branchOffset: { x: ox, y: oy } })
    setIsDragging(false); dragRef.current = null; dragStarted.current = false
  }

  // ── 时代 ──
  const handleCreateEra = () => { if (canCreateEra) setEraEditor({ isNew: true }) }
  const submitEra = (n: string, c: string) => { if (!n.trim()) return; addEra({ worldId: currentWorldId!, name: n.trim(), color: c, nodeIds: selectedEraNodes }); setEraEditor(null); setSelectedEraNodes([]) }
  const handleEditEra = (e: Era) => setEraEditor({ isNew: false, era: e })
  const submitEraEdit = (id: string, n: string, c: string) => { updateEra(id, { name: n.trim(), color: c }); setEraEditor(null) }
  const handleDeleteEra = (id: string) => { deleteEra(id); setEraEditor(null) }
  const handleEraAxisClick = (era: Era) => { if (mode !== 'era') return; setSelectedEraNodes([...era.nodeIds]) }
  const toggleEraNode = (nid: string) => {
    if (mode !== 'era') return
    setSelectedEraNodes((p) => p.includes(nid) ? p.filter((id) => id !== nid) : Array.from(new Set([...p, nid, ...getBranches(nid).map((b) => b.id)])))
  }
  const leaveEditMode = () => { setMode('normal'); setSelectedEraNodes([]); setPopup(null) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--color-accent)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn" onClick={goBack}>← 返回</button>
          <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>世界编年史</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{rootNodes.length} 事件{worldEras.length > 0 && ` · ${worldEras.length} 时代`}</span>
          {mode === 'normal' && (<><button className="btn btn-primary" onClick={() => setMode('edit')}>编辑节点</button><button className="btn" onClick={() => setMode('era')}>划分时代</button></>)}
          {(mode === 'edit' || mode === 'era') && <button className="btn" onClick={leaveEditMode}>完成{mode === 'edit' ? '节点' : '时代'}编辑</button>}
        </div>
      </div>

      {mode === 'era' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', marginBottom: '14px', borderRadius: '8px', flexShrink: 0, background: 'rgba(184,134,11,0.08)', border: '1px dashed var(--color-accent)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>选择连续时间节点创建时代&nbsp;{selectedEraNodes.length > 0 && <span style={{ color: GOLD }}>已选 {selectedEraNodes.length} 个{!isConsecutive(selectedEraNodes) && <span style={{ color: '#b43c3c' }}> — 节点须连续</span>}</span>}</div>
          <button className="btn btn-primary" disabled={!canCreateEra} onClick={handleCreateEra}>创建时代</button>
        </div>
      )}

      {rootNodes.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '15px', flexDirection: 'column', gap: '12px' }}>
          世界尚未记录任何事件
          <button className="btn btn-primary" onClick={handleAddRoot}>+ 添加第一个事件</button>
        </div>
      ) : (
        <div ref={scrollRef} className="chrono-scroll"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', paddingTop: '12px', paddingBottom: '40px' }}
          onScroll={() => forceTick((t) => t + 1)}
          onMouseMove={isDragging ? onDragMove : undefined}
          onMouseUp={isDragging ? onDragUp : undefined}
          onMouseLeave={isDragging ? onDragUp : undefined}
        >
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '16px', bottom: '16px', width: '3px', background: GOLD, borderRadius: '2px', opacity: mode === 'era' ? 0.3 : 0.5, zIndex: 0 }} />
          {worldEras.map((era) => {
            const er = rootNodes.filter((n) => era.nodeIds.includes(n.id)); if (er.length < 2) return null
            const idxs = er.map((n) => rootNodes.findIndex((r) => r.id === n.id)).filter((i) => i >= 0); if (idxs.length < 2) return null
            const tp = (Math.min(...idxs) / rootNodes.length) * 100; const hp = ((Math.max(...idxs) + 1) / rootNodes.length) * 100 - tp
            if (hp <= 0) return null
            const sel = mode === 'era' && selectedEraNodes.some((id) => era.nodeIds.includes(id))
            return <div key={era.id} onClick={(e) => { e.stopPropagation(); handleEraAxisClick(era) }} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: `${tp + 2}%`, height: `${hp}%`, width: mode === 'era' ? '8px' : '5px', background: era.color, borderRadius: '3px', opacity: mode === 'era' ? 0.7 : 0.85, boxShadow: sel ? `0 0 16px ${era.color}99` : `0 0 6px ${era.color}33`, transition: 'all 0.2s ease', cursor: mode === 'era' ? 'pointer' : 'default', zIndex: 1 }} title={`${era.name}${mode === 'era' ? ' — 点击选中时代' : ''}`} />
          })}

          <div style={{ position: 'relative', zIndex: 2 }}>
            {rootNodes.map((root) => {
              const branches = getBranches(root.id)
              const isSel = selectedEraNodes.includes(root.id)
              const era = worldEras.find((e) => e.nodeIds.includes(root.id))
              const nc = era ? era.color : (root.color || DEFAULT_COLOR)
              const dim = mode === 'era' && !isSel

              return (
                <NumUINodeGroup key={root.id}>
                  {/* 根节点行 — position: relative 作为分支定位锚点 */}
                  <div className={`chrono-node-row${popup?.node.id === root.id ? ' chrono-popup-open' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', height: '32px', position: 'relative' }}>
                    <div style={{ width: 'calc(50% - 12px)', flexShrink: 0 }} />
                    <div style={{ width: '24px', height: '24px', flexShrink: 0, position: 'relative', zIndex: 3 }}>
                      <div className={`chrono-dot ${mode === 'edit' ? 'edit' : (dim ? 'era-dim' : 'normal')}`}
                        data-root-id={root.id}
                        style={{
                          position: 'absolute', top: '50%', left: '50%',
                          width: '24px', height: '24px', borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: nc, border: `2.5px solid ${GOLD_LIGHT}`,
                          boxShadow: dim ? `0 0 4px ${nc}22` : `0 0 8px ${nc}66`,
                          cursor: mode === 'edit' ? 'grab' : 'pointer',
                          transition: 'box-shadow 0.25s ease, opacity 0.25s ease',
                          opacity: dim ? 0.3 : 1,
                          '--dot-shadow-hover': `0 0 4px ${nc}88, 0 0 14px ${nc}cc, 0 0 28px ${nc}99`,
                        } as React.CSSProperties}
                        onClick={(e) => { if (mode === 'era') { toggleEraNode(root.id); return } handleNodeClick(e, root, nc) }}
                        onMouseDown={(e) => {
                          if (mode !== 'edit') return
                          const el = scrollRef.current!; const dr = (e.target as HTMLElement).getBoundingClientRect()
                          const cr = el.getBoundingClientRect(); const py = dr.top - cr.top + el.scrollTop + dr.height / 2
                          startDrag(e, root.id, py)
                        }}
                        onContextMenu={(e) => handleContextMenu(e, root)}
                      />
                    </div>
                    <div style={{ width: 'calc(50% - 12px)', paddingLeft: '12px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {mode === 'normal' && (
                        <div className="hover-label" style={{ whiteSpace: 'nowrap', lineHeight: '1.3' }}>
                          <div style={{ fontSize: '12px', color: nc, opacity: 0.85 }}>{root.eventTime || '未知时间'}</div>
                          <div style={{ fontSize: '15px', color: nc, fontWeight: 600 }}>{root.eventName}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 分支：连线 + 圆点。分支容器位于行(32px)之后，轴线圆点在行内高度16px处 */}
                  {branches.map((branch) => {
                    if (dragRef.current?.repositionId === branch.id) return null
                    const bc = era ? era.color : (branch.color || DEFAULT_COLOR)
                    const ox = (branch.branchOffset ?? { x: 60, y: 40 }).x
                    const oy = (branch.branchOffset ?? { x: 60, y: 40 }).y
                    const len = Math.sqrt(ox * ox + oy * oy)
                    return (
                      <div key={branch.id} style={{ position: 'relative', height: 0, zIndex: 0, overflow: 'visible' }}>
                        {len > 2 && (() => {
                          const ang = Math.atan2(oy, ox)
                          return (
                            <div style={{
                              position: 'absolute',
                              left: '50%', top: -16,
                              width: len, height: 2,
                              background: bc, opacity: 0.55,
                              transform: `rotate(${ang}rad)`,
                              transformOrigin: '0 50%',
                              pointerEvents: 'none',
                              zIndex: 1,
                            }} />
                          )
                        })()}
                        <div
                          style={{
                            position: 'absolute',
                            left: `calc(50% + ${ox}px)`, top: oy - 16,
                            transform: 'translate(-12px, -12px)',
                            width: '24px', height: '24px', zIndex: 2,
                          }}
                        >
                          <NumUIBranchDot branch={branch} color={bc} dimmed={dim}
                            editMode={mode === 'edit'}
                            onClick={(e) => { if (mode === 'era') { toggleEraNode(branch.id); return } handleNodeClick(e, branch, bc) }}
                            onContextMenu={(e) => handleContextMenu(e, branch)}
                            onMouseDown={(e) => {
                              if (mode !== 'edit') return
                              const el = scrollRef.current!
                              const pDot = el.querySelector(`[data-root-id="${root.id}"]`) as HTMLElement
                              if (!pDot) return
                              const cr = el.getBoundingClientRect(); const pr = pDot.getBoundingClientRect()
                              const py = pr.top - cr.top + el.scrollTop + pr.height / 2
                              startDrag(e, root.id, py, branch.id)
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {mode === 'era' && era && selectedEraNodes.some((id) => era.nodeIds.includes(id)) && (
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                      <button className="btn" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => handleEditEra(era)}>编辑时代</button>
                      <button className="btn btn-danger" style={{ fontSize: '12px', padding: '4px 12px', marginLeft: '8px' }} onClick={() => handleDeleteEra(era.id)}>删除时代</button>
                    </div>
                  )}
                </NumUINodeGroup>
              )
            })}
          </div>

          {/* ── 拖拽预览线 / 预览圆点 ── */}
          {isDragging && dragRef.current && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 90, overflow: 'visible' }}>
              <line x1={dragRef.current.axisX} y1={dragRef.current.startY} x2={dragRef.current.curX} y2={dragRef.current.curY} stroke={GOLD_LIGHT} strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
            </svg>
          )}
          {isDragging && dragRef.current && dragStarted.current && (
            <div style={{ position: 'absolute', left: dragRef.current.curX, top: dragRef.current.curY, width: '16px', height: '16px', borderRadius: '50%', background: GOLD_LIGHT, border: `2.5px solid ${GOLD}`, boxShadow: `0 0 14px ${GOLD}`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99, opacity: 0.85 }} />
          )}
        </div>
      )}

      {mode === 'edit' && rootNodes.length > 0 && (
        <div style={{ flexShrink: 0, textAlign: 'center', paddingTop: '14px', borderTop: '1px solid var(--color-page-shadow)' }}>
          <button className="btn btn-primary" onClick={handleAddRoot}>+ 添加事件</button>
        </div>
      )}
      {mode !== 'normal' && (
        <div style={{ flexShrink: 0, textAlign: 'center', marginTop: mode === 'edit' ? '8px' : (rootNodes.length === 0 ? 'auto' : '16px'), padding: '6px 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {mode === 'edit' ? '编辑模式：从时间节点拖拽创建分支，右键节点编辑' : '时代编辑模式：点击节点选择，点击轴上色块选中整个时代'}
        </div>
      )}

      <style>{`
        .chrono-node-row:hover .chrono-dot.normal { box-shadow: var(--dot-shadow-hover); }
        .hover-label { display: none; }
        .chrono-node-row:hover .hover-label { display: block; }
        .chrono-popup-open .hover-label { display: none !important; }
        .chrono-scroll::-webkit-scrollbar { width: 10px; }
        .chrono-scroll::-webkit-scrollbar-track { background: rgba(44, 24, 16, 0.25); border-radius: 5px; margin: 8px 0; }
        .chrono-scroll::-webkit-scrollbar-thumb { background: ${GOLD}88; border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
        .chrono-scroll::-webkit-scrollbar-thumb:hover { background: ${GOLD_LIGHT}cc; border: 2px solid transparent; background-clip: content-box; }
      `}</style>

      {popup && <ContentPopup popup={popup} onClose={() => setPopup(null)} onEdit={() => { setEditingNode(popup.node); setPopup(null) }} mode={mode} />}
      {editingNode && <NodeEditorModal node={editingNode} isNew={!editingNode.id} onSave={handleSave} onDelete={editingNode.id ? () => handleDelete(editingNode.id) : undefined} onClose={() => setEditingNode(null)} />}
      {eraEditor && <EraEditorModal isNew={eraEditor.isNew} era={eraEditor.era} onSave={(n, c) => eraEditor.isNew ? submitEra(n, c) : submitEraEdit(eraEditor.era!.id, n, c)} onClose={() => setEraEditor(null)} />}
    </div>
  )
}

// ═══ 占位容器，防止 React key 报错嵌套 ═══
function NumUINodeGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: '60px' }}>{children}</div>
}

// ═══ 分支圆点 ═══
function NumUIBranchDot({
  branch, color, dimmed, editMode, onClick, onContextMenu, onMouseDown,
}: {
  branch: TimelineNode; color: string; dimmed: boolean; editMode: boolean
  onClick: (e: React.MouseEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ position: 'relative', width: '24px', height: '24px' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div onClick={onClick} onContextMenu={onContextMenu} onMouseDown={onMouseDown}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '14px', height: '14px', borderRadius: '50%',
          background: color, border: '2px solid', borderColor: GOLD_LIGHT,
          transform: 'translate(-50%, -50%)',
          boxShadow: hover
            ? `0 0 3px ${color}88, 0 0 10px ${color}cc, 0 0 20px ${color}aa`
            : dimmed ? `0 0 4px ${color}22` : `0 0 4px ${color}44`,
          opacity: dimmed ? 0.3 : 1,
          transition: 'box-shadow 0.25s ease, opacity 0.25s ease',
          cursor: editMode ? 'grab' : 'pointer',
        }}
      />
      {hover && (
        <div style={{ position: 'absolute', left: '31px', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20 }}>
          <div style={{ fontSize: '11px', color, opacity: 0.85, lineHeight: '1.2' }}>{branch.eventTime || '未知时间'}</div>
          <div style={{ fontSize: '13px', color, fontWeight: 600, lineHeight: '1.3' }}>{branch.eventName}</div>
        </div>
      )}
    </div>
  )
}

// ═══ 内容悬浮窗 ═══
function ContentPopup({ popup, onClose, onEdit, mode }: { popup: HoverPopup; onClose: () => void; onEdit: () => void; mode: EditorMode }) {
  const { node, color, x, y } = popup
  const hexRgba = (hex: string, a: number) => { const h = hex.replace('#', ''); return `rgba(${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)},${a})` }
  const mx = typeof window !== 'undefined' ? window.innerWidth - 340 : 1000
  const my = typeof window !== 'undefined' ? window.innerHeight - 280 : 600
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', left: Math.min(Math.max(10, x), mx), top: Math.min(Math.max(10, y), my), width: '300px', padding: '20px 22px', borderRadius: '14px', background: hexRgba(color, 0.18), backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1.5px solid ${hexRgba(color, 0.45)}`, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${hexRgba(color, 0.3)}`, zIndex: 501, animation: 'modalIn 0.2s ease' }}>
        <div style={{ fontSize: '12px', color: hexRgba(color, 0.9), marginBottom: '4px', fontWeight: 500 }}>{node.eventTime || '未知时间'}</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>{node.eventName}</div>
        <div style={{ fontSize: '14px', color: 'var(--color-text-light)', lineHeight: '1.8', marginBottom: '16px' }}>{node.eventContent || '暂无描述'}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {mode === 'edit' && <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => { onEdit(); onClose() }}>编辑</button>}
          <button className="btn" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>, document.body
  )
}

// ═══ 节点编辑器 ═══
function NodeEditorModal({ node, isNew, onSave, onDelete, onClose }: { node: TimelineNode; isNew: boolean; onSave: (n: TimelineNode) => void; onDelete?: () => void; onClose: () => void }) {
  const [nm, setNm] = useState(node.eventName)
  const [tm, setTm] = useState(node.eventTime)
  const [ct, setCt] = useState(node.eventContent)
  const [cl, setCl] = useState(node.color || GOLD)
  const hs = () => { if (!nm.trim()) return; onSave({ ...node, eventName: nm.trim(), eventTime: tm, eventContent: ct, color: cl }) }
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
        <h2>{isNew ? (node.parentId ? '创建分支事件' : '创建事件') : '编辑事件'}</h2>
        <div className="form-group"><label>事件名称 *</label><input className="input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="请输入事件名称..." autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && nm.trim()) hs() }} /></div>
        <div className="form-group"><label>事件时间</label><input className="input" value={tm} onChange={(e) => setTm(e.target.value)} placeholder="如：创世元年、星坠纪元1423年" /></div>
        <div className="form-group"><label>事件描述</label><textarea className="input" value={ct} onChange={(e) => setCt(e.target.value)} placeholder="详细描述这个事件..." rows={5} style={{ resize: 'vertical', fontFamily: 'inherit' }} /></div>
        <div className="form-group"><label>标记颜色</label><ColorPicker value={cl} onChange={setCl} /></div>
        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <div>{onDelete && <button className="btn btn-danger" onClick={onDelete}>删除事件</button>}</div>
          <div style={{ display: 'flex', gap: '10px' }}><button className="btn" onClick={onClose}>取消</button><button className="btn btn-primary" disabled={!nm.trim()} onClick={hs}>{isNew ? '创建' : '保存'}</button></div>
        </div>
      </div>
    </div>, document.body
  )
}

function EraEditorModal({ isNew, era, onSave, onClose }: { isNew: boolean; era?: Era; onSave: (n: string, c: string) => void; onClose: () => void }) {
  const [nm, setNm] = useState(era?.name || '')
  const [cl, setCl] = useState(era?.color || '#8b2252')
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '90%' }}>
        <h2>{isNew ? '创建时代' : '编辑时代'}</h2>
        <div className="form-group"><label>时代名称 *</label><input className="input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="如：远古纪元、魔法时代..." autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && nm.trim()) onSave(nm.trim(), cl) }} /></div>
        <div className="form-group"><label>时代颜色</label><ColorPicker value={cl} onChange={setCl} /></div>
        <div className="form-actions"><button className="btn" onClick={onClose}>取消</button><button className="btn btn-primary" disabled={!nm.trim()} onClick={() => onSave(nm.trim(), cl)}>{isNew ? '创建时代' : '保存'}</button></div>
      </div>
    </div>, document.body
  )
}
