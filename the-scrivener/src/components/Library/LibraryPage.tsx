// ========================================
// 图书馆 — 左侧书架 书脊 右侧阅读/编辑
// 书籍形状模块+封面+作者绑定人物库
// ========================================

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { LibraryDoc } from '@/types'
import { ImageCropModal } from '@/components/Common/ImageCropModal'
import { GOLD, GOLD_LIGHT, GOLD_DARK } from '@/utils/color'

// ═══ 默认书封SVG ═══
function DefaultCover() {
  return (
    <svg viewBox="0 0 80 100" width="80" height="100" fill="none" style={{ display: 'block' }}>
      {/* 书封底色 */}
      <rect x="4" y="4" width="72" height="92" rx="3" fill={`${GOLD_DARK}`} opacity="0.15" />
      <rect x="4" y="4" width="72" height="92" rx="3" fill="none" stroke={GOLD} strokeWidth="1.5" />
      {/* 装订线 */}
      <line x1="12" y1="4" x2="12" y2="96" stroke={GOLD} strokeWidth="1" opacity="0.4" />
      {/* 中心纹章 */}
      <circle cx="40" cy="38" r="14" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.5" />
      <circle cx="40" cy="38" r="8" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.35" />
      <path d="M 32 38 L 40 30 L 48 38 L 40 46 Z" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.5" strokeLinejoin="round" />
      {/* 装饰线 */}
      <line x1="22" y1="62" x2="58" y2="62" stroke={GOLD} strokeWidth="0.8" opacity="0.3" />
      <line x1="22" y1="68" x2="52" y2="68" stroke={GOLD} strokeWidth="0.6" opacity="0.2" />
      <line x1="22" y1="74" x2="55" y2="74" stroke={GOLD} strokeWidth="0.6" opacity="0.2" />
      {/* 底部装饰 */}
      <path d="M 30 82 L 40 78 L 50 82" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
      {/* 顶角 */}
      <path d="M 10 10 L 16 6 L 22 10" fill="none" stroke={GOLD} strokeWidth="0.7" opacity="0.3" strokeLinecap="round" />
      <path d="M 58 10 L 64 6 L 70 10" fill="none" stroke={GOLD} strokeWidth="0.7" opacity="0.3" strokeLinecap="round" />
    </svg>
  )
}

// ═══ 主组件 ═══
export function LibraryPage() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const libraryDocs = useAppStore((s) => s.libraryDocs)
  const characters = useAppStore((s) => s.characters)
  const addLibraryDoc = useAppStore((s) => s.addLibraryDoc)
  const updateLibraryDoc = useAppStore((s) => s.updateLibraryDoc)
  const deleteLibraryDoc = useAppStore((s) => s.deleteLibraryDoc)
  const goBack = useAppStore((s) => s.goBack)

  const worldDocs = useMemo(() => libraryDocs.filter((d) => d.worldId === currentWorldId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [libraryDocs, currentWorldId])
  const worldChars = useMemo(() => characters.filter((c) => c.worldId === currentWorldId && !!c.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')), [characters, currentWorldId])

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<LibraryDoc | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showCoverCrop, setShowCoverCrop] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return worldDocs
    const q = search.trim().toLowerCase()
    return worldDocs.filter((d) =>
      d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
      || (d.author || '').toLowerCase().includes(q)
    )
  }, [worldDocs, search])

  const selected = selectedId ? worldDocs.find((d) => d.id === selectedId) : undefined

  // ═══ 书架上的书籍卡片 ═══
  function BookCard({ doc, isSel }: { doc: LibraryDoc; isSel: boolean }) {
    return (
      <div onClick={() => setSelectedId(isSel ? null : doc.id)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          padding: '10px 6px', borderRadius: '6px', cursor: 'pointer',
          border: `1.5px solid ${isSel ? GOLD : 'transparent'}`,
          background: isSel ? 'rgba(184,134,11,0.08)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(ev) => { if (!isSel) ev.currentTarget.style.background = 'rgba(184,134,11,0.04)' }}
        onMouseLeave={(ev) => { if (!isSel) ev.currentTarget.style.background = 'transparent' }}>
        {/* 书封 */}
        <div style={{
          width: '80px', height: '100px', borderRadius: '3px', overflow: 'hidden',
          boxShadow: isSel ? `0 3px 14px rgba(0,0,0,0.15), 0 0 10px ${GOLD}22` : '0 2px 8px rgba(0,0,0,0.1)',
          border: isSel ? `2px solid ${GOLD}` : '1px solid rgba(139,105,20,0.2)',
          transition: 'all 0.2s ease', flexShrink: 0, position: 'relative',
          background: '#f5e6c8',
        }}>
          {doc.cover ? (
            <img src={doc.cover} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <DefaultCover />
          )}
        </div>
        {/* 书名 */}
        <span style={{
          maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', textAlign: 'center',
          lineHeight: 1.3,
        }}>{doc.title}</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>

      {/* ═══════ 左侧：书架 ═══════ */}
      <div style={{
        flex: '0 0 38%', minWidth: 0, display: 'flex', flexDirection: 'column',
        padding: '24px 22px', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', color: GOLD, margin: 0, letterSpacing: '2px' }}>图书馆</h2>
          <button className="btn" onClick={goBack} style={{ fontSize: '12px', padding: '4px 10px' }}>← 返回</button>
        </div>

        <input className="input" placeholder="搜索书名、作者或内容..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '10px', fontSize: '13px', padding: '8px 12px' }} />

        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          {filtered.length} 本书籍
        </div>

        {/* 书架网格 */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              {search ? '无匹配书籍' : '暂无书籍，点击下方按钮创建'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', alignContent: 'start', paddingRight: '4px' }}>
              {filtered.map((doc) => (
                <BookCard key={doc.id} doc={doc} isSel={selectedId === doc.id} />
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--color-page-shadow)', paddingTop: '10px', marginTop: '8px' }}>
          <div onClick={() => setShowCreate(true)} style={{
            padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
            border: `1.5px dashed ${GOLD}55`, color: GOLD, fontSize: '13px', fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(184,134,11,0.08)'; ev.currentTarget.style.borderColor = GOLD_LIGHT }}
            onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = `${GOLD}55` }}>
            + 创建新书籍
          </div>
        </div>
      </div>

      {/* ═══════ 书脊 ═══════ */}
      <div style={{ width: '3px', flexShrink: 0, background: 'linear-gradient(90deg, #8b6914, #4a3728 50%, #8b6914)', boxShadow: '0 0 8px rgba(0,0,0,0.3), inset 0 0 4px rgba(0,0,0,0.2)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(38% - 8px)', width: '16px', background: 'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ═══════ 右侧：阅读 / 编辑 ═══════ */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        padding: '30px 34px', background: 'rgba(245,230,200,0.15)', overflow: 'hidden',
      }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: 'var(--color-text-muted)' }}>
            <DefaultCover />
            <span style={{ fontSize: '14px' }}>从左侧书架选择一本书籍阅读</span>
          </div>
        ) : editing && editing.id === selected.id ? (
          /* ═══ 编辑模式 ═══ */
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ fontSize: '18px', color: GOLD, margin: 0 }}>编辑书籍</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => setEditing(null)}>取消</button>
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => {
                    if (editing.title.trim()) {
                      updateLibraryDoc(editing.id, editing)
                      setEditing(null)
                    }
                  }}>保存</button>
              </div>
            </div>

            {/* ═══ 封面 ═══ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '18px 20px', borderRadius: '12px', border: '1.5px solid var(--color-page-shadow)', background: 'rgba(245,230,200,0.2)' }}>
              <div style={{
                width: '80px', height: '100px', borderRadius: '3px', overflow: 'hidden',
                border: `2px solid ${GOLD}`, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', flexShrink: 0,
                background: '#f5e6c8',
              }}>
                {editing.cover ? (
                  <img src={editing.cover} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <DefaultCover />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>书籍封面</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  {editing.cover ? '点击替换或移除封面' : '导入图片作为书籍封面'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}
                    onClick={() => setShowCoverCrop(true)}>
                    {editing.cover ? '替换封面' : '导入封面'}
                  </button>
                  {editing.cover && (
                    <button className="btn" style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => setEditing({ ...editing, cover: undefined })}>移除封面</button>
                  )}
                </div>
              </div>
            </div>

            {/* 书名 */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', marginBottom: '6px' }}>书名 *</label>
              <input className="input" value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                autoFocus style={{ fontSize: '16px', padding: '10px 14px', fontWeight: 600 }} />
            </div>

            {/* 作者 */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', marginBottom: '6px' }}>作者</label>
              <select className="input" value={editing.author || ''}
                onChange={(e) => setEditing({ ...editing, author: e.target.value || undefined })}
                style={{ fontSize: '14px', padding: '10px 14px', cursor: 'pointer' }}>
                <option value="">未指定作者</option>
                {worldChars.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {editing.author && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  作者选自人物库，修改人物名称将自动同步
                </div>
              )}
            </div>

            {/* 内容 */}
            <div className="form-group" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', marginBottom: '6px' }}>文档内容</label>
              <textarea className="input" value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="在此书写世界观的故事、设定、历史…"
                style={{ flex: 1, resize: 'vertical', fontFamily: 'inherit', fontSize: '14px', minHeight: '200px',
                  lineHeight: '1.8', padding: '14px 16px' }} />
            </div>

            <div style={{ height: '12px', flexShrink: 0 }} />
          </div>
        ) : (
          /* ═══ 阅读模式 ═══ */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', gap: '28px' }}>
            {/* 标题 + 操作 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px' }}>{selected.title}</h3>
                {selected.author && (
                  <div style={{ fontSize: '14px', color: GOLD, fontStyle: 'italic' }}>
                    — {selected.author}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => setEditing({ ...selected })}>编辑</button>
                <button className="btn btn-danger" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => {
                    if (confirm(`删除书籍「${selected.title}」？`)) {
                      deleteLibraryDoc(selected.id)
                      setSelectedId(null)
                    }
                  }}>删除</button>
              </div>
            </div>

            {/* 封面展示 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{
                width: '100px', height: '128px', borderRadius: '4px', overflow: 'hidden',
                border: `2px solid ${GOLD}`, boxShadow: `0 3px 16px rgba(0,0,0,0.12), 0 0 8px ${GOLD}15`,
                flexShrink: 0, background: '#f5e6c8',
              }}>
                {selected.cover ? (
                  <img src={selected.cover} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <DefaultCover />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  最后更新: {new Date(selected.updatedAt).toLocaleString('zh-CN')}
                </div>
                <div style={{
                  fontSize: '15px', color: 'var(--color-text)', lineHeight: '2',
                  whiteSpace: 'pre-wrap',
                }}>
                  {selected.content || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>暂无内容</span>}
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }} />
          </div>
        )}
      </div>

      {/* ═══════ 弹窗 ═══════ */}
      {showCreate && <CreateBookModal
        onSave={(title) => {
          if (!title.trim() || !currentWorldId) return
          const doc = addLibraryDoc({ worldId: currentWorldId, title: title.trim(), content: '' })
          setSelectedId(doc.id)
          setShowCreate(false)
        }}
        onClose={() => setShowCreate(false)} />}

      {showCoverCrop && (
        <ImageCropModal
          onSave={(dataUrl) => { if (editing) setEditing({ ...editing, cover: dataUrl }); setShowCoverCrop(false) }}
          onClose={() => setShowCoverCrop(false)} />
      )}
    </div>
  )
}

function CreateBookModal({ onSave, onClose }: { onSave: (title: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState('')
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <h2>创建新书籍</h2>
        <div className="form-group">
          <label>书名 *</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="输入书名..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) onSave(title.trim()) }} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" disabled={!title.trim()} onClick={() => onSave(title.trim())}>创建</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
