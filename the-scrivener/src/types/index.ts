// ========================================
// 世界OC编辑器 - 核心类型定义
// ========================================

export type FontFamily = 'heiti' | 'songti' | 'kaiti' | 'huati'

export interface World {
  id: string
  name: string
  createdAt: string
  fontFamily: FontFamily
  icon?: string
}

export interface Tag {
  id: string
  name: string
  color: string
  type: 'character' | 'landmark' | 'region' | 'item' | 'era' | 'mapHome' | 'mapAtlas' | 'chronicle' | 'custom'
  worldId: string
}

export interface TimelineNode {
  id: string
  worldId: string
  eventName: string
  eventTime: string
  eventContent: string
  color: string
  position: number // vertical position on timeline
  parentId?: string // if it's a branch node, this is the parent time node
  branchOffset?: { x: number; y: number } // branch position offset from parent
  eraId?: string
}

export interface Era {
  id: string
  worldId: string
  name: string
  color: string
  nodeIds: string[]
}

export interface Landmark {
  id: string
  worldId: string
  name: string
  type: 'capital' | 'city' | 'village' | 'tribe' | 'port' | 'forest' | 'lake' | 'mountain' | 'ruins' | 'cave' | 'desert' | 'glacier' | 'swamp' | 'plains' | 'volcano' | 'isle'
  icon?: string
  region?: string
  color: string
  size: number
  x: number
  y: number
  description?: string
  /** 每个地图上的坐标；key = mapId，空 key '' = 文库自有坐标 */
  positions?: Record<string, { x: number; y: number }>
}

export interface MapRegion {
  id: string
  worldId: string
  mapId: string
  name: string
  belonging?: string
  color: string
  borderWidth: number
  pathPoints: { x: number; y: number }[]
  centerX: number
  centerY: number
}

export interface WorldMap {
  id: string
  worldId: string
  dimensionName: string
  backgroundImage?: string // base64 data URL
  backgroundScale: number
  landmarks: Landmark[]
  regions: MapRegion[]
}

export interface CharacterTag {
  id: string
  name: string
  color: string
  worldId: string
}

export interface Character {
  id: string
  worldId: string
  name: string
  identity?: string
  race?: string
  birthplace?: string
  age?: string
  birthDate?: string
  power?: string
  title?: string
  icon?: string
  tags: CharacterTag[]
  description?: string
}

export interface CharacterRelation {
  id: string
  graphId: string
  sourceId: string
  targetId: string
  type: 'line' | 'rightAngle'
  direction: 'oneWay' | 'twoWay'
  color?: string
  text?: string
}

export interface CharacterGraph {
  id: string
  worldId: string
  name: string
  color: string
  characterIds: string[]
  relations: CharacterRelation[]
}

export interface ItemTag {
  id: string
  name: string
  color: string
  worldId: string
}

export interface Item {
  id: string
  worldId: string
  name: string
  icon?: string
  tags: ItemTag[]
  description?: string
  attributes?: Record<string, string>
}

export interface MonsterTag {
  id: string
  name: string
  color: string
  worldId: string
}

export interface Monster {
  id: string
  worldId: string
  name: string
  race?: string
  level?: string
  habitat?: string
  icon?: string
  tags: MonsterTag[]
  description?: string
  attributes?: Record<string, string>
}

export interface SynthesisGraph {
  id: string
  worldId: string
  name: string
  color: string
  itemIds: string[]
  relations: {
    id: string
    sourceId: string
    targetId: string
    type: 'line' | 'rightAngle'
    direction: 'oneWay' | 'twoWay'
    text?: string
  }[]
}

export interface LibraryDoc {
  id: string
  worldId: string
  title: string
  author?: string
  content: string
  cover?: string
  createdAt: string
  updatedAt: string
}

export type PageView =
  | 'home'
  | 'worldList'
  | 'worldDetail'
  | 'mapHome' | 'mapAtlas' | 'chronicle'
  | 'map'
  | 'characterHome'
  | 'characterList'
  | 'itemHome'
  | 'monsterHome'
  | 'monsterList'
  | 'monsterTagManagement'
  | 'characterGraph'
  | 'itemList'
  | 'synthesisGraph'
  | 'search'
  | 'landmarkLibrary'
  | 'tagManagement'
  | 'itemTagManagement'
  | 'mapRegionEdit'
  | 'landmarkEdit'
  | 'createWorld'
  | 'createMap'
  | 'createCharacterGraph'
  | 'createSynthesisGraph'
  | 'library'

export interface NavigationState {
  currentView: PageView
  worldId: string | null
  previousViews: PageView[]
  breadcrumbs: { view: PageView; label: string }[]
}
