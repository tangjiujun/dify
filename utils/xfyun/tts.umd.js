!(function (t, i) {
  typeof exports == 'object' && typeof module != 'undefined' ? module.exports = i() : typeof define == 'function' && define.amd ? define(i) : (t = typeof globalThis != 'undefined' ? globalThis : t || self).AudioPlayer = i()
}(this, () => {
  'use strict'

  function t(t, i, a) {
    for (let e = 0; e < a.length; e++) t.setUint8(i + e, a.charCodeAt(e))
  }

  function i(i, a, e) {
    const o = (function (i, a, e, o, s) {
      const n = i.reduce((t, i) => {
        return t + i.byteLength
      }, 0); const u = new ArrayBuffer(44 + n); const r = new DataView(u); const d = e; let h = 0
      return t(r, h, 'RIFF'), h += 4, r.setUint32(h, 36 + n, !0), t(r, h += 4, 'WAVE'), t(r, h += 4, 'fmt '), h += 4, r.setUint32(h, 16, !0), h += 4, r.setUint16(h, 1, !0), h += 2, r.setUint16(h, d, !0), h += 2, r.setUint32(h, a, !0), h += 4, r.setUint32(h, d * a * (o / 8), !0), h += 4, r.setUint16(h, d * (o / 8), !0), h += 2, r.setUint16(h, o, !0), t(r, h += 2, 'data'), h += 4, r.setUint32(h, n, !0), h += 4, i.forEach((t) => {
        for (let i = new DataView(t.buffer), a = 0; a < t.byteLength;) r.setUint8(h, i.getUint8(a)), h++, a++
      }), r
    }(i, a || 16e3, 1, e || 16))
    return new Blob([o], { type: 'audio/wav' })
  }

  return (function () {
    function t(t) {
      this.toSampleRate = 22050, this.resumePlayDuration = 1e3, this.fromSampleRate = 16e3, this.isAudioDataEnded = !1, this.status = 'uninit', this.audioDatas = [], this.pcmAudioDatas = [], this.audioDataOffset = 0, this.processor = new Worker(''.concat(t, '/processor.worker.js'))
    }

    return t.prototype.postMessage = function (t) {
      const i = t.type; const a = t.data; const e = t.isLastData
      this.status !== 'uninit' && (this.processor.postMessage({ type: i, data: a }), this.isAudioDataEnded = e)
    }, t.prototype.playAudio = function () {
      const t = this
      if (clearTimeout(this.playAudioTime), this.audioContext) {
        for (var i = 0, a = this.audioDataOffset; a < this.audioDatas.length; a++) i += this.audioDatas[a].length
        if (!i) {
          return void (this.status === 'play' && (this.isAudioDataEnded || this.resumePlayDuration <= 0
            ? this.stop()
            : this.playAudioTime = setTimeout(() => {
              t.playAudio()
            }, this.resumePlayDuration)))
        }
        for (var e = this.audioContext.createBuffer(1, i, this.toSampleRate), o = e.getChannelData(0), s = this.audioDatas[this.audioDataOffset], n = 0; s;) {
          if (this.audioDataOffset += 1, e.copyToChannel)
            e.copyToChannel(s, 0, n), n += s.length; else for (a = 0; a < s.length; a++) o[a] = s[a]
          s = this.audioDatas[this.audioDataOffset]
        }
        const u = this.audioContext.createBufferSource()
        this.bufferSource = u, u.buffer = e, u.connect(this.audioContext.destination), u.start(), u.onended = function (i) {
          t.status === 'play' && (t.audioDatas.length
            ? t.playAudio()
            : t.isAudioDataEnded || t.resumePlayDuration <= 0
              ? t.stop()
              : t.playAudioTime = setTimeout(() => {
                t.playAudio()
              }, t.resumePlayDuration))
        }
      }
    }, t.prototype.reset = function () {
      let t
      this.processor.onmessage = null, this.audioDataOffset = 0, this.audioDatas = [], this.pcmAudioDatas = [], this.status = 'uninit', this.isAudioDataEnded = !1, clearTimeout(this.playAudioTime)
      try {
        (t = this.bufferSource) === null || void 0 === t || t.stop()
      }
      catch (t) {
        console.log(t)
      }
    }, t.prototype.start = function (t) {
      const i = this; const a = void 0 === t ? {} : t; const e = a.autoPlay; const o = void 0 === e || e; const s = a.sampleRate
      const n = void 0 === s ? 16e3 : s; const u = a.resumePlayDuration; const r = void 0 === u ? 1e3 : u
      this.reset(), this.status = 'init', this.resumePlayDuration = r
      const d = n; let h = Math.max(d, 22050)
      h = Math.min(h, 96e3), this.fromSampleRate = d, this.toSampleRate = h, this.processor.postMessage({
        type: 'init',
        data: { fromSampleRate: d, toSampleRate: h },
      }), this.processor.onmessage = function (t) {
        const a = t.data; const e = a.audioData; const s = a.pcmAudioData
        i.audioDatas.push(e), i.pcmAudioDatas.push(s), i.audioDatas.length === 1 && o && i.status === 'init' && i.play()
      }
    }, t.prototype.play = function () {
      let t
      this.audioContext || (this.audioContext = new (window.AudioContext || window.webkitAudioContext)(), this.audioContext.resume()), this.audioContext && (this.status = 'play', (t = this.onPlay) === null || void 0 === t || t.call(this), this.playAudio())
    }, t.prototype.stop = function () {
      let t, i
      this.audioDataOffset = 0, this.status = 'stop', clearTimeout(this.playAudioTime)
      try {
        (t = this.bufferSource) === null || void 0 === t || t.stop(), (i = this.onStop) === null || void 0 === i || i.call(this, this.audioDatas)
      }
      catch (t) {
        console.log(t)
      }
    }, t.prototype.getAudioDataBlob = function (t) {
      let a, e
      if ((a = this.pcmAudioDatas) === null || void 0 === a ? void 0 : a.length)
        return t === 'wav' ? i(this.pcmAudioDatas, this.fromSampleRate, 16) : (e = this.pcmAudioDatas, new Blob(e, { type: 'audio/pcm' }))
    }, t
  }())
}))
