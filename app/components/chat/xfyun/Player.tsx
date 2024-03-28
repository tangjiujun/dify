import CryptoJS from '@/utils/xfyun/crypto-js';
import { useState } from 'react';
import AudioPlayer from '@/utils/xfyun/tts.umd';
import Base64 from '@/utils/xfyun/base64'

const APPID = "0b95436f";
const API_SECRET = "NTUyNGJkYzM5YzVkZDQ1NzlmODgwYjI0";
const API_KEY = "b332d962fe2a6e1d6e4e35b2634955fe";

function getWebSocketUrl(apiKey, apiSecret) {
    var url = "wss://tts-api.xfyun.cn/v2/tts";
    var host = location.host;
    var date = new Date().toGMTString();
    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    return url;
}

function encodeText(text, type) {
    console.log('encode ' + text)
    if (type === "unicode") {
        let buf = new ArrayBuffer(text.length * 4);
        let bufView = new Uint16Array(buf);
        for (let i = 0, strlen = text.length; i < strlen; i++) {
            bufView[i] = text.charCodeAt(i);
        }
        let binary = "";
        let bytes = new Uint8Array(buf);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    } else {
        return Base64.encode(text);
    }
}

export const connectWebSocket = (text: string) => {
    let ttsWS;
    let audioPlayer;

    const url = getWebSocketUrl(API_KEY, API_SECRET);
    audioPlayer = new AudioPlayer("./tts");
    if ("WebSocket" in window) {
        ttsWS = new WebSocket(url);
    } else if ("MozWebSocket" in window) {
        ttsWS = new MozWebSocket(url);
    } else {
        alert("浏览器不支持WebSocket");
        return;
    }
    ttsWS.onopen = (e) => {
        audioPlayer.start({
            autoPlay: true,
            sampleRate: 16000,
            resumePlayDuration: 1000
        });
        var tte = "UTF8";
        var params = {
            common: {
                app_id: APPID,
            },
            business: {
                aue: "raw",
                auf: "audio/L16;rate=16000",
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
        };
        ttsWS.send(JSON.stringify(params));
    };
    ttsWS.onmessage = (e) => {
        let jsonData = JSON.parse(e.data);
        // 合成失败
        if (jsonData.code !== 0) {
            console.error(jsonData);
            return;
        }
        audioPlayer.postMessage({
            type: "base64",
            data: jsonData.data.audio,
            isLastData: jsonData.data.status === 2,
        });
        if (jsonData.code === 0 && jsonData.data.status === 2) {
            ttsWS.close();
        }
    };
    ttsWS.onerror = (e) => {
        console.error(e);
    };
    ttsWS.onclose = (e) => {
        console.log(e);
    };
}
