'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconMute, IconSound } from '@arco-design/web-react/icon'
import { Button } from '@arco-design/web-react'
import LoadingAnim from '../loading-anim'
import type { FeedbackFunc, IChatItem } from '../type'
import s from '../style.module.css'
import ImageGallery from '../../base/image-gallery'
import Thought from '../thought'
import { randomString } from '@/utils/string'
import type { VisionFile } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import { Markdown } from '@/app/components/base/markdown'
import type { Emoji } from '@/types/tools'
type IAnswerProps = {
  item: IChatItem
  isDefaultReading: boolean
  feedbackDisabled: boolean
  onReadTrigger: (flag: boolean, itemId: string) => void
  onFeedback?: FeedbackFunc
  isResponsing?: boolean
  allToolIcons?: Record<string, string | Emoji>
}

// The component needs to maintain its own state to control whether to display input component
const Answer: FC<IAnswerProps> = ({
  item,
  isDefaultReading,
  feedbackDisabled = false,
  onReadTrigger,
  isResponsing,
  allToolIcons,
}) => {
  const { id, content, feedback, agent_thoughts } = item
  const isAgentMode = !!agent_thoughts && agent_thoughts.length > 0

  const { t } = useTranslation()

  /**
     * Different scenarios have different operation items.
     * @returns comp
     */
  const renderItemOperation = () => {
    const userOperation = () => {
      return feedback?.rating
        ? null
        : <div className='flex gap-1'>
          <Tooltip selector={`user-feedback-${randomString(16)}`}
            content={t('common.operation.reading') as string}>
            {item.isReading
              ? <Button shape='circle' type='outline' icon={<IconSound />} onClick={() => onReadTrigger(false, id)}/>
              : <Button shape='circle' type='dashed' icon={<IconMute />} onClick={() => onReadTrigger(true, id)}/>}
          </Tooltip>
          {/* <Tooltip selector={`user-feedback-${randomString(16)}`} */}
          {/*  content={t('common.operation.like') as string}> */}
          {/*  { <Button shape='circle' type={item.feedback.rating === 'like' ? 'outline' : 'dashed'} icon={<IconThumbUp />} />} */}
          {/* </Tooltip> */}
          {/* <Tooltip selector={`user-feedback-${randomString(16)}`} */}
          {/*  content={t('common.operation.dislike') as string}> */}
          {/*  { <Button shape='circle' type={item.feedback.rating === 'dislike' ? 'outline' : 'dashed'} icon={<IconThumbDown />} />} */}
          {/* </Tooltip> */}
        </div>
    }

    return (
      <div className={`${s.itemOperation} flex gap-2`}>
        {userOperation()}
      </div>
    )
  }

  const getImgs = (list?: VisionFile[]) => {
    if (!list)
      return []
    return list.filter(file => file.type === 'image' && file.belongs_to === 'assistant')
  }

  const agentModeAnswer = (
    <div>
      {agent_thoughts?.map((item, index) => (
        <div key={index}>
          {item.thought && (
            <Markdown content={item.thought}/>
          )}
          {/* {item.tool} */}
          {/* perhaps not use tool */}
          {!!item.tool && (
            <Thought
              thought={item}
              allToolIcons={allToolIcons || {}}
              isFinished={!!item.observation || !isResponsing}
            />
          )}

          {getImgs(item.message_files).length > 0 && (
            <ImageGallery srcs={getImgs(item.message_files).map(item => item.url)}/>
          )}
        </div>
      ))}
    </div>
  )
  return (
    <div key={id}>
      <div className='flex items-start'>
        <div className={`${s.answerIcon} w-10 h-10 shrink-0`}>
          {isResponsing
                        && <div className={s.typeingIcon}>
                          <LoadingAnim type='avatar'/>
                        </div>
          }
        </div>
        <div className={`${s.answerWrap}`}>
          <div className={`${s.answer} relative text-sm text-gray-900`}>
            <div className={'ml-2 py-3 px-4 bg-gray-100 rounded-tr-2xl rounded-b-2xl'}>
              {(isResponsing && (isAgentMode ? (!content && (agent_thoughts || []).filter(item => !!item.thought || !!item.tool).length === 0) : !content))
                ? (
                  <div className='flex items-center justify-center w-6 h-5'>
                    <LoadingAnim type='text'/>
                  </div>
                )
                : (isAgentMode
                  ? agentModeAnswer
                  : (
                    <Markdown content={content}/>
                  ))}
            </div>
            <div className='absolute top-[-14px] right-[-14px] flex flex-row justify-end gap-1'>
              {!feedbackDisabled && !item.feedbackDisabled && renderItemOperation()}
              {/* User feedback must be displayed */}
              {/* {!feedbackDisabled && renderFeedbackRating(feedback?.rating)} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(Answer)
