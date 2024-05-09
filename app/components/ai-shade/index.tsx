import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import Image from 'next/image'
import { connectWebSocket } from './xfyun/recorder'
import { eventTarget } from '@/app/components/ai-shade/xfyun/event'
import type { MyEvent } from '@/app/components/ai-shade/xfyun/event'
import Sound from '@/app/components/ai-shade/sound'
import { selectCurrentAnswer, useSoundStore } from '@/app/store'

export const AiShade: React.FC = forwardRef((
  {
    onSend = () => {
    },
    isResponsing = false,
  },
  ref,
) => {
  const {
    isRecording,
    isPlaying,
    startRecord,
    endRecord,
  } = useSoundStore()
  const currentAnswer = useSoundStore(selectCurrentAnswer)

  // if (!isRecording && !isPlaying)
  //   return null

  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleRecordStart = () => {
      setMessage(() => '')
      console.log('connect')
    }

    const handleRecordChange = (event: MyEvent) => {
      console.log('change', event.meta)
      setMessage(event.meta.message)
    }
    const handleRecordEnd = (event: MyEvent) => {
      console.log('end')
      const { message } = event.meta
      if (!isRecording && !isPlaying)
        onSend(message)

      endRecord()
    }

    eventTarget.addEventListener('recordStart', handleRecordStart)
    eventTarget.addEventListener('recordChange', handleRecordChange as any)
    eventTarget.addEventListener('recordEnd', handleRecordEnd as any)
    return () => {
      eventTarget.removeEventListener('recordStart', handleRecordStart)
      eventTarget.removeEventListener('recordChange', handleRecordChange as any)
      eventTarget.removeEventListener('recordEnd', handleRecordEnd as any)
    }
  }, [])

  const handleClick = () => {
    connectWebSocket()
    startRecord()
  }

  useImperativeHandle(ref, () => ({
    startListen: () => {
      handleClick()
    },
    // ...其他需要暴露的方法或属性
  }))

  const Contexts = []

  if (isRecording || isPlaying || isResponsing) {
    Contexts.push(<Sound/>)

    isRecording && message && Contexts.push((<div className="max-w-[500px] text-gray-300 text-base"> {message} </div>))
  }

  if (!isRecording) {
    currentAnswer && Contexts.push((<p className="max-w-[500px] text-gray-300 text-base">
      {currentAnswer}
    </p>))
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full  bg-gray-900 bg-opacity-75">
      <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center flex-col justify-center">
        <div
          className="bg-gray-400 rounded-full border-0 border-gray-300 bg-opacity-75 w-[237px] h-[237px] flex justify-center items-end"
        >
          <Image
            className="w-[190px]"
            src="/images/ai-big.png"
            width={190}
            height={190}
            alt="ai"
          />
        </div>

        <div className="min-h-[300px] mt-5 flex flex-col items-center">
          <div className="min-h-[100px] align-center">
            {
              Contexts.map((element, index) => (
                // 注意：在使用数组中的元素作为 JSX 中的子元素时，需要为每个元素指定一个唯一的 key
                // 这里假设每个元素都有一个唯一的 key 属性
                <React.Fragment key={index}>
                  {element}
                </React.Fragment>
              ))}
          </div>
          {
            (!isRecording && !isPlaying && !isResponsing)
            && <div className="content-end">
              <div className="inline-block p-3 pr-6 pl-6 text-white bg-blue-600 rounded-md" onClick={handleClick}>
                🎤 点击开始说话
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
})

export default React.memo(AiShade)
