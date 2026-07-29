// ═══ 颜色工具 + 主题常量 — 全项目共用 ═══

// --- 主题色 ---
export const GOLD = '#b8860b'
export const GOLD_LIGHT = '#daa520'
export const GOLD_DARK = '#8b6914'
export const WOOD_BG = '#2c1810'
export const LEATHER = '#3d2b1f'
export const PAGE_BG = '#f5e6c8'
export const PAGE_DARK = '#e8d5b7'

// --- 工具函数 ---

/** 将 hex 颜色加深 amount (0~1) */
export function darken(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount))
  const g = Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount))
  const b = Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount))
  return '#' + [r, g, b].map((x) => Math.max(0, x).toString(16).padStart(2, '0')).join('')
}

/** hex → rgba */
export function hexAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '')
  return `rgba(${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)},${a})`
}

/** darken 别名 — 0.55倍用于徽章/图标的深色外环 */
export function ringColor(c: string): string {
  return darken(c, 0.55)
}
