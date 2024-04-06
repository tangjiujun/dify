'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea'
import { Button, Space, Tooltip } from '@arco-design/web-react'
import { IconSend, IconSound } from '@arco-design/web-react/icon'
import s from './style.module.css'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc, Feedbacktype } from './type'
import Recorder from './xfyun/Recorder'
import type { VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Toast from '@/app/components/base/toast'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'

export type IChatProps = {
  chatList: IChatItem[]
  /**
   * Whether to display the editing area and rating status
   */
  feedbackDisabled?: boolean
  /**
   * Whether to display the input area
   */
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[]) => void
  isDefaultReading: boolean
  onDefaultReadingTrigger: (flag: boolean) => void
  onReadingTrigger: (readingOrStop: boolean, itemId: string) => void
  useCurrentUserAvatar?: boolean
  isResponsing?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
}

export type IChatItem = {
  id: string
  content: string
  /**
   * Specific message type
   */
  isAnswer: boolean
  /**
   * The user feedback result of this message
   */
  feedback?: Feedbacktype
  /**
   * Whether to hide the feedback area
   */
  feedbackDisabled?: boolean
  isIntroduction?: boolean
  useCurrentUserAvatar?: boolean
  isOpeningStatement?: boolean
  message_files?: VisionFile[]
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  isHideSendInput = false,
  onFeedback,
  checkCanSend,
  onSend = () => { },
  isDefaultReading,
  onDefaultReadingTrigger,
  onReadingTrigger,
  useCurrentUserAvatar,
  isResponsing,
  controlClearQuery,
  visionConfig,
}) => {
  const { t } = useTranslation()
  const [_readingItemId, setReadingItemId] = useState<null | string>(null)
  const { notify } = Toast
  const isUseInputMethod = useRef(false)
  const [recording, setRecording] = useState<boolean>(false)

  const [query, setQuery] = React.useState('')
  const handleContentChange = (e: any) => {
    const value = e.target.value
    setQuery(value)
  }

  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const valid = (query: string) => {
    if (!query || query.trim() === '') {
      logError('Message cannot be empty')
      return false
    }
    return true
  }

  useEffect(() => {
    if (controlClearQuery)
      setQuery('')
  }, [controlClearQuery])
  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const doHandleSend = (query: string) => {
    if (!valid(query) || (checkCanSend && !checkCanSend()))
      return
    onSend(query, files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    })))
    if (!files.find(item => item.type === TransferMethod.local_file && !item.fileId)) {
      if (files.length)
        onClear()
      if (!isResponsing)
        setQuery('')
    }
  }

  const handleSend = () => {
    console.log('handleSend recordingStatus', recording, 'query', query)
    setRecording(false)
    doHandleSend(query)
  }

  const onRecordChange = (recordMessage: string, isRecording: boolean) => {
    console.log('recordingStatus', recording, 'query', query)
    if (isRecording)
      setQuery(recordMessage)
  }

  const onRecordEnd = () => {
    setRecording(false)
  }

  const onRecordStart = () => {
    setRecording(true)
    console.log('onRecordStart recordingStatus', recording)
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      // prevent send message when using input method enter
      if (!e.shiftKey && !isUseInputMethod.current)
        handleSend()
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      setQuery(query.replace(/\n$/, ''))
      e.preventDefault()
    }
  }
  const onReadTrigger = (flag: boolean, itemId: string) => {
    setReadingItemId(itemId)
    onReadingTrigger(flag, itemId)
  }
  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'h-full')}>
      {/* Chat List */}
      <div className="h-full space-y-[30px]">
        {chatList.map((item) => {
          if (item.isAnswer) {
            const isLast = item.id === chatList[chatList.length - 1].id
            return <Answer
              key={item.id}
              item={item}
              isDefaultReading={isDefaultReading}
              onReadTrigger={onReadTrigger}
              feedbackDisabled={feedbackDisabled}
              onFeedback={onFeedback}
              isResponsing={isResponsing && isLast}
            />
          }
          return (
            <Question
              key={item.id}
              id={item.id}
              content={item.content}
              useCurrentUserAvatar={useCurrentUserAvatar}
              imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
            />
          )
        })}
      </div>
      {
        !isHideSendInput && (
          <div className={cn(!feedbackDisabled && '!left-3.5 !right-3.5', 'absolute z-10 bottom-0 left-0 right-0')}>
            <div className='p-[5.5px] max-h-[150px] bg-white border-[1.5px] border-gray-200 rounded-xl overflow-y-auto'>
              {
                visionConfig?.enabled && (
                  <>
                    <div className='absolute bottom-2 left-2 flex items-center'>
                      <ChatImageUploader
                        settings={visionConfig}
                        onUpload={onUpload}
                        disabled={files.length >= visionConfig.number_limits}
                      />
                      <div className='mx-1 w-[1px] h-4 bg-black/5' />
                    </div>
                    <div className='pl-[52px]'>
                      <ImageList
                        list={files}
                        onRemove={onRemove}
                        onReUpload={onReUpload}
                        onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                        onImageLinkLoadError={onImageLinkLoadError}
                      />
                    </div>
                  </>
                )
              }
              <div className="absolute">
                <Tooltip position='tl' trigger='hover' content='开启后会语音跟读答案'>
                  <Button className="absolute" shape='circle' type={isDefaultReading ? 'primary' : 'secondary'} icon={<IconSound />} onClick={() => onDefaultReadingTrigger(!isDefaultReading)}/>
                </Tooltip>
              </div>
              <Textarea
                className={`
                  ml-10 block w-full px-2 pr-[118px] py-[7px] leading-5 max-h-none text-sm text-gray-700 outline-none appearance-none resize-none
                  ${visionConfig?.enabled && 'pl-12'}
                `}
                value={query}
                onChange={handleContentChange}
                onKeyUp={handleKeyUp}
                onKeyDown={handleKeyDown}
                autoSize
              />
              <div className="absolute bottom-2 right-2 flex items-center h-8">
                <div className={`${s.count} mr-4 h-5 leading-5 text-sm bg-gray-50 text-gray-500`}>{query.trim().length}</div>
                <Space size={10}>
                  <Tooltip position='tl' trigger='hover' content='点击一次开始录音，再次点击结束录音'>
                    <Recorder recording={recording}
                      onRecordingChange={onRecordChange}
                      onRecordEnd={onRecordEnd}
                      onRecordStart={onRecordStart}/>
                  </Tooltip>

                  <Tooltip position='tl' trigger='hover' content={`${t('common.operation.send')} Enter;${t('common.operation.lineBreak')} Shift Enter`}>
                    <Button type='secondary' icon={<IconSend />} onClick={handleSend}/>
                  </Tooltip>
                </Space>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default React.memo(Chat)
