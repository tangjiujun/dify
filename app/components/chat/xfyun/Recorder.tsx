import CryptoJS from '@/utils/xfyun/crypto-js';
import { useState } from 'react';
import RecorderManager from '@/utils/xfyun/iat.umd';

const APPID = "0b95436f";
const API_SECRET = "NTUyNGJkYzM5YzVkZDQ1NzlmODgwYjI0";
const API_KEY = "b332d962fe2a6e1d6e4e35b2634955fe";
let query = "";

const Recorder = ({ handleSend }) => {
    const [btnStatus, setBtnStatus] = useState("CLOSED")
    const [recorder, _] = useState(new RecorderManager("./iat"));

    const getWebSocketUrl = () => {
        var url = "wss://iat-api.xfyun.cn/v2/iat";
        var host = "iat-api.xfyun.cn";
        var apiKey = API_KEY;
        var apiSecret = API_SECRET;
        var date = new Date().toGMTString();
        var algorithm = "hmac-sha256";
        var headers = "host date request-line";
        var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
        var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        var signature = CryptoJS.enc.Base64.stringify(signatureSha);
        var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        var authorization = btoa(authorizationOrigin);
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
        return url;
    }

    function toBase64(buffer) {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    const connectWebSocket = () => {
        const websocketUrl = getWebSocketUrl();
        var iatWS;
        if ("WebSocket" in window) {
            iatWS = new WebSocket(websocketUrl);
        } else if ("MozWebSocket" in window) {
            iatWS = new MozWebSocket(websocketUrl);
        } else {
            alert("浏览器不支持WebSocket");
            return;
        }
        changeBtnStatus("CONNECTING");
        iatWS.onopen = (e) => {
            // 开始录音
            recorder.start({
                sampleRate: 16000,
                frameSize: 1280,
            });
            var params = {
                common: {
                    app_id: APPID,
                },
                business: {
                    language: "zh_cn",
                    domain: "iat",
                    accent: "mandarin",
                    vad_eos: 5000,
                    dwa: "wpgs",
                },
                data: {
                    status: 0,
                    format: "audio/L16;rate=16000",
                    encoding: "raw",
                },
            };
            iatWS.send(JSON.stringify(params));
        };
        iatWS.onmessage = (e) => {
            renderResult(e.data, iatWS)
        };
        iatWS.onclose = (e) => {
            recorder.stop()
            changeBtnStatus("CLOSED");
            handleSend(query);
        };
        iatWS.onerror = (e) => {
            recorder.stop();
            changeBtnStatus("CLOSED");
        };
        recorder.onStart = () => {
            changeBtnStatus("OPEN");
        }
        recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
            if (iatWS.readyState === iatWS.OPEN) {
                iatWS.send(
                    JSON.stringify({
                        data: {
                            status: isLastFrame ? 2 : 1,
                            format: "audio/L16;rate=16000",
                            encoding: "raw",
                            audio: toBase64(frameBuffer),
                        },
                    })
                );
                if (isLastFrame) {
                    changeBtnStatus("CLOSING");
                }
            }
        };
    }

    const renderResult = (resultData, iatWS) => {
        let jsonData = JSON.parse(resultData);
        let str = "";
        if (jsonData.data && jsonData.data.result) {
            let data = jsonData.data.result;
            let ws = data.ws;
            for (let i = 0; i < ws.length; i++) {
                str = str + ws[i].cw[0].w;
            }
        }
        if (jsonData.code === 0 && jsonData.data.status === 2) {
            iatWS.close();
        }
        if (jsonData.code !== 0) {
            iatWS.close();
            console.error(jsonData);
        }
        console.log('str ' + str)
        query = query + str;
    }

    function changeBtnStatus(status) {
        setBtnStatus(status)
    }

    const handleBtnClick = () => {
        if (btnStatus === "CLOSED") {
            query = ''
            connectWebSocket();
        } else if (btnStatus === "CONNECTING" || btnStatus === "OPEN") {
            recorder.stop();
        }
    };

    return (
        <button id="btn_control" onClick={handleBtnClick}>{btnStatus}</button>
    );
}
export default Recorder;
