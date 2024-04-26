import type { FC } from 'react'
import React, { useEffect, useRef } from 'react'
import { Button } from '@arco-design/web-react'
import { IconSound } from '@arco-design/web-react/icon'
import XfRecorder from '@/utils/xfyun/iat.umd'
import { getWebSocket } from '@/app/api/utils/socket'
import {
  getRecordWebSocketUrl,
  getRecorderParam,
  parseRecordingMessage,
  toBase64,
} from '@/app/components/chat/xfyun/xf-util'
import {useSoundStore} from "@/app/store";

type XfRecord = {
  start: (param: { sampleRate: number; frameSize: number }) => any
  stop: () => any
  onStart: () => any
  onFrameRecorded: (param: { isLastFrame: boolean; frameBuffer: string }) => any
}

const Recorder: FC<{
  recording: boolean
  onRecordingChange: (message: string, recording: boolean) => void
  onRecordStart: () => void
  onRecordEnd: () => void
}> = ({ recording, onRecordingChange, onRecordStart, onRecordEnd }) => {
  // @ts-expect-error
  const recorder = useRef<Recorder | null>(null)
  const webSocket = useRef<WebSocket | null>(null)
  const recordingMessage = useRef('')
  const recordingRef = useRef(recording)
  const { startRecord, endRecord } = useSoundStore();

  useEffect(() => {
    recordingRef.current = recording
    if (!recording && webSocket.current)
      webSocket.current?.close()
  }, [recording])

  const handleSocketOpen = () => {
    // 开始录音
    recorder.current?.start({ sampleRate: 16000, frameSize: 1280 })
    if (webSocket.current)
      webSocket.current.send(JSON.stringify(getRecorderParam()))
    console.log(`handleSocketOpen recording ${recording}`)
  }
  const handleRecordEnd = () => {
    endRecord()
    onRecordEnd()
    recorder.current?.stop()
    webSocket.current = null
    console.log(`handleRecordEnd recording ${recording}`)
  }

  const handleSocketClose = () => {
    recorder.current?.stop()
    // onRecordEnd()
    console.log(`handleSocketClose recording ${recording}`)
  }
  const handleSocketMessage = (e: WebSocketEventMap['message']) => {
    const jsonData = JSON.parse(e.data)
    console.log(jsonData)
    const currentMessage = parseRecordingMessage(jsonData)
    recordingMessage.current = recordingMessage.current + currentMessage
    onRecordingChange(recordingMessage.current, recordingRef.current)
    console.log('handleSocketMessage recording', recordingRef.current)
  }

  const handleRecorderFrameRecorded = ({ isLastFrame, frameBuffer }: { isLastFrame: boolean; frameBuffer: string }) => {
    if (webSocket.current && webSocket.current?.readyState === webSocket.current?.OPEN) {
      webSocket.current.send(
        JSON.stringify({
          data: {
            status: isLastFrame ? 2 : 1,
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: toBase64(frameBuffer),
          },
        }),
      )
      if (isLastFrame)
        onRecordEnd()
    }
    console.log('handleRecorderFrameRecorded recording', recording)
  }

  const connectWebSocket = () => {
    webSocket.current = getWebSocket(getRecordWebSocketUrl())
    recorder.current = new XfRecorder('./iat') as unknown as XfRecord
    recordingMessage.current = ''
    webSocket.current?.addEventListener('open', handleSocketOpen)
    webSocket.current?.addEventListener('message', handleSocketMessage)
    webSocket.current?.addEventListener('close', handleSocketClose)
    webSocket.current?.addEventListener('error', handleSocketClose)
    if (recorder.current) {
      recorder.current.onStart = () => onRecordStart()
      recorder.current.onFrameRecorded = handleRecorderFrameRecorded
    }
  }
  const handleRecordStart = () => {
    console.log('handleRecordStart recording', recording)
    startRecord()
    connectWebSocket()
  }
  return (
    <>
      {recording
        ? <Button type='primary' icon={<IconSound />} onClick={handleRecordEnd}/>
        : <Button type='secondary' icon={<IconSound />} onClick={handleRecordStart}/>}
    </>
  )
}
export default Recorder
