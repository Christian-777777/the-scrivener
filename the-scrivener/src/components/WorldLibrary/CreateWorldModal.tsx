// ========================================
// 创建世界弹窗
// ========================================

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'

interface CreateWorldModalProps {
  onClose: () => void
}

export function CreateWorldModal({ onClose }: CreateWorldModalProps) {
  const [name, setName] = useState('')
  const createWorld = useAppStore((s) => s.createWorld)

  const handleCreate = () => {
    if (!name.trim()) return
    createWorld(name.trim())
    onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>创建新世界</h2>
        <div className="form-group">
          <label>世界名称</label>
          <input
            className="input"
            placeholder="请输入世界名称..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={handleCreate}
          >
            创建世界
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
