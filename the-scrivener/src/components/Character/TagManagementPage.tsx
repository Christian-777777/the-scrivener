// ========================================
// 分类标签管理 — 独立全页视图
// 修改颜色/名称自动同步所有人物
// ========================================

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { CharacterTag } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function TagManagementPage() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const characterTags = useAppStore((s) => s.characterTags)
  const characters = useAppStore((s) => s.characters)
  const updateCharacterTag = useAppStore((s) => s.updateCharacterTag)
  const deleteCharacterTag = useAppStore((s) => s.deleteCharacterTag)
  const goBack = useAppStore((s) => s.goBack)

  const worldTags = useMemo(() => characterTags.filter((t) => t.worldId === currentWorldId), [characterTags, currentWorldId])
  const worldCharacters = useMemo(() => characters.filter((c) => c.worldId === currentWorldId), [characters, currentWorldId])

  // 每行编辑状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#b8860b')

  const startEdit = (tag: CharacterTag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const saveEdit = (tagId: string) => {
    if (!editName.trim()) return
    updateCharacterTag(tagId, { name: editName.trim(), color: editColor })
    setEditingId(null)
  }

  // 统计每个标签被多少人物使用
  const tagUsage = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of worldCharacters) {
      for (const t of c.tags) {
        m[t.name] = (m[t.name] || 0) + 1
      }
    }
    return m
  }, [worldCharacters])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 标题栏 */}
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '2px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn" onClick={goBack}>← 返回</button>
            <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>分类标签管理</h2>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {worldTags.length} 个标签 · {worldCharacters.length} 个人物
          </span>
        </div>
      </div>

      {/* 提示 */}
      <div style={{ padding: '12px 32px 0', flexShrink: 0, fontSize: '13px', color: 'var(--color-text-light)', lineHeight: '1.7' }}>
        修改标签颜色或名称将<b style={{ color: GOLD }}>自动同步</b>到所有带此标签的人物。
      </div>

      {/* 标签列表 — 右侧滚动条 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 24px 28px 32px', marginRight: '8px' }}>
        {worldTags.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            暂无分类标签。在人物编辑器中添加标签后，会出现在这里。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {worldTags.map((tag) => {
              const isEditing = editingId === tag.id
              const usage = tagUsage[tag.name] || 0

              if (isEditing) {
                return (
                  <div key={tag.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px',
                    borderRadius: '12px', border: `2px solid ${editColor}66`,
                    background: `${editColor}0a`,
                    flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ fontSize: '12px' }}>标签名称</label>
                        <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)}
                          autoFocus style={{ fontSize: '13px', padding: '8px 12px' }}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(tag.id) }} />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '22px' }}>
                        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 14px' }}
                          disabled={!editName.trim()} onClick={() => saveEdit(tag.id)}>保存</button>
                        <button className="btn" style={{ fontSize: '12px', padding: '5px 14px' }}
                          onClick={() => setEditingId(null)}>取消</button>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '12px' }}>标签颜色</label>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>
                  </div>
                )
              }

              return (
                <div key={tag.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 20px', borderRadius: '12px',
                  border: '1.5px solid var(--color-page-shadow)',
                  background: 'rgba(245,230,200,0.35)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tag.color
                    e.currentTarget.style.background = `${tag.color}0e`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-page-shadow)'
                    e.currentTarget.style.background = 'rgba(245,230,200,0.35)'
                  }}
                >
                  {/* 颜色圆点 */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: tag.color,
                    border: `2.5px solid ${tag.color}99`, flexShrink: 0,
                    boxShadow: `0 0 8px ${tag.color}33`,
                  }} />

                  {/* 名称 + 使用数 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {tag.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {usage} 个人物使用此标签
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button className="btn" style={{ fontSize: '12px', padding: '5px 14px' }}
                      onClick={() => startEdit(tag)}>编辑</button>
                    <button className="btn btn-danger" style={{ fontSize: '12px', padding: '5px 14px' }}
                      onClick={() => { if (confirm(`删除标签「${tag.name}」？此操作不删除人物。`)) deleteCharacterTag(tag.id) }}>删除</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
