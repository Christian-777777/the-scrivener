// ========================================
// 世界OC编辑器 - 背景音乐播放器
// 右下角悬浮控制，中世纪风格
// ========================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import { musicTracks } from '@/music/tracks'

// 显式中文字体栈（不依赖 CSS 变量，避免 portal 继承问题）
const CJK_FONT = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "SimSun", sans-serif'

export function MusicPlayer() {
  const musicVolume = useAppStore((s) => s.musicVolume)
  const musicMuted = useAppStore((s) => s.musicMuted)
  const musicPlaying = useAppStore((s) => s.musicPlaying)
  const musicTrackIndex = useAppStore((s) => s.musicTrackIndex)
  const setMusicVolume = useAppStore((s) => s.setMusicVolume)
  const toggleMusicMuted = useAppStore((s) => s.toggleMusicMuted)
  const setMusicPlaying = useAppStore((s) => s.setMusicPlaying)
  const nextMusicTrack = useAppStore((s) => s.nextMusicTrack)
  const prevMusicTrack = useAppStore((s) => s.prevMusicTrack)

  const [expanded, setExpanded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (musicTracks.length === 0) return null

  const effectiveIndex = ((musicTrackIndex % musicTracks.length) + musicTracks.length) % musicTracks.length
  const currentTrack = musicTracks[effectiveIndex]
  const effectiveVolume = musicMuted ? 0 : musicVolume

  // --- 构建音频路径 ---
  // Vite 构建时 public/ 目录的文件原样复制到 dist/，因此相对路径 ./music/xxx 可用
  const audioSrc = `./music/${currentTrack.file}`

  // --- 初始化音频对象（仅首次挂载） ---
  const [audioReady, setAudioReady] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = musicMuted ? 0 : musicVolume

    audio.addEventListener('canplaythrough', () => {
      console.log('[音乐] 曲目就绪:', currentTrack.name)
      setAudioReady(true)
    })

    audio.addEventListener('ended', () => {
      console.log('[音乐] 曲目结束，切换下一首')
      nextMusicTrack()
    })

    audio.addEventListener('error', (e) => {
      console.warn('[音乐] 加载失败:', currentTrack.file, audio.error?.message || e)
    })

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [])

  // --- 音频就绪后加载曲目 + 自动播放 ---
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    console.log('[音乐] 加载曲目:', currentTrack.name, audioSrc)
    audio.src = audioSrc
    audio.load()

    // 加载完成后自动播放
    const onCanPlay = () => {
      if (musicPlaying) {
        audio.play().catch((e) => {
          console.warn('[音乐] 自动播放被阻止:', e.message)
          // 首次用户交互后重试
          const resume = () => {
            audio.play().catch(() => {})
            document.removeEventListener('click', resume)
          }
          document.addEventListener('click', resume, { once: true })
        })
      }
      audio.removeEventListener('canplaythrough', onCanPlay)
    }
    audio.addEventListener('canplaythrough', onCanPlay)

    return () => {
      audio.removeEventListener('canplaythrough', onCanPlay)
    }
  }, [effectiveIndex, audioSrc])

  // --- 播放/暂停同步 ---
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (musicPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [musicPlaying])

  // --- 音量同步 ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicMuted ? 0 : musicVolume
    }
  }, [musicVolume, musicMuted])

  // --- UI 逻辑 ---
  const scheduleCollapse = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    collapseTimer.current = setTimeout(() => setExpanded(false), 4000)
  }, [])

  const handleToggleExpand = () => {
    setExpanded((prev) => {
      if (prev) {
        if (collapseTimer.current) clearTimeout(collapseTimer.current)
        return false
      }
      scheduleCollapse()
      return true
    })
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMusicVolume(parseFloat(e.target.value))
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
  }

  const handleToggleMute = () => { toggleMusicMuted(); scheduleCollapse() }
  const handleTogglePlay = () => { setMusicPlaying(!musicPlaying); scheduleCollapse() }
  const handlePrev = () => { prevMusicTrack(); scheduleCollapse() }
  const handleNext = () => { nextMusicTrack(); scheduleCollapse() }

  // --- 渲染 ---
  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        fontFamily: CJK_FONT,
        color: 'var(--color-text)',
      }}
    >
      {/* 展开面板 */}
      {expanded && (
        <div
          style={{
            background: 'rgba(44, 24, 16, 0.95)',
            border: '1.5px solid #8b6914',
            borderRadius: 10,
            padding: '14px 18px',
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,134,11,0.2)',
            animation: 'fadeIn 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontFamily: CJK_FONT,
          }}
        >
          {/* 曲目名 */}
          <div
            style={{
              fontSize: 14,
              color: '#daa520',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: 1,
              fontFamily: CJK_FONT,
              fontWeight: 500,
            }}
          >
            {currentTrack.name}
          </div>

          {/* 控制按钮行 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <button onClick={handlePrev} disabled={musicTracks.length <= 1} style={ctrlBtn(musicTracks.length <= 1)}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button onClick={handleTogglePlay} title={musicPlaying ? '暂停' : '播放'} style={playBtn}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                {musicPlaying
                  ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  : <path d="M8 5v14l11-7z"/>
                }
              </svg>
            </button>

            <button onClick={handleNext} disabled={musicTracks.length <= 1} style={ctrlBtn(musicTracks.length <= 1)}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <button onClick={handleToggleMute} style={ctrlBtn(false)}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                {musicMuted || effectiveVolume === 0
                  ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                }
              </svg>
            </button>
          </div>

          {/* 音量滑块 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="#8b6914" style={{ flexShrink: 0 }}>
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effectiveVolume}
              onChange={handleVolumeChange}
              onMouseUp={() => scheduleCollapse()}
              style={{
                flex: 1,
                height: 4,
                WebkitAppearance: 'none',
                appearance: 'none',
                background: `linear-gradient(90deg, #b8860b ${effectiveVolume * 100}%, rgba(139,105,20,0.3) ${effectiveVolume * 100}%)`,
                borderRadius: 2,
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#daa520" style={{ flexShrink: 0 }}>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </div>

          {/* 音量百分比 */}
          <div style={{ fontSize: 12, color: '#8b6914', textAlign: 'center', fontFamily: CJK_FONT }}>
            {Math.round(effectiveVolume * 100)}%
          </div>
        </div>
      )}

      {/* 主悬浮按钮 */}
      <button
        onClick={handleToggleExpand}
        title="背景音乐"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${expanded ? '#daa520' : '#8b6914'}`,
          background: expanded ? 'rgba(44, 24, 16, 0.95)' : 'rgba(44, 24, 16, 0.8)',
          color: musicPlaying ? '#daa520' : '#8b6914',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: musicPlaying
            ? '0 0 12px rgba(218, 165, 32, 0.3), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 2px 8px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease',
          animation: musicPlaying ? 'pulse-glow 3s ease-in-out infinite' : 'none',
          zIndex: 501,
          fontFamily: CJK_FONT,
        }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          {musicMuted
            ? <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            : <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          }
        </svg>
      </button>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(218,165,32,0.2), 0 2px 8px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 18px rgba(218,165,32,0.4), 0 2px 8px rgba(0,0,0,0.4); }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #daa520; border: 2px solid #8b6914;
          cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #b8860b; transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #daa520; border: 2px solid #8b6914; cursor: pointer;
        }
      `}</style>
    </div>,
    document.body,
  )
}

// --- 按钮样式 ---
const ctrlBtn = (disabled: boolean): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: '50%',
  border: '1px solid rgba(139,105,20,0.4)',
  background: 'transparent',
  color: disabled ? 'rgba(139,105,20,0.3)' : '#8b6914',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  transition: 'all 0.2s ease',
  padding: 0,
})

const playBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%',
  border: '2px solid #b8860b',
  background: 'rgba(184,134,11,0.15)',
  color: '#b8860b',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.2s ease',
  padding: 0,
}
