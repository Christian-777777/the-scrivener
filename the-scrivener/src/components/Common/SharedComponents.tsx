// ========================================
// 属性编辑器 — 通用 key-value 对编辑器
// 物品/怪物模块共用
// ========================================

interface AttributeEditorProps {
  attributes: Record<string, string>
  onChange: (attrs: Record<string, string>) => void
  compact?: boolean // 紧凑模式（物品用）
}

export function AttributeEditor({ attributes, onChange, compact }: AttributeEditorProps) {
  const attrs = { ...attributes }
  const entries = Object.entries(attrs)

  const fs = compact ? '12px' : '13px'
  const pad = compact ? '5px 8px' : '7px 10px'
  const gap = compact ? '6px' : '8px'

  const setValue = (k: string, v: string) => {
    const next = { ...attrs, [k]: v }
    if (!v.trim()) { delete next[k]; if (Object.keys(next).length === 0) next[''] = '' }
    onChange(next)
  }

  const renameKey = (oldKey: string, newKey: string) => {
    const next: Record<string, string> = {}
    for (const [ek, ev] of entries) {
      if (ek === oldKey) { if (newKey.trim()) next[newKey.trim()] = ev }
      else { next[ek] = ev }
    }
    if (Object.keys(next).length === 0) next[''] = ''
    onChange(next)
  }

  const removeEntry = (k: string) => {
    const next: Record<string, string> = {}
    for (const [ek, ev] of entries) { if (ek !== k) next[ek] = ev }
    if (Object.keys(next).length === 0) next[''] = ''
    onChange(next)
  }

  return (
    <div>
      <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
        自定义属性
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {entries.map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', gap, alignItems: 'center' }}>
            <input className="input" placeholder="属性名" value={k}
              onChange={(e) => renameKey(k, e.target.value)}
              style={{ flex: '0 0 35%', minWidth: 0, fontSize: fs, padding: pad }} />
            <input className="input" placeholder="值" value={v}
              onChange={(e) => setValue(k || e.target.value ? k : '', e.target.value)}
              style={{ flex: 1, minWidth: 0, fontSize: fs, padding: pad }} />
            <button className="btn" style={{ fontSize: '10px', padding: '2px 6px', flexShrink: 0 }}
              onClick={() => removeEntry(k)}>✕</button>
          </div>
        ))}
      </div>
      <button className="btn" style={{ fontSize: '11px', padding: '4px 10px', marginTop: '6px' }}
        onClick={() => onChange({ ...attrs, '': '' })}>+ 添加属性</button>
    </div>
  )
}
