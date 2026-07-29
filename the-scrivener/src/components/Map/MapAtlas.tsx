// ========================================
// 地图集 — 地图存档目录（有夹缝双页）
// ========================================

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

export function MapAtlas() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const maps = useAppStore((s) => s.maps)
  const setCurrentMap = useAppStore((s) => s.setCurrentMap)
  const addMap = useAppStore((s) => s.addMap)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)
  const deleteMap = useAppStore((s) => s.deleteMap)

  const worldMaps = maps.filter((m) => m.worldId === currentWorldId)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const handleEnterMap = (mapId: string) => {
    setCurrentMap(mapId)
    navigateTo('map', '地图编辑')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, padding: '28px 32px' }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', paddingBottom: '14px',
        borderBottom: '2px solid var(--color-accent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn" onClick={goBack}>← 返回</button>
          <h2 style={{ fontSize: '22px', color: GOLD, margin: 0, letterSpacing: '4px' }}>地图集</h2>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {worldMaps.length} 个地图存档
        </span>
      </div>

      {/* 地图列表 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {worldMaps.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'var(--color-text-muted)', fontSize: '15px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🗺</div>
            暂无地图存档，请点击下方创建
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {worldMaps.map((m) => (
              <div key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--color-page-shadow)',
                  background: 'rgba(245,230,200,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184,134,11,0.12)'
                  e.currentTarget.style.borderColor = GOLD_LIGHT
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = `0 0 12px ${GOLD}22`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245,230,200,0.3)'
                  e.currentTarget.style.borderColor = 'var(--color-page-shadow)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}
                  onClick={() => handleEnterMap(m.id)}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}08)`,
                    border: `1px solid ${GOLD}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {m.backgroundImage ? '🖼' : '🗺'}
                  </div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {m.dimensionName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {m.backgroundImage ? '已导入底图' : '空白地图'} · {m.landmarks?.length || 0} 地标 · {m.regions?.length || 0} 区域
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget({ id: m.id, name: m.dimensionName })
                  }}
                    title="删除地图"
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '14px', color: '#b43c3c',
                      border: '1px solid rgba(180,60,60,0.3)',
                      background: 'rgba(180,60,60,0.08)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(180,60,60,0.2)'
                      e.currentTarget.style.borderColor = 'rgba(180,60,60,0.6)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(180,60,60,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(180,60,60,0.3)'
                    }}
                  >✕</div>
                  <div style={{ fontSize: '20px', color: GOLD, opacity: 0.5 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部：创建新地图 */}
      <div style={{
        borderTop: '1px solid var(--color-page-shadow)',
        paddingTop: '16px', marginTop: '16px',
      }}>
        <div onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px',
            borderRadius: '10px',
            border: `2px dashed ${GOLD}55`,
            cursor: 'pointer',
            color: GOLD,
            fontSize: '15px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(184,134,11,0.08)'
            e.currentTarget.style.borderColor = GOLD_LIGHT
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = `${GOLD}55`
          }}
        >
          <span style={{ fontSize: '22px', lineHeight: 1 }}>+</span>
          <span>创建新的地图存档</span>
        </div>
      </div>

      {showCreate && (
        <CreateAtlasModal onClose={() => setShowCreate(false)} />
      )}
      {deleteTarget && (
        <DeleteMapModal target={deleteTarget} onDelete={(id) => { deleteMap(id); setDeleteTarget(null) }} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}

// ═══ 删除确认弹窗（需输入名称二次确认） ═══
function DeleteMapModal({ target, onDelete, onClose }: {
  target: { id: string; name: string }
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [input, setInput] = useState('')
  const canDelete = input.trim() === target.name

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
        <h2 style={{ color: '#b43c3c' }}>删除地图</h2>
        <div style={{ marginBottom: '18px', fontSize: '14px', color: 'var(--color-text-light)', lineHeight: '1.7', textAlign: 'center' }}>
          此操作不可撤销。该地图上的<b>所有地标和区域</b>也将被永久删除。
        </div>
        <div className="form-group">
          <label style={{ fontSize: '13px' }}>
            请输入地图名称 <b style={{ color: '#b43c3c' }}>{target.name}</b> 以确认删除：
          </label>
          <input className="input" value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={target.name}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && canDelete) onDelete(target.id) }}
            style={{
              borderColor: input ? (canDelete ? 'var(--color-input-focus)' : '#b43c3c') : 'var(--color-input-border)',
            }} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-danger"
            disabled={!canDelete}
            onClick={() => onDelete(target.id)}
            style={{ opacity: canDelete ? 1 : 0.4, fontWeight: canDelete ? 700 : 400 }}>
            确认删除
          </button>
        </div>
      </div>
    </div>, document.body
  )
}

// ═══ 创建地图弹窗 ═══
function CreateAtlasModal({ onClose }: { onClose: () => void }) {
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
        <div className="form-group">
          <label>维度名称 *</label>
          <input className="input" value={nm} onChange={(e) => setNm(e.target.value)}
            placeholder="如：主大陆、北境、灵界..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') h() }} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" disabled={!nm.trim()} onClick={h}>创建</button>
        </div>
      </div>
    </div>, document.body
  )
}
