import {
  eventTarget,
  playEndEvent,
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
    }
    socket.onmessage = e => {
      console.log('socket.onmessage')
      const jsonData = JSON.parse(e.data)

      currentAudio?.postMessage({
        type: 'base64',
        data: jsonData.data.audio,
        isLastData: jsonData.data.status === 2,
      })
      if (jsonData.code === 0 && jsonData.data.status === 2) socket?.close()
    }
  })
}

function signal(time: number, signalCondition: () => boolean) {
  return new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (signalCondition()) {
        clearInterval(intervalId)
        resolve(true)
      }
    }, time)
  })
}

const waitAudioPlayingStop = () => {
  const isAudioPlayingStop = () => {
    return globalAudio?.status === 'stop'
  }

  return signal(2000, () => {
    return isAudioPlayingStop()
  })
}

export const handlePlay = async (message: string) => {
  if (globalAudio?.status === 'play') return

  try {
    globalSocket = getWebSocket(getPlayWebSocketUrl())

    globalAudio = new AudioPlayer('./tts') as unknown as XfAudioPlay

    globalAudio.onStop = () => {
      globalSocket?.close()
    }
    eventTarget.dispatchEvent(playStartEvent)

    // 判断当前是否有语言，有则终止，终止后再播放当前语音，如果是还在描写中则逐个播放
    await playMessage(globalSocket, globalAudio, message)

    console.log('playMessage end')
  } catch (e) {
    console.log(e)
  } finally {
    await waitAudioPlayingStop()
  }
  eventTarget.dispatchEvent(playEndEvent)
}

export const closePlay = () => {
  try {
    globalAudio?.stop()
    globalAudio?.reset()
    globalSocket?.close()
  } catch (e) {
    globalSocket = null
    globalSocket = null
    console.log(e)
  }
}
