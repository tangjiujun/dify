import { create } from 'zustand'
import { chain } from 'lodash'
import type { IChatItem } from '@/types/app'

type SoundState = {
  isShow: boolean
  isDefaultReading: boolean
  isPlaying: boolean
  isRecording: boolean
  isOpenPlay: boolean

  startPlay: () => void
  endPlay: () => void
  openPlay: () => void
  closePlay: () => void
  startRecord: () => void
  setChatItems: (items: IChatItem[]) => void
  endRecord: () => void
  setDefaultReading: (defaultReading: boolean) => void
  chatItems: IChatItem[]
}

export const useSoundStore = create<SoundState>(set => ({
  isShow: true,
  chatItems: [],
  isDefaultReading: true,
  isPlaying: false,
  isRecording: false,
  isOpenPlay: false,
  startPlay: () => {
    return set(() => ({ isPlaying: true }))
  },
  endPlay: () => set(() => ({ isPlaying: false })),
  openPlay: () => {
    return set(() => ({ isOpenPlay: true }))
  },
  closePlay: () => {
    return set(() => ({ isOpenPlay: false }))
  },
  startRecord: () => set(() => ({ isRecording: true })),
  endRecord: () => set(() => ({ isRecording: false })),
  setChatItems: (chatItems: IChatItem[]) => set(() => ({ chatItems })),
  setDefaultReading: (defaultReading: boolean) =>
    set(() => ({ isDefaultReading: defaultReading })),
}))
export const selectCurrentAnswer = (state: SoundState) =>
  chain(state.chatItems)
    .filter(it => it.isAnswer)
    .last()
    .get('content')
    .value()

export enum AiStatus {
  Init,
  Hi,
  Listen,
  Say,
  Think,
  Stop,
}
type AiState = {
  status: AiStatus
  setStatus: (status: AiStatus) => void
}
export const useAiStore = create<AiState>(set => ({
  status: AiStatus.Init,
  setStatus(status) {
    return set(() => {
      return { status }
    })
  },
}))
type ChatListState = {
  answer: string
  request: string
  hello: string
  chatItems: IChatItem[]
  addItem: (item: IChatItem) => void
  setAnswer: (answer: string) => void
  setRequest: (request: string) => void
}

export const useChatListStore = create<ChatListState>(set => ({
  chatItems: [],
  hello: 'hi, 我是亮仔， 什么问题都可以问我呦',
  answer: 'hi, 我是亮仔， 什么问题都可以问我呦',
  request: '',
  addItem: (item: IChatItem) => {
    set(state => {
      state.chatItems.push(item)
      return state
    })
  },
  setAnswer: (answer: string) =>
    set(() => ({
      answer,
    })),
  setRequest: (request: string) =>
    set(() => ({
      request,
    })),
}))
