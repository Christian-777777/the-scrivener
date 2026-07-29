// ========================================
// 标签搜索页面 - 显示所有带某标签的内容
// ========================================

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

interface SearchResult {
  type: string
  id: string
  text: string
  source: string
  sourceId: string
}

export function SearchPage() {
  const goBack = useAppStore((s) => s.goBack)
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const getContentByTag = useAppStore((s) => s.getContentByTag)

  const [searchTag, setSearchTag] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tag = params.get('tag') || ''
    setSearchTag(tag)
    if (tag && currentWorldId) {
      setResults(getContentByTag(tag, currentWorldId))
    }
  }, [currentWorldId, getContentByTag])

  const handleSearch = (tag: string) => {
    setSearchTag(tag)
    if (tag && currentWorldId) {
      setResults(getContentByTag(tag, currentWorldId))
    } else {
      setResults([])
    }
  }

  return (
    <div className="search-page">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <button className="btn" onClick={goBack} style={{ flexShrink: 0 }}>
          ← 返回
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>
          搜索标签: <span style={{ color: 'var(--color-gold-dark)' }}>{searchTag}</span>
        </h2>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          className="input"
          placeholder="输入标签名称搜索..."
          value={searchTag}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ maxWidth: '400px', fontSize: '16px', padding: '12px 16px' }}
        />
      </div>

      <div className="search-results">
        {results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-muted)',
            fontSize: '15px',
          }}>
            {searchTag ? '未找到相关内容' : '请输入标签名称进行搜索'}
          </div>
        ) : (
          <>
            <div style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginBottom: '12px',
            }}>
              共找到 {results.length} 条结果
            </div>
            {results.map((item, i) => (
              <div key={`${item.type}-${item.id}-${i}`} className="search-result-item">
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-gold-dark)',
                  marginBottom: '4px',
                }}>
                  {item.source} · {item.type}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
