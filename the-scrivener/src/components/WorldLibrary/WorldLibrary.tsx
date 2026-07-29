// ========================================
// 世界库面板 - 世界列表 + 创建世界 + 字体
// ========================================

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import { CreateWorldModal } from './CreateWorldModal'
import { ContextMenu } from '@/components/Common/ContextMenu'
import { ImageCropModal } from '@/components/Common/ImageCropModal'
import { GOLD } from '@/utils/color'

export function WorldLibrary({ onCloseBook }: { onCloseBook: () => void }) {
  const worlds = useAppStore((s) => s.worlds)
  const enterWorld = useAppStore((s) => s.enterWorld)
  const deleteWorld = useAppStore((s) => s.deleteWorld)
  const renameWorld = useAppStore((s) => s.renameWorld)
  const updateWorld = useAppStore((s) => s.updateWorld)
  const fontFamily = useAppStore((s) => s.fontFamily)
  const setFontFamily = useAppStore((s) => s.setFontFamily)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; worldId: string
  } | null>(null)
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null)
  const [iconTarget, setIconTarget] = useState<string | null>(null)

  const handleContextMenu = (e: React.MouseEvent, worldId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, worldId })
  }

  const handleRename = () => {
    if (!contextMenu) return
    const world = worlds.find((w) => w.id === contextMenu.worldId)
    if (world) {
      setRenameTarget({ id: world.id, name: world.name })
    }
    setContextMenu(null)
  }

  const handleChangeIcon = () => {
    if (!contextMenu) return
    setIconTarget(contextMenu.worldId)
    setContextMenu(null)
  }

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleDelete = () => {
    if (!contextMenu) return
    setDeleteTarget(contextMenu.worldId)
    setContextMenu(null)
  }

  const fonts: { key: string; label: string }[] = [
    { key: 'heiti', label: '黑体' },
    { key: 'songti', label: '宋体' },
    { key: 'kaiti', label: '楷体' },
    { key: 'huati', label: '花体' },
  ]

  const menuItemStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    color: active ? 'var(--color-gold-dark)' : 'var(--color-text)',
    background: active ? 'var(--color-button-bg)' : 'transparent',
    border: active ? '1px solid var(--color-button-border)' : '1px solid transparent',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      {/* 标题 */}
      <div style={{
        fontSize: '22px',
        color: 'var(--color-gold-dark)',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid var(--color-accent)',
        letterSpacing: '4px',
        textAlign: 'center',
      }}>
        世界库
      </div>

      {/* 世界列表 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {worlds.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
          }}>
            暂无世界，请点击下方创建
          </div>
        ) : (
          worlds.map((world) => (
            <div
              key={world.id}
              onClick={() => enterWorld(world.id)}
              onContextMenu={(e) => handleContextMenu(e, world.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
                marginBottom: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                border: '1px solid var(--color-page-shadow)',
                background: 'rgba(245, 230, 200, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(184, 134, 11, 0.15)'
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245, 230, 200, 0.4)'
                e.currentTarget.style.borderColor = 'var(--color-page-shadow)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              {/* 世界图标 */}
              {world.icon ? (
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden',
                  border: `2px solid ${GOLD}`,
                  boxShadow: `0 0 8px ${GOLD}22`, flexShrink: 0,
                }}>
                  <img src={world.icon} alt={world.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ) : (
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: GOLD,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 700, color: '#f5e6c8',
                }}>
                  {world.name.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {world.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  marginTop: '4px',
                }}>
                  {new Date(world.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部按钮区 */}
      <div style={{
        borderTop: '1px solid var(--color-page-shadow)',
        paddingTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div
          onClick={() => setShowCreateModal(true)}
          style={menuItemStyle(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-button-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          <span>创建世界</span>
        </div>

        {/* 字体选择 */}
        <div style={{
          padding: '8px 0',
          fontSize: '13px',
          color: 'var(--color-text-light)',
        }}>
          字体设置
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {fonts.map((f) => (
            <div
              key={f.key}
              onClick={() => setFontFamily(f.key as typeof fontFamily)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                border: fontFamily === f.key
                  ? '1.5px solid var(--color-gold)'
                  : '1px solid var(--color-page-shadow)',
                background: fontFamily === f.key
                  ? 'var(--color-button-bg)'
                  : 'transparent',
                color: fontFamily === f.key
                  ? 'var(--color-gold-dark)'
                  : 'var(--color-text-light)',
                transition: 'all 0.2s ease',
              }}
            >
              {f.label}
            </div>
          ))}
        </div>

        {/* 合上书本 */}
        <div onClick={onCloseBook}
          style={{
            marginTop: '14px', padding: '12px 16px', borderRadius: '10px',
            cursor: 'pointer', textAlign: 'center',
            border: '1.5px solid rgba(139,105,20,0.3)',
            color: 'var(--color-text-muted)', fontSize: '14px',
            fontWeight: 500, letterSpacing: '1px',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-gold)'
            e.currentTarget.style.color = 'var(--color-gold)'
            e.currentTarget.style.background = 'rgba(184,134,11,0.08)'
            e.currentTarget.style.boxShadow = '0 0 14px rgba(184,134,11,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139,105,20,0.3)'
            e.currentTarget.style.color = 'var(--color-text-muted)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}>
          ◈ 合上书本
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: '重命名', onClick: handleRename },
            { label: '更换图标', onClick: handleChangeIcon },
            { label: '删除', onClick: handleDelete, danger: true },
          ]}
        />
      )}

      {/* 创建世界弹窗 */}
      {showCreateModal && (
        <CreateWorldModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* 重命名弹窗 */}
      {renameTarget && (
        <RenameWorldModal
          id={renameTarget.id}
          currentName={renameTarget.name}
          onClose={() => setRenameTarget(null)}
          onRename={(id, name) => {
            renameWorld(id, name)
            setRenameTarget(null)
          }}
        />
      )}

      {/* 图标裁剪弹窗 */}
      {iconTarget && (
        <ImageCropModal
          onSave={(dataUrl) => { updateWorld(iconTarget, { icon: dataUrl }); setIconTarget(null) }}
          onClose={() => setIconTarget(null)} />
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <DeleteWorldModal
          worldName={worlds.find((w) => w.id === deleteTarget)?.name || ''}
          onConfirm={() => { deleteWorld(deleteTarget); setDeleteTarget(null) }}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}

// 删除确认弹窗
function DeleteWorldModal({ worldName, onConfirm, onClose }: {
  worldName: string; onConfirm: () => void; onClose: () => void;
}) {
  const [input, setInput] = useState('')
  const canDelete = input.trim() === worldName

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <h2 style={{ color: '#b43c3c' }}>删除世界</h2>
        <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--color-text-light)', lineHeight: '1.7', textAlign: 'center' }}>
          此操作<b>不可撤销</b>。世界中所有编年史、地图、人物、物品、怪物数据都将被<b style={{ color: '#b43c3c' }}>永久删除</b>。
        </div>
        <div className="form-group">
          <label>请输入世界名称 <b style={{ color: '#b43c3c' }}>{worldName}</b> 以确认：</label>
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={worldName} autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && canDelete) onConfirm() }}
            style={{ fontSize: '14px', padding: '10px 14px' }} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-danger" disabled={!canDelete} onClick={onConfirm}
            style={{ opacity: canDelete ? 1 : 0.4 }}>确认删除</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// 重命名弹窗
function RenameWorldModal({
  id,
  currentName,
  onClose,
  onRename,
}: {
  id: string
  currentName: string
  onClose: () => void
  onRename: (id: string, name: string) => void
}) {
  const [name, setName] = useState(currentName)

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>重命名世界</h2>
        <div className="form-group">
          <label>世界名称</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                onRename(id, name.trim())
              }
            }}
          />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() => onRename(id, name.trim())}
          >
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
