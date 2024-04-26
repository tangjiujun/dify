import React, { useEffect } from 'react';
import {init} from "./scene";
import {useSoundStore} from "@/app/store";

export const Blob: React.FC = () => {
  const {isRecording} = useSoundStore()

  useEffect(() => {
    const canvasContainer = document.getElementById('canvasContainer');
    const {renderer} = init(220,220)
    if (canvasContainer) {
      canvasContainer.appendChild(renderer.domElement);
    }
   return () => {
      if (canvasContainer) {
        canvasContainer.innerHTML = ''
      }
      renderer?.dispose?.()
   }
  }, [isRecording]);

  if (!isRecording) {
    return null;
  }
  return <div id="canvasContainer" className="fixed bottom-1/3 left-1/2 transform -translate-x-1/2"/>
};

export default React.memo(Blob)
