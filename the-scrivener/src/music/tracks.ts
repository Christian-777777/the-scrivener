// ========================================
// 背景音乐曲目配置
// 音频文件放在 public/music/ 目录下
// ========================================

export interface MusicTrack {
  name: string
  file: string
}

export const musicTracks: MusicTrack[] = [
  { name: 'the first town', file: 'track1.mp3.mp3' },
  { name: '悲念', file: 'track2.mp3.mp3' },
  { name: '小小的王国', file: 'track3.mp3.mp3' },
]
// 注：name 使用 Unicode 转义序列（悲念、小小的王国），确保任何编译环境均正确显示
