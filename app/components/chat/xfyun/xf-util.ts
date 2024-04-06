import CryptoJS from '@/utils/xfyun/crypto-js'
import Base64 from '@/utils/xfyun/base64'

const APPID = '0b95436f'
const API_SECRET = 'NTUyNGJkYzM5YzVkZDQ1NzlmODgwYjI0'
const API_KEY = 'b332d962fe2a6e1d6e4e35b2634955fe'

export const toBase64 = (buffer: number) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++)
    binary += String.fromCharCode(bytes[i])

  return window.btoa(binary)
}
export const encodeText = (text: string, type: string) => {
  console.log(`encode ${text}`)
  if (type === 'unicode') {
    const buf = new ArrayBuffer(text.length * 4)
    const bufView = new Uint16Array(buf)
    for (let i = 0, strlen = text.length; i < strlen; i++)
      bufView[i] = text.charCodeAt(i)

    let binary = ''
    const bytes = new Uint8Array(buf)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++)
      binary += String.fromCharCode(bytes[i])

    return window.btoa(binary)
  }
  else {
    return Base64.encode(text)
  }
}

export const getRecordWebSocketUrl = () => {
  let url = 'wss://iat-api.xfyun.cn/v2/iat'
  const host = 'iat-api.xfyun.cn'
  const apiKey = API_KEY
  const apiSecret = API_SECRET
  const date = new Date().toGMTString()
  const algorithm = 'hmac-sha256'
  const headers = 'host date request-line'
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
  const signature = CryptoJS.enc.Base64.stringify(signatureSha)
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
  const authorization = window.btoa(authorizationOrigin)
  url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
  return url
}

export const getPlayWebSocketUrl = () => {
  let url = 'wss://tts-api.xfyun.cn/v2/tts'
  const host = location.host
  const apiKey = API_KEY
  const apiSecret = API_SECRET
  const date = new Date().toGMTString()
  const algorithm = 'hmac-sha256'
  const headers = 'host date request-line'
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
  const signature = CryptoJS.enc.Base64.stringify(signatureSha)
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
  const authorization = btoa(authorizationOrigin)
  url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
  return url
}

export const getRecorderParam = () => {
  return {
    common: {
      app_id: APPID,
    },
    business: {
      language: 'zh_cn',
      domain: 'iat',
      accent: 'mandarin',
      vad_eos: 5000,
      dwa: 'wpgs',
    },
    data: {
      status: 0,
      format: 'audio/L16;rate=16000',
      encoding: 'raw',
    },
  }
}

export const getPlayerParam = (text: string) => {
  const tte = 'UTF8'
  return {
    common: {
      app_id: APPID,
    },
    business: {
      aue: 'raw',
      auf: 'audio/L16;rate=16000',
      vcn: 'xiaoyan',
      speed: +50,
      volume: +50,
      pitch: +50,
      bgs: 1,
      tte,
    },
    data: {
      status: 2,
      text: encodeText(text, tte),
    },
  }
}

export const parseRecordingMessage = (jsonData: any) => {
  return (jsonData?.data?.result?.ws || [])?.map((current: any) => current?.cw?.[0]?.w).join('')
}

export type XfAudioPlay = {
  start: (data: any) => void
  stop: () => void
  postMessage: (data: any) => void
  reset: () => void
}
