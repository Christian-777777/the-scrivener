// ========================================
// 怪物分类标签管理 — 独立全页视图
// 编辑走弹窗（行内不展开，布局不抖动）
// ========================================

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { MonsterTag } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { GOLD, GOLD_LIGHT, darken } from '@/utils/color'

export function MonsterTagManagementPage() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const monsterTags = useAppStore((s) => s.monsterTags)
  const monsters = useAppStore((s) => s.monsters)
  const addMonsterTag = useAppStore((s) => s.addMonsterTag)
  const updateMonsterTag = useAppStore((s) => s.updateMonsterTag)
  const deleteMonsterTag = useAppStore((s) => s.deleteMonsterTag)
  const goBack = useAppStore((s) => s.goBack)

  const worldTags = useMemo(() => monsterTags.filter((t) => t.worldId === currentWorldId), [monsterTags, currentWorldId])
  const worldMonsters = useMemo(() => monsters.filter((m) => m.worldId === currentWorldId), [monsters, currentWorldId])

  const [editingTag, setEditingTag] = useState<MonsterTag | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const tagUsage = useMemo(() => {
    const m: Record<string, number> = {}
    for (const mon of worldMonsters) {
      for (const t of mon.tags) {
        m[t.name] = (m[t.name] || 0) + 1
      }
    }
    return m
  }, [worldMonsters])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 标题栏 */}
      <div style={{ padding: '32px 48px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '2px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn" onClick={goBack} style={{ fontSize: '13px', padding: '6px 14px' }}>← 返回</button>
            <h2 style={{ fontSize: '24px', color: GOLD, margin: 0, letterSpacing: '5px' }}>怪物分类标签管理</h2>
          </div>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {worldTags.length} 个标签 · {worldMonsters.length} 种怪物
          </span>
        </div>
      </div>

      <div style={{ padding: '14px 48px 0', flexShrink: 0, fontSize: '14px', color: 'var(--color-text-light)', lineHeight: '1.8' }}>
        修改标签颜色或名称将<b style={{ color: GOLD }}>自动同步</b>到所有带此标签的怪物。
      </div>

      <div style={{ padding: '14px 48px 0', flexShrink: 0 }}>
        <div onClick={() => setShowCreate(true)} style={{
          padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
          border: `1.5px dashed ${GOLD}55`, color: GOLD, fontSize: '15px', fontWeight: 600,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; e.currentTarget.style.borderColor = GOLD_LIGHT }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${GOLD}55` }}>
          + 创建新标签
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 48px 32px 48px', marginRight: '8px' }}>
        {worldTags.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: '2' }}>
            暂无分类标签<br />
            <span style={{ fontSize: '13px' }}>点击上方「创建新标签」或在怪物编辑器中添加标签后，会出现在这里。</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {worldTags.map((tag) => {
              const usage = tagUsage[tag.name] || 0
              return (
                <div key={tag.id} style={{
                  display: 'flex', alignItems: 'center', gap: '20px',
                  padding: '18px 24px', borderRadius: '14px',
                  border: '1.5px solid var(--color-page-shadow)',
                  background: 'rgba(245,230,200,0.35)',
                  transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = tag.color; e.currentTarget.style.background = `${tag.color}0e`; e.currentTarget.style.boxShadow = `0 2px 12px ${tag.color}18` }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-page-shadow)'; e.currentTarget.style.background = 'rgba(245,230,200,0.35)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', background: tag.color,
                    border: `3px solid ${darken(tag.color, 0.25)}`, flexShrink: 0,
                    boxShadow: `0 0 12px ${tag.color}33`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)' }}>{tag.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                      {usage} 种怪物使用此标签
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button className="btn" style={{ fontSize: '13px', padding: '7px 18px' }}
                      onClick={() => setEditingTag(tag)}>编辑</button>
                    <button className="btn btn-danger" style={{ fontSize: '13px', padding: '7px 18px' }}
                      onClick={() => { if (confirm(`删除标签「${tag.name}」？此操作不删除怪物。`)) deleteMonsterTag(tag.id) }}>删除</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editingTag && (
        <EditMonsterTagModal tag={editingTag} usage={tagUsage[editingTag.name] || 0}
          onSave={(name, color) => { updateMonsterTag(editingTag.id, { name, color }); setEditingTag(null) }}
          onClose={() => setEditingTag(null)} />
      )}

      {showCreate && (
        <CreateMonsterTagModal
          onSave={(name, color) => { addMonsterTag({ name, color, worldId: currentWorldId! }); setShowCreate(false) }}
          onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

function EditMonsterTagModal({ tag, usage, onSave, onClose }: {
  tag: MonsterTag; usage: number; onSave: (name: string, color: string) => void; onClose: () => void
}) {
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color)
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
        <h2>编辑标签</h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '18px 22px', borderRadius: '12px',
          background: 'rgba(245,230,200,0.35)', border: '1.5px solid var(--color-page-shadow)',
          marginBottom: '24px',
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: color, border: `3px solid ${darken(color, 0.25)}`, flexShrink: 0, boxShadow: `0 0 14px ${color}33` }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>{name || '(空)'}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{usage} 种怪物使用此标签</div>
          </div>
        </div>
        <div className="form-group"><label>标签名称 *</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus style={{ fontSize: '15px', padding: '10px 14px' }} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim(), color) }} /></div>
        <div className="form-group"><label>标签颜色</label><ColorPicker value={color} onChange={setColor} /></div>
        <div className="form-actions"><button className="btn" onClick={onClose} style={{ fontSize: '13px', padding: '7px 18px' }}>取消</button><button className="btn btn-primary" disabled={!name.trim()} onClick={() => onSave(name.trim(), color)} style={{ fontSize: '13px', padding: '7px 18px' }}>保存</button></div>
      </div>
    </div>,
    document.body
  )
}

function CreateMonsterTagModal({ onSave, onClose }: { onSave: (name: string, color: string) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#b8860b')
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
        <h2>创建新标签</h2>
        <div className="form-group"><label>标签名称 *</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="输入标签名称..." style={{ fontSize: '15px', padding: '10px 14px' }} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim(), color) }} /></div>
        <div className="form-group"><label>标签颜色</label><ColorPicker value={color} onChange={setColor} /></div>
        <div className="form-actions"><button className="btn" onClick={onClose} style={{ fontSize: '13px', padding: '7px 18px' }}>取消</button><button className="btn btn-primary" disabled={!name.trim()} onClick={() => onSave(name.trim(), color)} style={{ fontSize: '13px', padding: '7px 18px' }}>创建</button></div>
      </div>
    </div>,
    document.body
  )
}
