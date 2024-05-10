import { sendChatMessage } from '@/service'
import type { IChatItem } from '@/types/app'

/**
 *
 * @param message
 * @param id
 */

type SendChatConfig = {
  /**
   * @param process
   */
  onProcess?: (process: { message: string; token: string }) => void
}

export const sendChat = (message: string, config?: SendChatConfig) => {
  const questionId = `question-${Date.now()}`
  const questionItem = {
    id: questionId,
    content: message,
    isAnswer: false,
    message_files: [],
  }

  const responseItem: IChatItem = {
    id: `${Date.now()}`,
    content: '',
    agent_thoughts: [],
    message_files: [],
    isAnswer: true,
    isReading: false,
  }
  const data = {
    inputs: [],
    query: message,
    conversation_id: null,
  }

  return new Promise<string>((resolve, reject) => {
    sendChatMessage(data, {
      getAbortController(abortController) {},
      onData(
        message: string,
        isFirstMessage: boolean,
        { conversationId: newConversationId, messageId, taskId }: any,
      ) {
        console.log('onData', message)
        responseItem.content += message

        if (config?.onProcess) {
          config.onProcess({
            message: responseItem.content,
            token: message,
          })
        }
      },
      onCompleted(hasError?: boolean) {
        console.log('onCompleted', hasError)
        // eslint-disable-next-line prefer-promise-reject-errors
        if (hasError) reject()
        // resolve(responseItem.content)
      },
      onThought(thought): boolean {
        console.log('onThought', thought)
        return true
      },
      onMessageEnd: messageEnd => {
        resolve(responseItem.content)
      },
      onMessageReplace: messageReplace => {
        console.log('onMessageReplace', messageReplace)
      },
      onError() {
        console.log('chat-error')
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
      },
      onFile() {},
    })
  })
}

function createData(message: string) {
  return {}
}
