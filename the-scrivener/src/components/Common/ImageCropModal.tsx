// ========================================
// 图片裁剪弹窗 — 固定方形裁框 · 拖动定位 · 缩放
// 输出裁剪后的 data URL
// ========================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const CROP_SIZE = 200

export function ImageCropModal({ onSave, onClose }: { onSave: (dataUrl: string) => void; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const onFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setImgSrc(url)
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  // 缩放范围：最小让短边填满裁框，最大到 3x
  const minScale = naturalW > 0 && naturalH > 0 ? CROP_SIZE / Math.min(naturalW, naturalH) : 0.5
  const maxScale = Math.max(3, minScale * 3)

  // 裁剪
  const doCrop = useCallback(() => {
    if (!imgSrc || naturalW === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // 裁框中心在原图上的坐标
    const srcX = -offsetX / scale
    const srcY = -offsetY / scale
    ctx.drawImage(imgRef.current!, srcX, srcY, CROP_SIZE / scale, CROP_SIZE / scale, 0, 0, CROP_SIZE, CROP_SIZE)
    onSave(canvas.toDataURL('image/png'))
  }, [imgSrc, naturalW, scale, offsetX, offsetY, onSave])

  // 拖动
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    const sx = e.clientX - offsetX; const sy = e.clientY - offsetY
    const onMove = (ev: MouseEvent) => { setOffsetX(ev.clientX - sx); setOffsetY(ev.clientY - sy) }
    const onUp = () => { setDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // 计算显示尺寸
  const dw = Math.round(naturalW * scale)
  const dh = Math.round(naturalH * scale)

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '94%' }}>
        <h2>导入物品图标</h2>

        {!file ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            <div onClick={() => fileInputRef.current?.click()} style={{
              padding: '36px 24px', borderRadius: '12px', cursor: 'pointer',
              border: `2px dashed #b8860b88`, color: '#b8860b', fontSize: '15px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={(ev) => { ev.currentTarget.style.borderColor = '#daa520'; ev.currentTarget.style.background = 'rgba(184,134,11,0.06)' }}
              onMouseLeave={(ev) => { ev.currentTarget.style.borderColor = '#b8860b88'; ev.currentTarget.style.background = 'transparent' }}>
              + 选择图片文件
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              支持 PNG / JPG / GIF / WebP
            </div>
          </div>
        ) : (
          <>
            {/* 裁切区域 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                width: CROP_SIZE, height: CROP_SIZE, position: 'relative', overflow: 'hidden',
                borderRadius: '4px', border: '2px solid #b8860b', background: '#f0e0c0',
                cursor: dragging ? 'grabbing' : 'grab',
              }} onMouseDown={onMouseDown}>
                {/* 底图 */}
                {imgSrc && (
                  <img src={imgSrc} alt="" ref={imgRef} draggable={false}
                    onLoad={(e) => { const img = e.currentTarget; setNaturalW(img.naturalWidth); setNaturalH(img.naturalHeight) }}
                    style={{
                      position: 'absolute', top: offsetY, left: offsetX,
                      width: dw || 'auto', height: dh || 'auto',
                      pointerEvents: 'none', userSelect: 'none',
                    }} />
                )}
                {/* 裁框 overlay */}
                <div style={{ position: 'absolute', inset: 0, boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)` }} />
                {/* 裁框边线 */}
                <div style={{ position: 'absolute', inset: 0, border: '1px dashed #fff', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* 缩放滑块 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '0 20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flexShrink: 0 }}>缩放</span>
              <input type="range" min={minScale} max={maxScale} step={0.01} value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{ flex: 1 }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flexShrink: 0, width: '36px', textAlign: 'right' }}>
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* 按钮 */}
            <div className="form-actions" style={{ gap: '12px' }}>
              <button className="btn" style={{ fontSize: '13px', padding: '7px 16px' }}
                onClick={() => { setFile(null); setImgSrc(null); setNaturalW(0); setNaturalH(0) }}>重新选择</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" style={{ fontSize: '13px', padding: '7px 16px' }} onClick={onClose}>取消</button>
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '7px 16px' }}
                  onClick={() => { doCrop(); onClose() }}>确认裁剪</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
