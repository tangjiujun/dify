'use client'
import React, { useEffect, useRef } from 'react'
// @ts-expect-error
import * as SineWaves from 'sine-waves'

const Sound: React.FC = () => {
  const wavesRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const waves = new SineWaves({
      el: wavesRef.current!,
      speed: 8,
      ease: 'SineInOut',
      wavesWidth: '80%',
      waves: [
        {
          timeModifier: 4,
          lineWidth: 2,
          amplitude: -25,
          wavelength: 25,
        },
        {
          timeModifier: 2,
          lineWidth: 2,
          amplitude: -10,
          wavelength: 30,
        },
        {
          timeModifier: 1,
          lineWidth: 2,
          amplitude: -30,
          wavelength: 30,
        },
        {
          timeModifier: 3,
          lineWidth: 2,
          amplitude: 40,
          wavelength: 40,
        },
        {
          timeModifier: 0.5,
          lineWidth: 2,
          amplitude: -60,
          wavelength: 60,
        },
        {
          timeModifier: 1.3,
          lineWidth: 2,
          amplitude: -40,
          wavelength: 40,
        },
      ],
      resizeEvent() {
        let gradient = this.ctx.createLinearGradient(0, 0, this.width, 0)
        gradient.addColorStop(0, 'rgba(25, 255, 255, 0)')
        gradient.addColorStop(0.5, 'rgba(255, 25, 255, 0.75)')
        gradient.addColorStop(1, 'rgba(255, 255, 25, 0')

        let index = -1
        let length = this.waves.length
        while (++index < length)
          this.waves[index].strokeStyle = gradient
        // Clean Up
        index = 0
        length = 0
        gradient = 0
      },
    })
  }, [])

  return <canvas width={500} ref={wavesRef}/>
}

export default React.memo(Sound)
