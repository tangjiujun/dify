import create from 'zustand'
import { last } from 'lodash'
import type { IChatItem } from '@/types/app'

type SoundState = {
  isDefaultReading: boolean
  isPlaying: boolean
  isRecording: boolean
  startPlay: () => void
  endPlay: () => void
  startRecord: () => void
  setChatItems: (items: IChatItem[]) => void
  endRecord: () => void
  setDefaultReading: (defaultReading: boolean) => void
  chatItems: IChatItem[]
}

export const useSoundStore = create<SoundState>(set => ({
  chatItems: [],
  isDefaultReading: true,
  isPlaying: false,
  isRecording: false,
  startPlay: () => set(() => ({ isPlaying: true })),
  endPlay: () => set(() => ({ isPlaying: false })),
  startRecord: () => set(() => ({ isRecording: true })),
  endRecord: () => set(() => ({ isRecording: false })),
  setChatItems: (chatItems: IChatItem[]) => set(() => ({ chatItems })),
  setDefaultReading: (defaultReading: boolean) => set(() => ({ isDefaultReading: defaultReading })),
}))

export const selectCurrentAnswer = (state: SoundState) => last((state.chatItems || []).filter(it => it.isAnswer))?.content || ''
