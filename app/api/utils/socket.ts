export const getWebSocket = (websocketUrl: string): WebSocket => {
  if ('WebSocket' in window) { return new WebSocket(websocketUrl) }
  else if ('MozWebSocket' in window) { // @ts-expect-error
    return new window.MozWebSocket(websocketUrl)
  }
  else { console.error('浏览器不支持WebSocket') }
  // eslint-disable-next-line unicorn/error-message
  throw new Error()
}
