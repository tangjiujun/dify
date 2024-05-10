'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { connectWebSocket } from './xfyun/recorder'
import { sendChat } from '@/app/components/ai-shade/xfyun/chat'
import type { MyEvent } from '@/app/components/ai-shade/xfyun/event'
import { eventTarget } from '@/app/components/ai-shade/xfyun/event'
import { handlePlay } from '@/app/components/ai-shade/xfyun/player'
import {
  AiStatus,
  useAiStore,
  useChatListStore,
  useSoundStore,
} from '@/app/store'

export const AiShade: React.FC = () => {
  const {
    isRecording,
    isPlaying,
    isShow,
    isOpenPlay,
    startRecord,
    endRecord,
    openPlay,
    closePlay,
  } = useSoundStore()
  const { status, setStatus } = useAiStore()
  const { hello, answer, setAnswer, request, setRequest } = useChatListStore()

  const handleClick = () => {
    setStatus(AiStatus.Listen)
  }

  const handleRecord = async () => {
    await connectWebSocket()
    startRecord()
  }

  useEffect(() => {
    const handleStatus = async () => {
      if ([AiStatus.Hi].includes(status)) {
        // 如果第一次加载不能播放
        try {
          await handlePlay(answer)
        } catch (e) {
          console.log(e)
        }
      }

      if ([AiStatus.Say].includes(status)) {
        try {
          await handlePlay(answer)
        } finally {
          setStatus(AiStatus.Listen)
        }
      }

      if ([AiStatus.Think].includes(status)) {
        try {
          setAnswer('')
          await sendChat(request, {
            onProcess({ message }) {
              setAnswer(message)
            },
          })
          setStatus(AiStatus.Say)
        } catch {
          setStatus(AiStatus.Listen)
        }
      }

      if ([AiStatus.Listen].includes(status)) {
        try {
          await handleRecord()
        } finally {
          console.log('listen')
        }
      }

      if ([AiStatus.Stop].includes(status)) {
        setAnswer('hi, 我是亮仔， 什么问题都可以问我呦')
        setStatus(AiStatus.Init)
      }
    }
    console.log(status)
    handleStatus()
  }, [status])

  useEffect(() => {
    const handleRecordStart = () => {
      setRequest('')
      console.log('startRecord')
    }

    const handleRecordChange = (event: MyEvent) => {
      setRequest(event.meta.message)
    }
    const handleRecordEnd = async (event: MyEvent) => {
      console.log('end')
      const { message } = event.meta
      setRequest(message)
      console.log('message', message)
      if (message) setStatus(AiStatus.Think)
      else setStatus(AiStatus.Stop)
      openPlay()
    }

    const handlePlayStart = (event: MyEvent) => {
      console.log('### playStart')
    }
    const handlePlayEnd = (event: MyEvent) => {
      console.log('### playEnd')
    }

    eventTarget.addEventListener('recordStart', handleRecordStart)
    eventTarget.addEventListener('recordChange', handleRecordChange as any)
    eventTarget.addEventListener('recordEnd', handleRecordEnd as any)

    eventTarget.addEventListener('playStart', handlePlayStart as any)
    eventTarget.addEventListener('playEnd', handlePlayEnd as any)
    return () => {
      eventTarget.removeEventListener('recordStart', handleRecordStart)
      eventTarget.removeEventListener('recordChange', handleRecordChange as any)
      eventTarget.removeEventListener('recordEnd', handleRecordEnd as any)
      eventTarget.removeEventListener('playStart', handlePlayStart as any)
      eventTarget.removeEventListener('playEnd', handlePlayEnd as any)
    }
  }, [])

  const Contexts = []

  if (
    [AiStatus.Hi, AiStatus.Say, AiStatus.Stop, AiStatus.Think].includes(status)
  ) {
    answer &&
      Contexts.push(
        <div className="max-w-[500px] text-gray-300 text-base">{answer}</div>,
      )
  }

  const [src, setSrc] = useState('/images/ai-big.png')

  useEffect(() => {
    switch (status) {
      case AiStatus.Think: {
        setSrc('/images/ai-think.gif')
        break
      }
      case AiStatus.Say: {
        setSrc('/images/ai-say.gif')
        break
      }
      default:
        setSrc('/images/ai-listen.gif')
    }
  }, [status])

  if (status === AiStatus.Init) {
    return (
      <div className="fixed bottom-20 right-8 flex justify-center items-center">
        <div
          className="bg-gray-400 bg-opacity-20 p-2 inline rounded-full rounded-tr-none mr-2"
          onClick={() => setStatus(AiStatus.Hi)}
        >
          {hello}
        </div>
        <div
          className="border-0 rounded-full bg-gray-400 bg-opacity-20"
          onClick={() => setStatus(AiStatus.Hi)}
        >
          <Image src="/images/ai.png" width={80} height={80} alt="ai" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full  bg-gray-900 bg-opacity-75">
      <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center flex-col justify-center">
        <div className="bg-gray-400 rounded-full border-0 border-gray-300 bg-opacity-75 w-[237px] h-[237px] flex justify-center items-end">
          <Image
            className="w-[190px]"
            src={src}
            width={190}
            height={190}
            alt="ai"
          />
        </div>

        <div className="min-h-[300px] mt-5 flex flex-col items-center">
          <div className="min-h-[100px] align-center">
            {Contexts.map((element, index) => (
              // 注意：在使用数组中的元素作为 JSX 中的子元素时，需要为每个元素指定一个唯一的 key
              // 这里假设每个元素都有一个唯一的 key 属性
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </div>
          {[AiStatus.Stop, AiStatus.Hi].includes(status) && (
            <div className="content-end">
              <div
                className="inline-block p-3 pr-6 pl-6 text-white bg-blue-600 rounded-md"
                onClick={handleClick}
              >
                🎤 点击开始说话
              </div>
            </div>
          )}
          {[AiStatus.Listen].includes(status) && (
            <div className="max-w-[500px] text-gray-300 text-base">
              {request}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(AiShade)
