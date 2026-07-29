// ========================================
// 世界OC编辑器 - 主应用组件
// ========================================

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Book } from '@/components/Book/Book'
import { BookCover } from '@/components/Book/BookCover'
import { BookPage } from '@/components/Book/BookPage'
import { WorldLibrary } from '@/components/WorldLibrary/WorldLibrary'
import { WorldDirectory } from '@/components/Layout/WorldDirectory'
import { SearchPage } from '@/components/Common/SearchPage'
import { ChroniclePage } from '@/components/Chronicle/ChroniclePage'
import { MapPage } from '@/components/Map/MapPage'
import { MapHome } from '@/components/Map/MapHome'
import { MapAtlas } from '@/components/Map/MapAtlas'
import { LandmarkLibrary } from '@/components/Map/LandmarkLibrary'
import { CharacterList } from '@/components/Character/CharacterList'
import { CharacterGraphPage } from '@/components/Character/CharacterGraphPage'
import { TagManagementPage } from '@/components/Character/TagManagementPage'
import { CharacterHome } from '@/components/Character/CharacterHome'
import { ItemHome } from '@/components/Item/ItemHome'
import { ItemList } from '@/components/Item/ItemList'
import { SynthesisGraphPage } from '@/components/Item/SynthesisGraphPage'
import { ItemTagManagementPage } from '@/components/Item/ItemTagManagementPage'
import { MonsterHome } from '@/components/Monster/MonsterHome'
import { MonsterList } from '@/components/Monster/MonsterList'
import { MonsterTagManagementPage } from '@/components/Monster/MonsterTagManagementPage'
import { LibraryPage } from '@/components/Library/LibraryPage'
import { MusicPlayer } from '@/components/MusicPlayer/MusicPlayer'
import { TitleBar } from '@/components/Layout/TitleBar'

export default function App() {
  const currentView = useAppStore((s) => s.currentView)
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const fontFamily = useAppStore((s) => s.fontFamily)
  // 如果已有数据（非首次使用），直接跳过封面进入已翻开状态
  const hasExistingWorlds = useAppStore.getState().worlds.length > 0
  const [bookOpened, setBookOpened] = useState(hasExistingWorlds)
  const [isAnimating, setIsAnimating] = useState(false)

  // 全局字体：设置 CSS 变量 --app-font 到 :root，html 读取该变量，所有子元素自然继承
  useEffect(() => {
    const fontMap: Record<string, string> = {
      heiti: 'var(--font-heiti)',
      songti: 'var(--font-songti)',
      kaiti: 'var(--font-kaiti)',
      huati: 'var(--font-huati)',
    }
    document.documentElement.style.setProperty('--app-font', fontMap[fontFamily] || fontMap.heiti)
  }, [fontFamily])

  useEffect(() => {
    if (!bookOpened && currentView !== 'home') {
      setBookOpened(true)
    }
  }, [currentView])

  const handleBookOpen = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setBookOpened(true)
      setIsAnimating(false)
    }, 1200)
  }

  const handleBookClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setBookOpened(false)
      setIsAnimating(false)
    }, 1200)
  }

  if (currentView === 'search') {
    return (
      <div className={`font-${fontFamily}`} style={{ width: '100%', height: '100%', paddingTop: 32 }}>
        <TitleBar />
        <SearchPage />
      </div>
    )
  }

  const chronicleViews = ['chronicle', 'map', 'landmarkLibrary', 'characterList', 'characterGraph', 'tagManagement', 'itemList', 'itemTagManagement', 'synthesisGraph', 'monsterList', 'monsterTagManagement', 'library'] as string[]
  const isUnified = chronicleViews.includes(currentView)

  return (
    <div className={`font-${fontFamily}`} style={{ width: '100%', height: '100%', paddingTop: 32 }}>
      <TitleBar />
      {!bookOpened ? (
        <BookCover onOpen={handleBookOpen} animating={isAnimating} />
      ) : (
        <Book animating={isAnimating} unified={isUnified}>
          {!isUnified && (
            <BookPage side="left">
              {!currentWorldId ? (
                <WorldLibrary onCloseBook={handleBookClose} />
              ) : (
                <WorldDirectory />
              )}
            </BookPage>
          )}
          <BookPage side={isUnified ? 'unified' : 'right'}>
            <RightPageContent />
          </BookPage>
        </Book>
      )}
      <MusicPlayer />
    </div>
  )
}

function RightPageContent() {
  const currentView = useAppStore((s) => s.currentView)

  switch (currentView) {
    case 'home':
    case 'worldList':
      return <WelcomePage />
    case 'worldDetail':
      return <WorldDetailHome />
    case 'mapAtlas':
      return <MapAtlas />
    case 'mapHome':
      return <MapHome />
    case 'landmarkLibrary':
      return <LandmarkLibrary />
    case 'characterHome':
      return <CharacterHome />
    case 'itemHome':
      return <ItemHome />
    case 'itemList':
      return <ItemList />
    case 'synthesisGraph':
      return <SynthesisGraphPage />
    case 'monsterHome':
      return <MonsterHome />
    case 'monsterList':
      return <MonsterList />
    case 'monsterTagManagement':
      return <MonsterTagManagementPage />
    case 'characterList':
      return <CharacterList />
    case 'characterGraph':
      return <CharacterGraphPage />
    case 'tagManagement':
      return <TagManagementPage />
    case 'itemTagManagement':
      return <ItemTagManagementPage />
    case 'map':
      return <MapPage />
    case 'library':
      return <LibraryPage />
    case 'chronicle':
      return <ChroniclePage />
    default:
      return <PlaceholderPage view={currentView} />
  }
}

function WelcomePage() {
  const worlds = useAppStore((s) => s.worlds)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '60px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '48px',
        color: 'var(--color-gold)',
        marginBottom: '16px',
      }}>
        ◈
      </div>
      <h1 style={{
        fontSize: '28px',
        marginBottom: '12px',
        color: 'var(--color-gold-dark)',
        letterSpacing: '4px',
      }}>
        世界OC编辑器
      </h1>
      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-light)',
        maxWidth: '400px',
        lineHeight: '1.8',
      }}>
        {worlds.length === 0
          ? '欢迎使用世界OC编辑器。\n请先在左侧创建您的第一个世界。'
          : '请从左侧选择一个世界开始您的创作之旅。'}
      </p>
    </div>
  )
}

function WorldDetailHome() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '60px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '48px',
        color: 'var(--color-gold)',
        marginBottom: '16px',
      }}>
        ✦
      </div>
      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-light)',
        lineHeight: '1.8',
      }}>
        从左侧目录选择一个功能开始
      </p>
    </div>
  )
}

function PlaceholderPage({ view }: { view: string }) {
  const labels: Record<string, string> = {
    chronicle: '世界编年史',
    map: '世界地图',
    characterList: '人物库',
    characterGraph: '人物图谱',
    synthesisGraph: '合成列表',
    monsterList: '怪物集',
    tagManagement: '标签管理',
    library: '图书馆',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '60px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '16px', color: 'var(--color-text-light)' }}>
        {labels[view] || view} - 即将开放
      </p>
    </div>
  )
}
