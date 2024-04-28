import create from 'zustand'
import type { IChatItem } from '@/types/app'

type SoundState = {
  isPlaying: boolean
  isRecording: boolean
  startPlay: () => void
  endPlay: () => void
  startRecord: () => void
  setChatItems: (items: IChatItem[]) => void
  endRecord: () => void
  chatItems: IChatItem[]
}

export const useSoundStore = create<SoundState>(set => ({
  chatItems: [],
  isPlaying: false,
  isRecording: false,
  startPlay: () => set(() => ({ isPlaying: true })),
  endPlay: () => set(() => ({ isPlaying: false })),
  startRecord: () => set(() => ({ isRecording: true })),
  endRecord: () => set(() => ({ isRecording: false })),
  setChatItems: (chatItems: IChatItem[]) => set(() => ({ chatItems })),
}))
