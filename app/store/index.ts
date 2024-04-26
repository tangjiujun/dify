import create from 'zustand';

type SoundState = {
    isPlaying: boolean;
    isRecording: boolean;
    startPlay: () => void;
    endPlay: () => void;
    startRecord: () => void;
    endRecord: () => void;
};

export const useSoundStore = create<SoundState>((set) => ({
    isPlaying: false,
    isRecording: false,
    startPlay: () => set(() => ({ isPlaying: true })),
    endPlay: () => set(() => ({ isPlaying: false })),
    startRecord: () => set(() => ({ isRecording: true })),
    endRecord: () => set(() => ({ isRecording: false })),
}));
