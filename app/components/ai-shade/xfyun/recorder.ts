import { eventTarget, recordChangeEvent, recordEndEvent, recordStartEvent } from './event'
import { getWebSocket } from '@/app/api/utils/socket'
import {
  getRecordWebSocketUrl,
  getRecorderParam,
  parseRecordingMessage,
  toBase64,
} from '@/app/components/chat/xfyun/xf-util'
import XfRecorder from '@/utils/xfyun/iat.umd'

type XfRecord = {
  start: (param: { sampleRate: number; frameSize: number }) => any
  stop: () => any
  onStart: () => any
  onFrameRecorded: (param: { isLastFrame: boolean; frameBuffer: string }) => any
}
const config = {
  stopTime: 3000,
}
let recorder: XfRecord | undefined
let webSocket: WebSocket | undefined
let recordingMessage = ''

const handleSocketOpen = () => {
  // 开始录音
  recorder?.start({ sampleRate: 16000, frameSize: 1280 })
  if (webSocket)
    webSocket.send(JSON.stringify(getRecorderParam()))
}

const handleRecordEnd = () => {
  if (recorder || webSocket) {
    recordEndEvent.meta = { message: recordingMessage }
    eventTarget.dispatchEvent(recordEndEvent)
  }

  recorder?.stop()
  recorder = undefined
  webSocket = undefined

  recordingMessage = ''
}

const handleSocketClose = () => {
  recorder?.stop()
  handleRecordEnd()
}

let timer: number
const handleSocketMessage = (e: WebSocketEventMap['message']) => {
  clearTimeout(timer)
  const jsonData = JSON.parse(e.data)
  console.log(jsonData)
  const currentMessage = parseRecordingMessage(jsonData)
  recordingMessage = recordingMessage + currentMessage

  recordChangeEvent.meta = { message: recordingMessage }
  eventTarget.dispatchEvent(recordChangeEvent)
  timer = setTimeout(() => {
    handleRecordEnd()
  }, config.stopTime) as unknown as number
}

const handleRecorderFrameRecorded = ({
  isLastFrame,
  frameBuffer,
}: { isLastFrame: boolean; frameBuffer: string }) => {
  if (webSocket && webSocket?.readyState === webSocket?.OPEN) {
    webSocket.send(
      JSON.stringify({
        data: {
          status: isLastFrame ? 2 : 1,
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: toBase64(frameBuffer as unknown as number),
        },
      }),
    )
    if (isLastFrame)
      handleRecordEnd()
  }
}

export const connectWebSocket = () => {
  webSocket = getWebSocket(getRecordWebSocketUrl())
  recorder = new XfRecorder('./iat') as unknown as XfRecord
  recordingMessage = ''
  webSocket?.addEventListener('open', handleSocketOpen)
  webSocket?.addEventListener('message', handleSocketMessage)
  webSocket?.addEventListener('close', handleSocketClose)
  webSocket?.addEventListener('error', handleSocketClose)
  if (recorder) {
    recorder.onStart = () => eventTarget.dispatchEvent(recordStartEvent)
    recorder.onFrameRecorded = handleRecorderFrameRecorded
  }

  return {
    eventTarget,
  }
}
