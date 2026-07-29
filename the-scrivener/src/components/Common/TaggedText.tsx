// ========================================
// 标签文本组件 - 被标签约束的高亮可点击文本
// ========================================

import { useAppStore } from '@/store/useAppStore'

interface TaggedTextProps {
  text: string
  tagName: string
  color?: string
  worldId: string
}

export function TaggedText({ text, tagName, color, worldId }: TaggedTextProps) {
  const navigateTo = useAppStore((s) => s.navigateTo)
  const borderColor = color || '#8B7355'

  const handleClick = () => {
    // 打开搜索页面，搜索该标签
    const searchUrl = `?tag=${encodeURIComponent(tagName)}`
    window.history.pushState({}, '', searchUrl)
    navigateTo('search', `搜索: ${tagName}`)
  }

  return (
    <span
      className="tagged-text"
      onClick={handleClick}
      title={`点击搜索标签: ${tagName}`}
      style={{
        borderColor,
        color: borderColor,
        fontWeight: 600,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${borderColor}22`
        e.currentTarget.style.boxShadow = `0 0 0 2px ${borderColor}33`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {text}
    </span>
  )
}
