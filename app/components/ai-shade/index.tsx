import React from 'react'
import Image from 'next/image'
import Sound from './sound'
import { selectCurrentAnswer, useSoundStore } from '@/app/store'

export const AiShade: React.FC = () => {
  const { isRecording, isPlaying } = useSoundStore()
  const currentAnswer = useSoundStore(selectCurrentAnswer)

  // if (!isRecording && !isPlaying)
  //   return null

  return <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95">
    <div className="absolute flex items-center right-10 bottom-28">
      <div className="inline-block">
        {(isRecording || isPlaying) ? <Sound/> : (currentAnswer ? <p className="max-w-[500px] text-gray-300 text-base">{currentAnswer}</p> : null)}
      </div>
      <Image className="w-200px inline-block" src="/images/ai-big.png" width={200} height={100} alt="ai"/>
    </div>
  </div>
}

export default React.memo(AiShade)
