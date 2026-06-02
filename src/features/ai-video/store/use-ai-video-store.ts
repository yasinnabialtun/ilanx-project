import { create } from 'zustand';

export type VideoFormat = '16:9' | '9:16' | '1:1';
export type VideoDuration = 5 | 10 | 15 | 30;
export type VideoTemplate = 'dynamic' | 'cinematic' | 'luxury' | 'slideshow';
export type VideoMusic = 'none' | 'tiktok_trend' | 'luxury_beat' | 'ambient';
export type SubtitleStyle = 'none' | 'dynamic' | 'cinematic';

export interface AIVideoState {
  images: string[]; // Base64 or object URLs
  format: VideoFormat;
  duration: VideoDuration;
  template: VideoTemplate;
  music: VideoMusic;
  prompt: string;
  showLogo: boolean;
  subtitleStyle: SubtitleStyle;
  credits: number;
  isGenerating: boolean;
  generationProgress: number;
  generationStep: string;
  resultVideoUrl: string | null;

  // Actions
  addImages: (newImages: string[]) => void;
  removeImage: (index: number) => void;
  setFormat: (format: VideoFormat) => void;
  setDuration: (duration: VideoDuration) => void;
  setTemplate: (template: VideoTemplate) => void;
  setMusic: (music: VideoMusic) => void;
  setPrompt: (prompt: string) => void;
  setShowLogo: (show: boolean) => void;
  setSubtitleStyle: (style: SubtitleStyle) => void;
  setCredits: (credits: number) => void;
  startGeneration: () => void;
  setGenerationProgress: (progress: number, step: string) => void;
  setResultVideoUrl: (url: string) => void;
  reset: () => void;
}

export const useAIVideoStore = create<AIVideoState>((set) => ({
  images: [],
  format: '9:16',
  duration: 15,
  template: 'dynamic',
  music: 'tiktok_trend',
  prompt: '',
  showLogo: true,
  subtitleStyle: 'dynamic',
  credits: 0, // Start with 0 to trigger paywall
  isGenerating: false,
  generationProgress: 0,
  generationStep: '',
  resultVideoUrl: null,

  addImages: (newImages) =>
    set((state) => ({ images: [...state.images, ...newImages] })),
    
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),

  setFormat: (format) => set({ format }),
  setDuration: (duration) => set({ duration }),
  setTemplate: (template) => set({ template }),
  setMusic: (music) => set({ music }),
  setPrompt: (prompt) => set({ prompt }),
  setShowLogo: (showLogo) => set({ showLogo }),
  setSubtitleStyle: (subtitleStyle) => set({ subtitleStyle }),
  setCredits: (credits) => set({ credits }),

  startGeneration: () =>
    set({
      isGenerating: true,
      generationProgress: 0,
      generationStep: 'Görseller analiz ediliyor...',
      resultVideoUrl: null,
    }),

  setGenerationProgress: (progress, step) =>
    set({ generationProgress: progress, generationStep: step }),

  setResultVideoUrl: (url) =>
    set({
      resultVideoUrl: url,
      isGenerating: false,
      generationProgress: 100,
      generationStep: 'Video hazır!',
    }),

  reset: () =>
    set({
      images: [],
      format: '9:16',
      duration: 15,
      template: 'dynamic',
      music: 'tiktok_trend',
      prompt: '',
      showLogo: true,
      subtitleStyle: 'dynamic',
      isGenerating: false,
      generationProgress: 0,
      generationStep: '',
      resultVideoUrl: null,
    }),
}));
