// ========================================
// 世界OC编辑器 - 应用主状态管理 (Zustand)
// ========================================

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  World,
  FontFamily,
  Tag,
  PageView,
  NavigationState,
  TimelineNode,
  Era,
  Landmark,
  MapRegion,
  WorldMap,
  CharacterTag,
  Character,
  CharacterGraph,
  CharacterRelation,
  ItemTag,
  Item,
  SynthesisGraph,
  MonsterTag,
  Monster,
  LibraryDoc,
} from '@/types'

// ========================================
// 本地持久化工具
// ========================================

const STORAGE_KEY = 'world-oc-editor-data'

function loadData(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return null
}

function saveData(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

// ========================================
// 状态接口
// ========================================

interface AppState {
  // 世界
  worlds: World[]
  currentWorldId: string | null
  fontFamily: FontFamily

  // 导航
  currentView: PageView
  previousViews: PageView[]
  breadcrumbs: { view: PageView; label: string }[]

  // 编年史
  timelineNodes: TimelineNode[]
  eras: Era[]

  // 地图
  maps: WorldMap[]
  currentMapId: string | null
  landmarks: Landmark[]
  regions: MapRegion[]

  // 人物
  characterTags: CharacterTag[]
  characters: Character[]
  characterGraphs: CharacterGraph[]
  characterRelations: CharacterRelation[]
  currentCharacterGraphId: string | null

  // 物品
  itemTags: ItemTag[]
  items: Item[]
  synthesisGraphs: SynthesisGraph[]
  currentSynthesisGraphId: string | null

  // 怪物
  monsterTags: MonsterTag[]
  monsters: Monster[]

  // 图书馆
  libraryDocs: LibraryDoc[]

  // 背景音乐
  musicVolume: number
  musicMuted: boolean
  musicPlaying: boolean
  musicTrackIndex: number

  // 标签
  tags: Tag[]

  // === 世界操作 ===
  createWorld: (name: string) => void
  renameWorld: (id: string, name: string) => void
  updateWorld: (id: string, updates: Partial<World>) => void
  deleteWorld: (id: string) => void
  enterWorld: (id: string) => void
  leaveWorld: () => void
  setFontFamily: (font: FontFamily) => void

  // === 导航操作 ===
  navigateTo: (view: PageView, label?: string) => void
  goBack: () => void
  canGoBack: () => boolean

  // === 标签操作 ===
  getTag: (name: string, worldId: string) => Tag | undefined
  getOrCreateTag: (name: string, worldId: string, type: Tag['type'], color?: string) => Tag
  updateTag: (tagId: string, updates: Partial<Tag>) => void
  getContentByTag: (tagName: string, worldId: string) => TaggedContent[]

  // === 编年史操作 ===
  addTimelineNode: (node: Omit<TimelineNode, 'id'>) => void
  updateTimelineNode: (id: string, updates: Partial<TimelineNode>) => void
  deleteTimelineNode: (id: string) => void
  addEra: (era: Omit<Era, 'id'>) => void
  updateEra: (id: string, updates: Partial<Era>) => void
  deleteEra: (id: string) => void

  // === 地图操作 ===
  addMap: (dimensionName: string, worldId: string) => WorldMap
  updateMap: (id: string, updates: Partial<WorldMap>) => void
  deleteMap: (id: string) => void
  setCurrentMap: (id: string | null) => void
  addLandmark: (landmark: Omit<Landmark, 'id'>) => void
  updateLandmark: (id: string, updates: Partial<Landmark>) => void
  deleteLandmark: (id: string) => void
  addRegion: (region: Omit<MapRegion, 'id'>) => void
  updateRegion: (id: string, updates: Partial<MapRegion>) => void
  deleteRegion: (id: string) => void

  // === 人物操作 ===
  addCharacterTag: (tag: Omit<CharacterTag, 'id'>) => void
  updateCharacterTag: (id: string, updates: Partial<CharacterTag>) => void
  deleteCharacterTag: (id: string) => void
  addCharacter: (character: Omit<Character, 'id'>) => Character
  updateCharacter: (id: string, updates: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  addCharacterGraph: (name: string, color: string) => CharacterGraph
  updateCharacterGraph: (id: string, updates: Partial<CharacterGraph>) => void
  deleteCharacterGraph: (id: string) => void
  setCurrentCharacterGraph: (id: string | null) => void
  addCharacterRelation: (relation: Omit<CharacterRelation, 'id'>) => void
  updateCharacterRelation: (id: string, updates: Partial<CharacterRelation>) => void
  deleteCharacterRelation: (id: string) => void

  // === 物品操作 ===
  addItemTag: (tag: Omit<ItemTag, 'id'>) => void
  updateItemTag: (id: string, updates: Partial<ItemTag>) => void
  deleteItemTag: (id: string) => void
  addItem: (item: Omit<Item, 'id'>) => Item
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
  addSynthesisGraph: (name: string, color: string) => SynthesisGraph
  updateSynthesisGraph: (id: string, updates: Partial<SynthesisGraph>) => void
  deleteSynthesisGraph: (id: string) => void
  setCurrentSynthesisGraph: (id: string | null) => void

  // === 怪物操作 ===
  addMonsterTag: (tag: Omit<MonsterTag, 'id'>) => void
  updateMonsterTag: (id: string, updates: Partial<MonsterTag>) => void
  deleteMonsterTag: (id: string) => void
  addMonster: (monster: Omit<Monster, 'id'>) => Monster
  updateMonster: (id: string, updates: Partial<Monster>) => void
  deleteMonster: (id: string) => void

  // === 图书馆操作 ===
  addLibraryDoc: (doc: Omit<LibraryDoc, 'id' | 'createdAt' | 'updatedAt'>) => LibraryDoc
  updateLibraryDoc: (id: string, updates: Partial<LibraryDoc>) => void
  deleteLibraryDoc: (id: string) => void

  // === 背景音乐操作 ===
  setMusicVolume: (volume: number) => void
  toggleMusicMuted: () => void
  setMusicPlaying: (playing: boolean) => void
  nextMusicTrack: () => void
  prevMusicTrack: () => void
}

interface TaggedContent {
  type: string
  id: string
  text: string
  source: string
  sourceId: string
}

// ========================================
// Store 实现
// ========================================

export const useAppStore = create<AppState>((set, get) => {
  const loaded = loadData()
  const fallback: Partial<AppState> = {
    worlds: [],
    currentWorldId: null,
    fontFamily: 'heiti',
    currentView: 'home',
    previousViews: [],
    breadcrumbs: [],
    timelineNodes: [],
    eras: [],
    maps: [],
    currentMapId: null,
    landmarks: [],
    regions: [],
    characterTags: [],
    characters: [],
    characterGraphs: [],
    characterRelations: [],
    currentCharacterGraphId: null,
    itemTags: [],
    items: [],
    synthesisGraphs: [],
    currentSynthesisGraphId: null,
    monsterTags: [],
    monsters: [],
    libraryDocs: [],
    musicVolume: 0.5,
    musicMuted: false,
    musicPlaying: true,
    musicTrackIndex: 0,
    tags: [],
  }
  const initial: Partial<AppState> = loaded ? { ...fallback, ...loaded } : { ...fallback }

  const persist = () => saveData(get() as AppState)

  return {
    ...initial as AppState,

    // === 世界操作 ===
    createWorld: (name) => {
      set((s) => ({
        worlds: [...s.worlds, { id: uuidv4(), name, createdAt: new Date().toISOString(), fontFamily: 'heiti' }],
      }))
      persist()
    },
    renameWorld: (id, name) => {
      set((s) => ({
        worlds: s.worlds.map((w) => (w.id === id ? { ...w, name } : w)),
      }))
      persist()
    },
    updateWorld: (id, updates) => {
      set((s) => ({
        worlds: s.worlds.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      }))
      persist()
    },
    deleteWorld: (id) => {
      set((s) => ({
        worlds: s.worlds.filter((w) => w.id !== id),
        tags: s.tags.filter((t) => t.worldId !== id),
        timelineNodes: s.timelineNodes.filter((n) => n.worldId !== id),
        eras: s.eras.filter((e) => e.worldId !== id),
        maps: s.maps.filter((m) => m.worldId !== id),
        landmarks: s.landmarks.filter((l) => l.worldId !== id),
        regions: s.regions.filter((r) => r.worldId !== id),
        characterTags: s.characterTags.filter((t) => t.worldId !== id),
        characters: s.characters.filter((c) => c.worldId !== id),
        characterGraphs: s.characterGraphs.filter((g) => g.worldId !== id),
        itemTags: s.itemTags.filter((t) => t.worldId !== id),
        items: s.items.filter((i) => i.worldId !== id),
        synthesisGraphs: s.synthesisGraphs.filter((g) => g.worldId !== id),
        monsterTags: s.monsterTags.filter((t) => t.worldId !== id),
        monsters: s.monsters.filter((m) => m.worldId !== id),
        libraryDocs: s.libraryDocs.filter((d) => d.worldId !== id),
      }))
      persist()
    },
    enterWorld: (id) => {
      const world = get().worlds.find((w) => w.id === id)
      set((s) => ({
        currentWorldId: id,
        currentView: 'worldDetail',

        previousViews: [...s.previousViews, s.currentView],
        breadcrumbs: [...s.breadcrumbs, { view: 'worldDetail' as PageView, label: world?.name || '' }],
      }))
    },
    leaveWorld: () => {
      set({ currentWorldId: null, currentView: 'home', previousViews: [], breadcrumbs: [] })
    },
    setFontFamily: (font) => {
      set((s) => ({
        fontFamily: font,
        worlds: s.currentWorldId
          ? s.worlds.map((w) => (w.id === s.currentWorldId ? { ...w, fontFamily: font } : w))
          : s.worlds,
      }))
      persist()
    },

    // === 导航 ===
    navigateTo: (view, label) => {
      set((s) => ({
        previousViews: [...s.previousViews, s.currentView],
        breadcrumbs: label
          ? [...s.breadcrumbs, { view, label }]
          : s.breadcrumbs,
        currentView: view,
      }))
    },
    goBack: () => {
      set((s) => {
        const prev = s.previousViews.slice()
        const prevView = prev.pop()
        const crumbs = s.breadcrumbs.slice(0, -1)
        return {
          currentView: prevView || 'home',
          previousViews: prev,
          breadcrumbs: crumbs,
        }
      })
    },
    canGoBack: () => get().previousViews.length > 0,

    // === 标签操作 ===
    getTag: (name, worldId) => {
      return get().tags.find((t) => t.name === name && t.worldId === worldId)
    },
    getOrCreateTag: (name, worldId, type, color) => {
      const existing = get().tags.find((t) => t.name === name && t.worldId === worldId)
      if (existing) return existing
      const newTag: Tag = {
        id: uuidv4(),
        name,
        worldId,
        type,
        color: color || '#8B7355',
      }
      set((s) => ({ tags: [...s.tags, newTag] }))
      persist()
      return newTag
    },
    updateTag: (tagId, updates) => {
      set((s) => ({
        tags: s.tags.map((t) => (t.id === tagId ? { ...t, ...updates } : t)),
      }))
      persist()
    },
    getContentByTag: (tagName, worldId) => {
      const results: TaggedContent[] = []
      const state = get()

      // 搜索编年史节点
      state.timelineNodes
        .filter((n) => n.worldId === worldId && (n.eventName === tagName || n.eventContent?.includes(tagName)))
        .forEach((n) => results.push({ type: 'chronicle', id: n.id, text: n.eventName, source: '世界编年史', sourceId: n.id }))

      // 搜索地标
      state.landmarks
        .filter((l) => l.worldId === worldId && l.name === tagName)
        .forEach((l) => results.push({ type: 'landmark', id: l.id, text: l.name, source: '世界地图', sourceId: '' }))

      // 搜索地区
      state.regions
        .filter((r) => r.worldId === worldId && r.name === tagName)
        .forEach((r) => results.push({ type: 'region', id: r.id, text: r.name, source: '世界地图', sourceId: r.mapId }))

      // 搜索人物
      state.characters
        .filter((c) => c.worldId === worldId && c.name === tagName)
        .forEach((c) => results.push({ type: 'character', id: c.id, text: c.name, source: '人物库', sourceId: c.id }))

      // 搜索物品
      state.items
        .filter((i) => i.worldId === worldId && i.name === tagName)
        .forEach((i) => results.push({ type: 'item', id: i.id, text: i.name, source: '物品库', sourceId: i.id }))

      return results
    },

    // === 编年史操作 ===
    addTimelineNode: (node) => {
      const newNode: TimelineNode = { ...node, id: uuidv4() }
      set((s) => ({ timelineNodes: [...s.timelineNodes, newNode] }))
      persist()
    },
    updateTimelineNode: (id, updates) => {
      set((s) => ({ timelineNodes: s.timelineNodes.map((n) => (n.id === id ? { ...n, ...updates } : n)) }))
      persist()
    },
    deleteTimelineNode: (id) => {
      set((s) => ({
        timelineNodes: s.timelineNodes.filter((n) => n.id !== id && n.parentId !== id),
      }))
      persist()
    },
    addEra: (era) => {
      const newEra: Era = { ...era, id: uuidv4() }
      set((s) => ({
        eras: [...s.eras, newEra],
        timelineNodes: s.timelineNodes.map((n) =>
          era.nodeIds.includes(n.id) ? { ...n, eraId: newEra.id, color: newEra.color } : n
        ),
      }))
      persist()
    },
    updateEra: (id, updates) => {
      set((s) => {
        const updatedEras = s.eras.map((e) => (e.id === id ? { ...e, ...updates } : e))
        const era = updatedEras.find((e) => e.id === id)
        if (era && updates.color) {
          return {
            eras: updatedEras,
            timelineNodes: s.timelineNodes.map((n) =>
              n.eraId === id ? { ...n, color: updates.color! } : n
            ),
          }
        }
        return { eras: updatedEras }
      })
      persist()
    },
    deleteEra: (id) => {
      set((s) => ({
        eras: s.eras.filter((e) => e.id !== id),
        timelineNodes: s.timelineNodes.map((n) =>
          n.eraId === id ? { ...n, eraId: undefined, color: '#8B7355' } : n
        ),
      }))
      persist()
    },

    // === 地图 ===
    addMap: (dimensionName, worldId) => {
      const newMap: WorldMap = {
        id: uuidv4(),
        worldId,
        dimensionName,
        backgroundScale: 1,
        landmarks: [],
        regions: [],
      }
      set((s) => ({ maps: [...s.maps, newMap], currentMapId: newMap.id }))
      persist()
      return newMap
    },
    updateMap: (id, updates) => {
      set((s) => ({ maps: s.maps.map((m) => (m.id === id ? { ...m, ...updates } : m)) }))
      persist()
    },
    deleteMap: (id) => {
      set((s) => ({
        maps: s.maps.filter((m) => m.id !== id),
        landmarks: s.landmarks.filter((l) => !l.positions || !l.positions[id]),
        regions: s.regions.filter((r) => r.mapId !== id),
      }))
      persist()
    },
    setCurrentMap: (id) => set({ currentMapId: id }),

    addLandmark: (landmark) => {
      if (!landmark.name.trim()) return
      const worldId = landmark.worldId
      const existing = get().landmarks.find((l) => l.name === landmark.name && l.worldId === worldId)
      // ═══ 名称唯一：复用已有记录 ═══
      if (existing) {
        let color = existing.color
        if (landmark.region) {
          const mr = get().regions.find((r) => r.name === landmark.region && r.worldId === worldId)
          if (mr) color = mr.color
        }
        // 合并属性 + 位置
        const mergedPositions = { ...(existing.positions || {}), ...(landmark.positions || {}) }
        const merged: Landmark = {
          ...existing,
          type: landmark.type || existing.type,
          icon: landmark.icon !== undefined ? landmark.icon : existing.icon,
          description: landmark.description !== undefined ? landmark.description : existing.description,
          region: landmark.region !== undefined ? landmark.region : existing.region,
          size: landmark.size !== undefined ? landmark.size : existing.size,
          color,
          positions: mergedPositions,
        }
        set((s) => ({
          landmarks: s.landmarks.map((l) => l.id === existing.id ? merged : l),
        }))
        get().getOrCreateTag(landmark.name, worldId, 'landmark', color)
        persist()
        return
      }
      // ═══ 全新地标 ═══
      let color = landmark.color
      if (landmark.region) {
        const mr = get().regions.find((r) => r.name === landmark.region && r.worldId === worldId)
        if (mr) color = mr.color
      }
      const newLandmark: Landmark = { ...landmark, color, id: uuidv4() }
      set((s) => ({ landmarks: [...s.landmarks, newLandmark] }))
      get().getOrCreateTag(landmark.name, worldId, 'landmark', color)
      persist()
    },
    updateLandmark: (id, updates) => {
      const old = get().landmarks.find((l) => l.id === id)
      if (!old) return
      // region → color sync
      const newRegion = updates.region ?? old.region
      let resolvedUpdates = { ...updates }
      if (newRegion) {
        const matchedRegion = get().regions.find((r) => r.name === newRegion && r.worldId === old.worldId)
        if (matchedRegion) resolvedUpdates = { ...updates, color: matchedRegion.color }
      }
      // 更新全局 landmark
      set((s) => ({
        landmarks: s.landmarks.map((l) => l.id === id ? { ...l, ...resolvedUpdates } : l),
      }))
      // 同步到 maps[].landmarks（引用同一个 ID）
      set((s) => ({
        maps: s.maps.map((m) => ({
          ...m,
          landmarks: m.landmarks.map((l) => l.id === id ? { ...l, ...resolvedUpdates } : l),
        })),
      }))
      // 改名的标签同步
      if (updates.name && updates.name !== old.name) {
        const tag = get().tags.find((t) => t.name === old.name && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { name: updates.name })
      }
      if (resolvedUpdates.color !== undefined && resolvedUpdates.color !== old.color) {
        const tag = get().tags.find((t) => t.name === (updates.name || old.name) && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { color: resolvedUpdates.color })
      }
      persist()
    },
    deleteLandmark: (id) => {
      set((s) => ({
        landmarks: s.landmarks.filter((l) => l.id !== id),
        maps: s.maps.map((m) => ({
          ...m,
          landmarks: m.landmarks.filter((l) => l.id !== id),
        })),
      }))
      persist()
    },
    addRegion: (region) => {
      const newRegion: MapRegion = { ...region, id: uuidv4() }
      set((s) => ({
        regions: [...s.regions, newRegion],
        maps: s.maps.map((m) =>
          m.id === region.mapId ? { ...m, regions: [...m.regions, newRegion] } : m
        ),
      }))
      // 自动创建标签
      get().getOrCreateTag(region.name, region.worldId, 'region', region.color)
      // 同步已存在的地标：region 字段匹配则更新颜色
      const anyMatching = get().landmarks.some((l) => l.region === region.name && l.worldId === region.worldId)
      if (anyMatching) {
        set((s) => ({
          landmarks: s.landmarks.map((l) =>
            l.region === region.name && l.worldId === region.worldId && l.positions && l.positions[region.mapId]
              ? { ...l, color: region.color }
              : l
          ),
          maps: s.maps.map((m) =>
            m.id === region.mapId ? {
              ...m,
              landmarks: m.landmarks.map((l) =>
                l.region === region.name && l.worldId === region.worldId
                  ? { ...l, color: region.color }
                  : l
              ),
            } : m
          ),
        }))
      }
      persist()
    },
    updateRegion: (id, updates) => {
      const old = get().regions.find((r) => r.id === id)
      set((s) => ({
        regions: s.regions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        maps: s.maps.map((m) => ({
          ...m,
          regions: m.regions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      }))
      // 同步标签
      if (updates.name && old && updates.name !== old.name) {
        const tag = get().tags.find((t) => t.name === old.name && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { name: updates.name })
      }
      if (updates.color && old) {
        const tag = get().tags.find((t) => t.name === old.name && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { color: updates.color })
      }
      // ═══ 区域↔地标颜色联动 ═══
      if (old) {
        const oldName = old.name
        const newName = (updates.name ?? oldName) as string
        const newColor = updates.color ?? old.color
        const colorChanged = updates.color !== undefined && updates.color !== old.color
        const nameChanged = updates.name !== undefined && updates.name !== old.name
        if (colorChanged || nameChanged) {
          set((s) => ({
            landmarks: s.landmarks.map((l) => {
              if (l.worldId !== old.worldId) return l
              // 地区改名：更新关联地标的 region 字段
              if (nameChanged && l.region === oldName) return { ...l, region: newName, color: newColor }
              // 地区改色：仅更新颜色
              if (colorChanged && l.region === newName) return { ...l, color: newColor }
              return l
            }),
            maps: s.maps.map((m) => ({
              ...m,
              landmarks: m.landmarks.map((l) => {
                if (l.worldId !== old.worldId) return l
                if (nameChanged && l.region === oldName) return { ...l, region: newName, color: newColor }
                if (colorChanged && l.region === newName) return { ...l, color: newColor }
                return l
              }),
            })),
          }))
        }
      }
      persist()
    },
    deleteRegion: (id) => {
      set((s) => ({
        regions: s.regions.filter((r) => r.id !== id),
        maps: s.maps.map((m) => ({
          ...m,
          regions: m.regions.filter((r) => r.id !== id),
        })),
      }))
      persist()
    },

    // === 人物 ===
    addCharacterTag: (tag) => {
      const existing = get().characterTags.find((t) => t.name === tag.name && t.worldId === tag.worldId)
      const newTag: CharacterTag = { ...tag, id: uuidv4() }
      if (existing) {
        set((s) => ({ characterTags: s.characterTags.map((t) => (t.id === existing.id ? { ...existing, color: existing.color } : t)) }))
      } else {
        set((s) => ({ characterTags: [...s.characterTags, newTag] }))
      }
      persist()
    },
    updateCharacterTag: (id, updates) => {
      const oldTag = get().characterTags.find((t) => t.id === id)
      set((s) => ({
        characterTags: s.characterTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),

      }))
      if (updates.color && oldTag) {
        set((s) => ({
          characters: s.characters.map((c) => ({
            ...c,
            tags: c.tags.map((t) => (t.name === oldTag.name ? { ...t, color: updates.color! } : t)),
          })),
        }))
      }
      if (updates.name && oldTag) {
        set((s) => ({
          characters: s.characters.map((c) => ({
            ...c,
            tags: c.tags.map((t) => (t.name === oldTag.name ? { ...t, name: updates.name! } : t)),
          })),
        }))
      }
      persist()
    },
    deleteCharacterTag: (id) => {
      set((s) => ({
        characterTags: s.characterTags.filter((t) => t.id !== id),
      }))
      persist()
    },
    addCharacter: (character) => {
      const newCharacter: Character = { ...character, id: uuidv4() }
      set((s) => ({ characters: [...s.characters, newCharacter] }))
      // 创建标签
      const tagColor = character.tags[0]?.color || '#000000'
      get().getOrCreateTag(character.name, character.worldId, 'character', tagColor)
      persist()
      return newCharacter
    },
    updateCharacter: (id, updates) => {
      const old = get().characters.find((c) => c.id === id)
      set((s) => ({ characters: s.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)) }))
      // 同步标签
      if (updates.name && old && updates.name !== old.name) {
        const tag = get().tags.find((t) => t.name === old.name && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { name: updates.name })
      }
      persist()
    },
    deleteCharacter: (id) => {
      const char = get().characters.find((c) => c.id === id)
      set((s) => ({
        characters: s.characters.filter((c) => c.id !== id),
        characterGraphs: s.characterGraphs.map((g) => ({
          ...g,
          characterIds: g.characterIds.filter((cid) => cid !== id),
        })),
        characterRelations: s.characterRelations.filter(
          (r) => r.sourceId !== id && r.targetId !== id
        ),
      }))
      persist()
    },
    addCharacterGraph: (name, color) => {
      const worldId = get().currentWorldId!
      const newGraph: CharacterGraph = {
        id: uuidv4(),
        worldId,
        name,
        color,
        characterIds: [],
        relations: [],
      }
      set((s) => ({
        characterGraphs: [...s.characterGraphs, newGraph],
        currentCharacterGraphId: newGraph.id,
      }))
      persist()
      return newGraph
    },
    updateCharacterGraph: (id, updates) => {
      set((s) => ({
        characterGraphs: s.characterGraphs.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      }))
      persist()
    },
    deleteCharacterGraph: (id) => {
      set((s) => ({
        characterGraphs: s.characterGraphs.filter((g) => g.id !== id),
        characterRelations: s.characterRelations.filter((r) => r.graphId !== id),
      }))
      persist()
    },
    setCurrentCharacterGraph: (id) => set({ currentCharacterGraphId: id }),

    addCharacterRelation: (relation) => {
      const newRel: CharacterRelation = { ...relation, id: uuidv4() }
      set((s) => ({
        characterRelations: [...s.characterRelations, newRel],
        characterGraphs: s.characterGraphs.map((g) =>
          g.id === relation.graphId
            ? { ...g, relations: [...g.relations, newRel] }
            : g
        ),
      }))
      persist()
    },
    updateCharacterRelation: (id, updates) => {
      set((s) => ({
        characterRelations: s.characterRelations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        characterGraphs: s.characterGraphs.map((g) => ({
          ...g,
          relations: g.relations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      }))
      persist()
    },
    deleteCharacterRelation: (id) => {
      const rel = get().characterRelations.find((r) => r.id === id)
      set((s) => ({
        characterRelations: s.characterRelations.filter((r) => r.id !== id),
        characterGraphs: s.characterGraphs.map((g) =>
          g.id === rel?.graphId
            ? { ...g, relations: g.relations.filter((r) => r.id !== id) }
            : g
        ),
      }))
      persist()
    },

    // === 物品 ===
    addItemTag: (tag) => {
      const existing = get().itemTags.find((t) => t.name === tag.name && t.worldId === tag.worldId)
      const newTag: ItemTag = { ...tag, id: uuidv4() }
      if (existing) {
        set((s) => ({ itemTags: s.itemTags.map((t) => (t.id === existing.id ? { ...existing, color: existing.color } : t)) }))
      } else {
        set((s) => ({ itemTags: [...s.itemTags, newTag] }))
      }
      persist()
    },
    updateItemTag: (id, updates) => {
      const oldTag = get().itemTags.find((t) => t.id === id)
      set((s) => ({ itemTags: s.itemTags.map((t) => (t.id === id ? { ...t, ...updates } : t)) }))
      if (updates.color && oldTag) {
        set((s) => ({
          items: s.items.map((i) => ({
            ...i,
            tags: i.tags.map((t) => (t.name === oldTag.name ? { ...t, color: updates.color! } : t)),
          })),
        }))
      }
      if (updates.name && oldTag) {
        set((s) => ({
          items: s.items.map((i) => ({
            ...i,
            tags: i.tags.map((t) => (t.name === oldTag.name ? { ...t, name: updates.name! } : t)),
          })),
        }))
      }
      persist()
    },
    deleteItemTag: (id) => {
      set((s) => ({ itemTags: s.itemTags.filter((t) => t.id !== id) }))
      persist()
    },
    addItem: (item) => {
      const newItem: Item = { ...item, id: uuidv4() }
      set((s) => ({ items: [...s.items, newItem] }))
      const tagColor = item.tags[0]?.color || '#000000'
      get().getOrCreateTag(item.name, item.worldId, 'item', tagColor)
      persist()
      return newItem
    },
    updateItem: (id, updates) => {
      const old = get().items.find((i) => i.id === id)
      set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)) }))
      if (updates.name && old && updates.name !== old.name) {
        const tag = get().tags.find((t) => t.name === old.name && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { name: updates.name })
      }
      persist()
    },
    deleteItem: (id) => {
      set((s) => ({
        items: s.items.filter((i) => i.id !== id),
        synthesisGraphs: s.synthesisGraphs.map((g) => ({
          ...g,
          itemIds: g.itemIds.filter((iid) => iid !== id),
        })),
      }))
      persist()
    },
    addSynthesisGraph: (name, color) => {
      const worldId = get().currentWorldId!
      const newGraph: SynthesisGraph = {
        id: uuidv4(),
        worldId,
        name,
        color,
        itemIds: [],
        relations: [],
      }
      set((s) => ({
        synthesisGraphs: [...s.synthesisGraphs, newGraph],
        currentSynthesisGraphId: newGraph.id,
      }))
      persist()
      return newGraph
    },
    updateSynthesisGraph: (id, updates) => {
      set((s) => ({
        synthesisGraphs: s.synthesisGraphs.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      }))
      persist()
    },
    deleteSynthesisGraph: (id) => {
      set((s) => ({
        synthesisGraphs: s.synthesisGraphs.filter((g) => g.id !== id),
      }))
      persist()
    },
    setCurrentSynthesisGraph: (id) => set({ currentSynthesisGraphId: id }),

    // === 怪物操作 ===
    addMonsterTag: (tag) => {
      const existing = get().monsterTags.find((t) => t.name === tag.name && t.worldId === tag.worldId)
      if (existing) return
      const newTag: MonsterTag = { ...tag, id: uuidv4() }
      set((s) => ({ monsterTags: [...s.monsterTags, newTag] }))
      persist()
    },
    updateMonsterTag: (id, updates) => {
      const oldTag = get().monsterTags.find((t) => t.id === id)
      set((s) => ({
        monsterTags: s.monsterTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }))
      if (updates.color && oldTag) {
        set((s) => ({
          monsters: s.monsters.map((m) => ({
            ...m,
            tags: m.tags.map((t) => (t.name === oldTag.name ? { ...t, color: updates.color! } : t)),
          })),
        }))
      }
      if (updates.name && oldTag) {
        set((s) => ({
          monsters: s.monsters.map((m) => ({
            ...m,
            tags: m.tags.map((t) => (t.name === oldTag.name ? { ...t, name: updates.name! } : t)),
          })),
        }))
      }
      persist()
    },
    deleteMonsterTag: (id) => {
      set((s) => ({
        monsterTags: s.monsterTags.filter((t) => t.id !== id),
      }))
      persist()
    },
    addMonster: (monster) => {
      const newMonster: Monster = { ...monster, id: uuidv4() }
      set((s) => ({ monsters: [...s.monsters, newMonster] }))
      const tagColor = monster.tags[0]?.color || '#000000'
      get().getOrCreateTag(monster.name, monster.worldId, 'custom', tagColor)
      persist()
      return newMonster
    },
    updateMonster: (id, updates) => {
      const old = get().monsters.find((m) => m.id === id)
      set((s) => ({ monsters: s.monsters.map((m) => (m.id === id ? { ...m, ...updates } : m)) }))
      if (updates.name && old && updates.name !== old.name) {
        const tag = get().tags.find((t) => t.name === old.name && t.worldId === old.worldId)
        if (tag) get().updateTag(tag.id, { name: updates.name })
      }
      persist()
    },
    deleteMonster: (id) => {
      set((s) => ({
        monsters: s.monsters.filter((m) => m.id !== id),
      }))
      persist()
    },

    // === 图书馆操作 ===
    addLibraryDoc: (doc) => {
      const now = new Date().toISOString()
      const newDoc: LibraryDoc = { ...doc, id: uuidv4(), createdAt: now, updatedAt: now }
      set((s) => ({ libraryDocs: [...s.libraryDocs, newDoc] }))
      persist()
      return newDoc
    },
    updateLibraryDoc: (id, updates) => {
      set((s) => ({
        libraryDocs: s.libraryDocs.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)),
      }))
      persist()
    },
    deleteLibraryDoc: (id) => {
      set((s) => ({
        libraryDocs: s.libraryDocs.filter((d) => d.id !== id),
      }))
      persist()
    },

    // === 背景音乐 ===
    setMusicVolume: (volume) => {
      set({ musicVolume: Math.max(0, Math.min(1, volume)) })
      persist()
    },
    toggleMusicMuted: () => {
      set((s) => ({ musicMuted: !s.musicMuted }))
      persist()
    },
    setMusicPlaying: (playing) => {
      set({ musicPlaying: playing })
      persist()
    },
    nextMusicTrack: () => {
      set((s) => ({ musicTrackIndex: s.musicTrackIndex + 1 }))
      persist()
    },
    prevMusicTrack: () => {
      set((s) => ({ musicTrackIndex: s.musicTrackIndex - 1 }))
      persist()
    },
  }
})
