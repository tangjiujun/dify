import {
  eventTarget,
  playStartEvent,
} from '@/app/components/ai-shade/xfyun/event'
import AudioPlayer from '@/utils/xfyun/tts.umd'
import { getWebSocket } from '@/app/api/utils/socket'
import type { XfAudioPlay } from '@/app/components/chat/xfyun/xf-util'
import {
  getPlayWebSocketUrl,
  getPlayerParam,
} from '@/app/components/chat/xfyun/xf-util'

let globalSocket: WebSocket | null = null
let globalAudio: XfAudioPlay | null = null

const playMessage = (
  socket: WebSocket,
  currentAudio: XfAudioPlay,
  message: string,
  globalResolve: (value: PromiseLike<unknown> | unknown) => void,
): Promise<{
  socket: WebSocket
  audio: XfAudioPlay
}> => {
  // 在组件挂载时建立 socket 连接
  return new Promise((resolve, reject) => {
    socket.onerror = e => {
      console.error('socket.onerror', e)
      reject(e)
    }
    socket.onclose = e => {
      console.log('socket.onclose', e)
      resolve({
        socket,
        audio: currentAudio,
      })
    }
    socket.onopen = () => {
      console.log('socket.onopen')
      currentAudio?.start?.({
        autoPlay: true,
        sampleRate: 16000,
        resumePlayDuration: 1000,
      })
      socket.send(JSON.stringify(getPlayerParam(message)))
      setTimeout(() => {
        const audioBufferSourceNode =
          globalAudio?.bufferSource as AudioBufferSourceNode

        const handleEnded = () => {
          console.log('ended')
          if (globalSocket) globalSocket.close()
          globalSocket = null
          globalAudio = null
          audioBufferSourceNode.removeEventListener('ended', handleEnded)
          globalResolve('end')
        }
        console.log(audioBufferSourceNode)
        if (audioBufferSourceNode)
          audioBufferSourceNode.addEventListener('ended', handleEnded)
        else handleEnded()
      }, 1000)
    }
    socket.onmessage = e => {
      console.log('socket.onmessage')
      const jsonData = JSON.parse(e.data)
      // 合成失败
      if (jsonData.code !== 0) console.error(jsonData)

      currentAudio?.postMessage({
        type: 'base64',
        data: jsonData.data.audio,
        // isLastData: jsonData.data.status === 2,
      })
    }
  })
}
export const handlePlay = async (message: string) => {
  console.log(globalSocket || globalAudio)
  if (globalSocket && globalAudio) return

  let globalResolve: (value: PromiseLike<unknown> | unknown) => void
  const promise = new Promise(resolve => {
    globalResolve = resolve
  })
  try {
    globalSocket = getWebSocket(getPlayWebSocketUrl())

    globalAudio = new AudioPlayer('./tts') as unknown as XfAudioPlay

    eventTarget.dispatchEvent(playStartEvent)

    // 判断当前是否有语言，有则终止，终止后再播放当前语音，如果是还在描写中则逐个播放
    await playMessage(globalSocket, globalAudio, message, globalResolve)

    console.log('playMessage end')
  } finally {
    if (globalSocket) globalSocket.close()
    globalSocket = null
  }

  return promise
}
