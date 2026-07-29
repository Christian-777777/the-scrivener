// ========================================
// 物品集 — 搜索+标签过滤 ｜ 书脊 ｜ 物品详情
// ========================================

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { Item, ItemTag } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { ImageCropModal } from '@/components/Common/ImageCropModal'
import { GOLD, GOLD_LIGHT, darken } from '@/utils/color'
import { AttributeEditor } from '@/components/Common/SharedComponents'

// ═══ 主组件 ═══
export function ItemList() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const items = useAppStore((s) => s.items)
  const itemTags = useAppStore((s) => s.itemTags)
  const addItem = useAppStore((s) => s.addItem)
  const updateItem = useAppStore((s) => s.updateItem)
  const deleteItem = useAppStore((s) => s.deleteItem)
  const addItemTag = useAppStore((s) => s.addItemTag)
  const updateItemTag = useAppStore((s) => s.updateItemTag)
  const deleteItemTag = useAppStore((s) => s.deleteItemTag)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldItems = useMemo(() => items.filter((i) => i.worldId === currentWorldId), [items, currentWorldId])
  const worldTags = useMemo(() => itemTags.filter((t) => t.worldId === currentWorldId), [itemTags, currentWorldId])

  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Item | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showCrop, setShowCrop] = useState(false)

  const filtered = useMemo(() => {
    let results = worldItems.filter((i) => !!i.name)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      results = results.filter((i) =>
        i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)
        || i.tags.some((t) => t.name.toLowerCase().includes(q))
      )
    }
    if (filterTag) results = results.filter((i) => i.tags.some((t) => t.name === filterTag))
    results.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    return results
  }, [worldItems, search, filterTag])

  const selected = selectedId ? worldItems.find((i) => i.id === selectedId) : undefined
  const itemColor = (item: Item) => item.tags[0]?.color || GOLD

  // ═══ 标签芯片组件 ═══
  const TagChip = ({ tag, onClick, selected: sel, small }: { tag: ItemTag; onClick?: () => void; selected?: boolean; small?: boolean }) => (
    <span onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '3px',
        padding: small ? '2px 7px' : '4px 10px',
        borderRadius: '12px', cursor: onClick ? 'pointer' : 'default', fontSize: small ? '10px' : '12px',
        fontWeight: 600,
        color: sel ? '#f5e6c8' : tag.color,
        background: sel ? tag.color : `${tag.color}18`,
        border: `1px solid ${sel ? tag.color : `${tag.color}44`}`,
        transition: 'all 0.15s ease',
      }}>
      {tag.name}
    </span>
  )

  // ═══ 创建新物品 ═══
  const handleCreate = (name: string) => {
    if (!name.trim() || !currentWorldId) return
    const newItem = addItem({ worldId: currentWorldId, name: name.trim(), tags: [], description: '', attributes: {} })
    setSelectedId(newItem.id)
    setShowCreate(false)
  }

  // ═══ 标签编辑器（内嵌在物品编辑面板中） ═══
  const [tagEditMode, setTagEditMode] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(GOLD)

  const handleAddTagToItem = (item: Item, tag: ItemTag) => {
    if (item.tags.some((t) => t.id === tag.id)) return
    const newTags = [...item.tags, tag]
    updateItem(item.id, { tags: newTags })
    setEditing((prev) => prev && prev.id === item.id ? { ...prev, tags: newTags } : prev)
  }

  const handleRemoveTagFromItem = (item: Item, tagId: string) => {
    const newTags = item.tags.filter((t) => t.id !== tagId)
    updateItem(item.id, { tags: newTags })
    setEditing((prev) => prev && prev.id === item.id ? { ...prev, tags: newTags } : prev)
  }

  const handleCreateTag = () => {
    if (!newTagName.trim() || !currentWorldId) return
    addItemTag({ name: newTagName.trim(), color: newTagColor, worldId: currentWorldId })
    setNewTagName('')
    setNewTagColor(GOLD)
  }

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>

      {/* ═══════ 左侧：物品卡片网格 ═══════ */}
      <div style={{
        flex: '0 0 50%', minWidth: 0, display: 'flex', flexDirection: 'column',
        padding: '24px 22px', overflow: 'hidden',
      }}>
        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', color: GOLD, margin: 0, letterSpacing: '2px' }}>物品集</h2>
          <button className="btn" onClick={goBack} style={{ fontSize: '12px', padding: '4px 10px' }}>← 返回</button>
        </div>

        {/* 搜索 */}
        <input className="input" placeholder="搜索物品名称、标签或描述..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '8px', fontSize: '13px', padding: '8px 12px' }} />

        {/* 标签过滤 */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px', maxHeight: '56px', overflowY: 'auto' }}>
          <span onClick={() => setFilterTag('')}
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              color: !filterTag ? '#f5e6c8' : 'var(--color-text-muted)',
              background: !filterTag ? GOLD : 'transparent',
              border: `1px solid ${!filterTag ? GOLD : 'var(--color-page-shadow)'}`,
              transition: 'all 0.15s ease',
            }}>全部</span>
          {worldTags.map((t) => (
            <TagChip key={t.id} tag={t} selected={filterTag === t.name}
              onClick={() => setFilterTag(filterTag === t.name ? '' : t.name)} small />
          ))}
          {worldTags.length === 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '2px 4px' }}>暂无标签</span>
          )}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          {filtered.length} 件物品{filterTag ? ` · ${filterTag}` : ''}
        </div>

        {/* 物品卡片网格 */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              {search || filterTag ? '无匹配物品' : '暂无物品，点击下方按钮创建'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', alignContent: 'start', paddingRight: '4px' }}>
              {filtered.map((item) => {
                const pc = itemColor(item)
                const isSel = selectedId === item.id
                return (
                  <div key={item.id}
                    onClick={() => setSelectedId(isSel ? null : item.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '14px 8px 12px', borderRadius: '10px', cursor: 'pointer',
                      fontSize: '12px', color: 'var(--color-text)',
                      border: `1.5px solid ${isSel ? pc : 'var(--color-page-shadow)'}`,
                      background: isSel ? `${pc}1a` : 'rgba(245,230,200,0.3)',
                      transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease', position: 'relative',
                    }}
                    onMouseEnter={(ev) => {
                      ev.currentTarget.style.borderColor = pc
                      ev.currentTarget.style.background = `${pc}14`
                      ev.currentTarget.style.boxShadow = `0 0 12px ${pc}30`
                    }}
                    onMouseLeave={(ev) => {
                      ev.currentTarget.style.borderColor = isSel ? pc : 'var(--color-page-shadow)'
                      ev.currentTarget.style.background = isSel ? `${pc}1a` : 'rgba(245,230,200,0.3)'
                      ev.currentTarget.style.boxShadow = 'none'
                    }}>
                    {/* 物品图标 */}
                    {item.icon ? (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
                        border: `2px solid ${pc}`, flexShrink: 0,
                      }}>
                        <img src={item.icon} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px', background: pc,
                        border: `2px solid ${darken(pc, 0.35)}`,
                      }} />
                    )}
                    <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, lineHeight: 1.2, textAlign: 'center', fontSize: '13px' }}>
                      {item.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 创建按钮 */}
        <div style={{ borderTop: '1px solid var(--color-page-shadow)', paddingTop: '10px', marginTop: '8px' }}>
          <div onClick={() => setShowCreate(true)}
            style={{
              padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
              border: `1.5px dashed ${GOLD}55`, color: GOLD, fontSize: '13px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(184,134,11,0.08)'; ev.currentTarget.style.borderColor = GOLD_LIGHT }}
            onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = `${GOLD}55` }}>
            + 创建新物品
          </div>
          <div onClick={() => navigateTo('itemTagManagement', '物品分类标签管理')} style={{
            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', marginTop: '4px',
            border: '1.5px solid rgba(139,105,20,0.25)', color: 'var(--color-text-light)', fontSize: '12px',
            fontWeight: 400, textAlign: 'center',
          }}>
            分类标签管理
          </div>
        </div>
      </div>

      {/* ═══════ 书脊 ═══════ */}
      <div style={{ width: '3px', flexShrink: 0, background: 'linear-gradient(90deg, #8b6914, #4a3728 50%, #8b6914)', boxShadow: '0 0 8px rgba(0,0,0,0.3), inset 0 0 4px rgba(0,0,0,0.2)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 8px)', width: '16px', background: 'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ═══════ 右侧：物品详情 / 编辑 ═══════ */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        padding: '30px 34px', background: 'rgba(245,230,200,0.15)', overflow: 'hidden',
      }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: 'var(--color-text-muted)' }}>
            <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
              <rect x="12" y="15" width="36" height="36" rx="2" fill="none" stroke={GOLD} strokeWidth="1.8" opacity="0.4" />
              <line x1="22" y1="26" x2="38" y2="26" stroke={GOLD} strokeWidth="1.2" opacity="0.25" />
              <line x1="22" y1="32" x2="35" y2="32" stroke={GOLD} strokeWidth="1.2" opacity="0.2" />
            </svg>
            <span style={{ fontSize: '14px' }}>从左侧选择一件物品查看详情</span>
          </div>
        ) : editing && editing.id === selected.id ? (
          /* ═══ 编辑模式 ═══ */
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* 标题栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ fontSize: '18px', color: GOLD, margin: 0 }}>编辑物品</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => setEditing(null)}>取消</button>
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => {
                    if (editing.name.trim()) { updateItem(editing.id, editing); setEditing(null) }
                  }}>保存</button>
              </div>
            </div>

            {/* ═══ 物品图标 — 导入 / 替换 / 移除 ═══ */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px 18px', borderRadius: '12px',
              border: '1.5px solid var(--color-page-shadow)',
              background: 'rgba(245,230,200,0.2)',
            }}>
              {/* 图标展示 */}
              {editing.icon ? (
                <div style={{
                  width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden',
                  border: `2px solid ${GOLD}`, flexShrink: 0, position: 'relative',
                }}>
                  <img src={editing.icon} alt="物品图标" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ) : (
                <div style={{
                  width: '64px', height: '64px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(245,230,200,0.4)', border: '2px dashed var(--color-page-shadow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-muted)', fontSize: '24px',
                }}>
                  ◇
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
                  物品图标
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  {editing.icon ? '点击替换或移除图标' : '导入图片并裁剪为方形图标'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}
                    onClick={() => setShowCrop(true)}>
                    {editing.icon ? '替换图标' : '导入图标'}
                  </button>
                  {editing.icon && (
                    <button className="btn" style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => setEditing({ ...editing, icon: undefined })}>移除图标</button>
                  )}
                </div>
              </div>
            </div>

            {/* 名称 */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', marginBottom: '6px' }}>物品名称 *</label>
              <input className="input" value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                autoFocus style={{ fontSize: '15px', padding: '10px 14px' }} />
            </div>

            {/* ═══ 分类标签 — 两栏布局 + 排序 ═══ */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', marginBottom: '10px' }}>分类标签</label>

              {/* 两栏容器 */}
              <div style={{ display: 'flex', gap: '14px' }}>
                {/* 左栏：已添加标签（可排序） */}
                <div style={{
                  flex: 1, minWidth: 0,
                  border: '1.5px solid var(--color-page-shadow)',
                  borderRadius: '10px', padding: '12px',
                  background: 'rgba(245,230,200,0.2)',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                    已添加 <span style={{ fontWeight: 400 }}>({editing.tags.length})</span>
                    <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.6 }}>点击移出 · ↕拖拽排序</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minHeight: '36px' }}>
                    {editing.tags.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px' }}>
                        点击右侧标签添加
                      </span>
                    ) : (
                      editing.tags.map((t, idx) => (
                        <div key={t.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/tag-index', String(idx))
                          }}
                          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const fromIdx = parseInt(e.dataTransfer.getData('text/tag-index'))
                            if (fromIdx === idx || isNaN(fromIdx)) return
                            const newTags = [...editing.tags]
                            const [moved] = newTags.splice(fromIdx, 1)
                            newTags.splice(idx, 0, moved)
                            setEditing({ ...editing, tags: newTags })
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 10px', borderRadius: '8px',
                            background: `${t.color}18`, border: `1px solid ${t.color}44`,
                            cursor: 'grab', fontSize: '13px', fontWeight: 600,
                            color: t.color, transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(ev) => {
                            ev.currentTarget.style.background = `${t.color}30`
                            ev.currentTarget.style.borderColor = t.color
                          }}
                          onMouseLeave={(ev) => {
                            ev.currentTarget.style.background = `${t.color}18`
                            ev.currentTarget.style.borderColor = `${t.color}44`
                          }}>
                          <span style={{
                            width: '10px', height: '10px', borderRadius: '50%', background: t.color,
                            border: `1.5px solid ${darken(t.color, 0.25)}`, flexShrink: 0,
                          }} />
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.name}
                          </span>
                          <span onClick={(ev) => { ev.stopPropagation(); handleRemoveTagFromItem(editing, t.id) }}
                            style={{ cursor: 'pointer', fontSize: '14px', opacity: 0.5, lineHeight: 1, flexShrink: 0 }}
                            title="移出此标签">✕</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 右栏：未添加标签 */}
                <div style={{
                  flex: 1, minWidth: 0,
                  border: '1.5px solid var(--color-page-shadow)',
                  borderRadius: '10px', padding: '12px',
                  background: 'rgba(245,230,200,0.12)',
                  maxHeight: '200px', overflowY: 'auto',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                    可选标签 <span style={{ fontWeight: 400 }}>({worldTags.filter((t) => !editing.tags.some((et) => et.id === t.id)).length})</span>
                  </div>
                  {worldTags.filter((t) => !editing.tags.some((et) => et.id === t.id)).length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px' }}>
                      没有更多标签可选
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {worldTags.filter((t) => !editing.tags.some((et) => et.id === t.id)).map((t) => (
                        <div key={t.id}
                          onClick={() => handleAddTagToItem(editing, t)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 600, color: t.color,
                            background: `${t.color}10`, border: `1px solid ${t.color}22`,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(ev) => {
                            ev.currentTarget.style.background = `${t.color}22`
                            ev.currentTarget.style.borderColor = `${t.color}55`
                          }}
                          onMouseLeave={(ev) => {
                            ev.currentTarget.style.background = `${t.color}10`
                            ev.currentTarget.style.borderColor = `${t.color}22`
                          }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%', background: t.color,
                            border: `1px solid ${darken(t.color, 0.2)}`, flexShrink: 0,
                          }} />
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.name}
                          </span>
                          <span style={{ fontSize: '13px', opacity: 0.35, flexShrink: 0 }}>+</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 标签管理按钮 */}
              <div style={{ marginTop: '10px' }}>
                {!tagEditMode ? (
                  <button className="btn" style={{ fontSize: '12px', padding: '5px 12px' }}
                    onClick={() => setTagEditMode(true)}>管理标签</button>
                ) : (
                  <div style={{
                    padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-page-shadow)',
                    background: 'rgba(245,230,200,0.2)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input className="input" placeholder="新标签名称" value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        style={{ flex: 1, fontSize: '13px', padding: '7px 10px', minWidth: 0 }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTag() }} />
                      <ColorPicker value={newTagColor} onChange={setNewTagColor} />
                      <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px', flexShrink: 0 }}
                        onClick={handleCreateTag} disabled={!newTagName.trim()}>创建</button>
                    </div>
                    {worldTags.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '80px', overflowY: 'auto' }}>
                        {worldTags.map((t) => (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', padding: '3px 6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: t.color, flexShrink: 0 }} />
                              <span style={{ color: 'var(--color-text)' }}>{t.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>({worldItems.filter((i) => i.tags.some((it) => it.id === t.id)).length})</span>
                            </div>
                            <button className="btn btn-danger" style={{ fontSize: '10px', padding: '2px 6px' }}
                              onClick={() => { deleteItemTag(t.id); setEditing((prev) => prev ? { ...prev, tags: prev.tags.filter((tt) => tt.id !== t.id) } : null) }}>删除</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn" style={{ fontSize: '11px', padding: '3px 8px', marginTop: '6px' }}
                      onClick={() => setTagEditMode(false)}>收起</button>
                  </div>
                )}
              </div>
            </div>

            {/* 描述 */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '14px', marginBottom: '6px' }}>描述</label>
              <textarea className="input" value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={4} style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '14px', padding: '10px 14px' }} />
            </div>

            {/* 自定义属性 */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <AttributeEditor compact attributes={editing.attributes || {}}
                onChange={(attrs) => setEditing({ ...editing, attributes: attrs })} />
            </div>

            {/* 底部留白 */}
            <div style={{ height: '12px', flexShrink: 0 }} />
          </div>
        ) : (
          /* ═══ 查看模式 ═══ */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', gap: '28px' }}>
            {/* 操作栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                {/* 图标 */}
                {selected.icon ? (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden',
                    border: `2px solid ${GOLD}`, flexShrink: 0,
                  }}>
                    <img src={selected.icon} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '10px', flexShrink: 0,
                    background: selected.tags[0]?.color || GOLD,
                    border: `2px solid ${darken(selected.tags[0]?.color || GOLD, 0.35)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: 700, color: '#f5e6c8',
                  }}>
                    {selected.name.charAt(0)}
                  </div>
                )}
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{selected.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => setEditing({ ...selected })}>编辑</button>
                <button className="btn btn-danger" style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => {
                    deleteItem(selected.id)
                    setSelectedId(null)
                  }}>删除</button>
              </div>
            </div>

            {/* 标签 */}
            {selected.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selected.tags.map((t) => (
                  <TagChip key={t.id} tag={t} small />
                ))}
              </div>
            )}

            {/* 物品 ID */}
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              物品 ID: <span style={{ fontFamily: 'monospace', fontSize: '10px', opacity: 0.6 }}>{selected.id.slice(0, 8)}...</span>
            </div>

            {/* 描述 */}
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600 }}>描述</div>
              <div style={{ fontSize: '15px', color: 'var(--color-text)', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                {selected.description || '暂无描述'}
              </div>
            </div>

            {/* 自定义属性 */}
            {selected.attributes && Object.keys(selected.attributes).filter((k) => k.trim()).length > 0 && (
              <div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: 600 }}>自定义属性</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(selected.attributes).filter(([k]) => k.trim()).map(([k, v]) => (
                    <div key={k} style={{
                      display: 'flex', padding: '10px 14px', borderRadius: '8px',
                      background: 'rgba(245,230,200,0.25)', border: '1px solid var(--color-page-shadow)',
                    }}>
                      <span style={{ flex: '0 0 35%', fontSize: '14px', fontWeight: 600, color: GOLD }}>{k}</span>
                      <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ flex: 1 }} />
          </div>
        )}
      </div>

      {/* ═══════ 弹窗：快速创建 ═══════ */}
      {showCreate && <CreateItemModal
        onSave={handleCreate}
        onClose={() => setShowCreate(false)} />}

      {/* ═══════ 弹窗：图标裁剪 ═══════ */}
      {showCrop && (
        <ImageCropModal
          onSave={(dataUrl) => { if (editing) setEditing({ ...editing, icon: dataUrl }); setShowCrop(false) }}
          onClose={() => setShowCrop(false)} />
      )}
    </div>
  )
}

// ═══════════════ 子组件 ═══════════════

function CreateItemModal({ onSave, onClose }: { onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2>创建新物品</h2>
        <div className="form-group">
          <label>物品名称 *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="输入物品名称..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" disabled={!name.trim()} onClick={() => onSave(name.trim())}>创建</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
