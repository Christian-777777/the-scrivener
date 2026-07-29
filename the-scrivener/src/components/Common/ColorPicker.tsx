// ========================================
// 颜色选择器 - HSV 画板调色 + 预设色
// 中世纪风格
// ========================================

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { GOLD, GOLD_LIGHT } from '@/utils/color'

const PRESET_COLORS = [
  '#b8860b', '#8b2252', '#3b5998', '#4a7c59',
  '#6b3fa0', '#b87333', '#8a9ba8', '#c4685a',
  '#5a7a8a', '#9b6b43', '#2e6b5e', '#7b3f5c',
  '#c4a35a', '#4a708b', '#8b4513', '#556b2f',
  '#9932cc', '#cd853f', '#4682b4', '#a0522d',
]

// ═══ HSV ↔ RGB ↔ Hex ═══
function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  }
  const r = Math.round(f(5) * 255)
  const g = Math.round(f(3) * 255)
  const b = Math.round(f(1) * 255)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const hh = hex.replace('#', '')
  const r = parseInt(hh.substring(0, 2), 16) / 255
  const g = parseInt(hh.substring(2, 4), 16) / 255
  const b = parseInt(hh.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b); const min = Math.min(r, g, b)
  const d = max - min
  let h = 0; const s = max === 0 ? 0 : d / max; const v = max
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
  }
  return { h, s, v }
}

// ═══ Props ═══
interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

// ═══ 主组件 ═══
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      {PRESET_COLORS.slice(0, 12).map((c) => (
        <div key={c} onClick={() => onChange(c)}
          title={c}
          style={{
            width: '26px', height: '26px', borderRadius: '50%', background: c,
            cursor: 'pointer',
            border: value === c ? `3px solid ${GOLD_LIGHT}` : '2px solid rgba(139,105,20,0.3)',
            boxShadow: value === c ? `0 0 8px ${c}88` : 'none',
            transition: 'all 0.15s ease',
            transform: value === c ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
      {/* 展开高级面板按钮 */}
      <div onClick={() => setShowAdvanced(!showAdvanced)}
        title="自定义颜色"
        style={{
          width: '26px', height: '26px', borderRadius: '50%',
          cursor: 'pointer',
          border: showAdvanced ? `2px solid ${GOLD_LIGHT}` : '2px dashed rgba(139,105,20,0.4)',
          background: showAdvanced ? 'rgba(184,134,11,0.15)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: GOLD, transition: 'all 0.15s ease',
          boxShadow: showAdvanced ? `0 0 6px ${GOLD}44` : 'none',
        }}>
        +
      </div>

      {showAdvanced && (
        <AdvancedPanel value={value} onChange={onChange} onClose={() => setShowAdvanced(false)} />
      )}
    </div>
  )
}

// ═══ 高级 HSV 调色面板（居中模态） ═══
function AdvancedPanel({ value, onChange, onClose }: {
  value: string; onChange: (c: string) => void; onClose: () => void;
}) {
  const { h: ih, s: is, v: iv } = hexToHsv(value)
  const [hue, setHue] = useState(ih)
  const [sat, setSat] = useState(is)
  const [val, setVal] = useState(iv)
  const [hexInput, setHexInput] = useState(value)
  const [dragging, setDragging] = useState<'sv' | 'hue' | null>(null)

  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  const currentColor = hsvToHex(hue, sat, val)

  // 同步外部 value 变化
  useEffect(() => {
    const hs = hexToHsv(value)
    setHue(hs.h); setSat(hs.s); setVal(hs.v); setHexInput(value)
  }, [value])

  // ── 鼠标交互 ──
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  const updateFromSV = useCallback((clientX: number, clientY: number) => {
    const el = svRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    setSat(clamp((clientX - r.left) / r.width, 0, 1))
    setVal(1 - clamp((clientY - r.top) / r.height, 0, 1))
  }, [])

  const updateFromHue = useCallback((clientX: number) => {
    const el = hueRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    setHue(clamp(((clientX - r.left) / r.width) * 360, 0, 360))
  }, [])

  const handleMouseDown = (e: React.MouseEvent, type: 'sv' | 'hue') => {
    e.preventDefault(); e.stopPropagation()
    setDragging(type)
    if (type === 'sv') updateFromSV(e.clientX, e.clientY)
    else updateFromHue(e.clientX)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (dragging === 'sv') updateFromSV(e.clientX, e.clientY)
      else updateFromHue(e.clientX)
    }
    const onUp = () => setDragging(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, updateFromSV, updateFromHue])

  // ── Hex 输入 ──
  const handleHexSubmit = () => {
    const hx = hexInput.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(hx)) {
      const hs = hexToHsv(hx)
      setHue(hs.h); setSat(hs.s); setVal(hs.v)
    } else if (/^[0-9a-fA-F]{6}$/.test(hx)) {
      const full = '#' + hx
      const hs = hexToHsv(full)
      setHue(hs.h); setSat(hs.s); setVal(hs.v)
      setHexInput(full)
    }
  }

  const handleConfirm = () => {
    onChange(currentColor)
    onClose()
  }

  const hueColor = hsvToHex(hue, 1, 1)

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '320px', width: '95%', padding: '20px 22px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '16px' }}>自定义颜色</h2>

        {/* SV 方形色板 */}
        <div ref={svRef}
          onMouseDown={(e) => handleMouseDown(e, 'sv')}
          style={{
            width: '100%', height: '170px', borderRadius: '8px',
            position: 'relative', cursor: 'crosshair',
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
            marginBottom: '10px',
          }}>
          {/* 十字光标 */}
          <div style={{
            position: 'absolute',
            left: `${sat * 100}%`, top: `${(1 - val) * 100}%`,
            width: '16px', height: '16px',
            borderRadius: '50%',
            border: '2.5px solid #fff',
            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            background: currentColor,
          }} />
        </div>

        {/* 色相条 */}
        <div ref={hueRef}
          onMouseDown={(e) => handleMouseDown(e, 'hue')}
          style={{
            width: '100%', height: '20px', borderRadius: '10px',
            position: 'relative', cursor: 'pointer',
            background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
            marginBottom: '14px',
          }}>
          <div style={{
            position: 'absolute',
            left: `${(hue / 360) * 100}%`, top: '50%',
            width: '14px', height: '24px',
            borderRadius: '3px',
            border: '2px solid #fff',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            background: hsvToHex(hue, 1, 1),
          }} />
        </div>

        {/* 预览 + 剩余预设色 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '8px',
            border: '2px solid var(--color-accent)',
            background: currentColor,
            flexShrink: 0,
          }} />
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1 }}>
            {PRESET_COLORS.slice(12).map((c) => (
              <div key={c} onClick={() => { const hs = hexToHsv(c); setHue(hs.h); setSat(hs.s); setVal(hs.v); setHexInput(c) }}
                title={c}
                style={{
                  width: '20px', height: '20px', borderRadius: '4px', background: c,
                  cursor: 'pointer', border: currentColor === c ? `2px solid ${GOLD_LIGHT}` : '1px solid rgba(0,0,0,0.15)',
                }} />
            ))}
          </div>
        </div>

        {/* Hex 输入 */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>HEX 色值</label>
          <input className="input" value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleHexSubmit() } }}
            onBlur={handleHexSubmit}
            style={{ fontFamily: 'monospace', fontSize: '14px', padding: '8px 12px' }} />
        </div>

        {/* 按钮 */}
        <div className="form-actions" style={{ marginTop: '0' }}>
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleConfirm}>确认</button>
        </div>
      </div>
    </div>, document.body
  )
}
