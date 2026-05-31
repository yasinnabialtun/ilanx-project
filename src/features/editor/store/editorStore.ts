import { create } from "zustand";

import type {
  ArtistStyleSettings,
  DrawSettings,
  EditorTool,
  ExportOptions,
  LocationSettings,
  ObjectDataType,
  ParcelItem,
  Text3DSettings,
  TextSettings,
  ToolHint,
} from "@/shared/types";

export type CanvasLayerItem = {
  id: string;
  label: string;
  type: string;
  visible: boolean;
  locked: boolean;
};

type HistoryState = {
  history: string[];
  future: string[];
};

interface EditorStore {
  activeTool: EditorTool;
  artistStyle: ArtistStyleSettings;
  canRedo: boolean;
  canUndo: boolean;
  drawSettings: DrawSettings;
  exportOptions: ExportOptions;
  hasBackground: boolean;
  historyState: HistoryState;
  isRecordingVideo: boolean;
  isSidePanelOpen: boolean;
  locationSettings: LocationSettings;
  parcelCounter: number;
  parcels: ParcelItem[];
  polygonPointCount: number;
  selectedObjectId: string | null;
  selectedObjectType: ObjectDataType | string | null;
  text3dSettings: Text3DSettings;
  textSettings: TextSettings;
  toolHint: ToolHint | null;
  isAnimationPlaying: boolean;
  animationTime: number;
  canvasLayers: CanvasLayerItem[];
  setAnimationPlaying: (isPlaying: boolean) => void;
  setAnimationTime: (time: number) => void;
  addParcel: (parcel: ParcelItem) => void;
  incrementParcelCounter: () => void;
  nextParcelLabel: () => string;
  removeParcel: (id: string) => void;
  setArtistStyle: (style: Partial<ArtistStyleSettings>) => void;
  setDrawSettings: (settings: Partial<DrawSettings>) => void;
  setHasBackground: (hasBackground: boolean) => void;
  setHistoryState: (state: HistoryState) => void;
  setLocationSettings: (settings: Partial<LocationSettings>) => void;
  setParcels: (parcels: ParcelItem[]) => void;
  setPolygonPointCount: (count: number) => void;
  setRecordingVideo: (isRecording: boolean) => void;
  setSelectedObjectId: (id: string | null) => void;
  setSelectedObjectType: (type: ObjectDataType | string | null) => void;
  setSidePanelOpen: (isOpen: boolean) => void;
  setText3dSettings: (settings: Partial<Text3DSettings>) => void;
  setTextSettings: (settings: Partial<TextSettings>) => void;
  setTool: (tool: EditorTool) => void;
  setToolHint: (hint: ToolHint | null) => void;
  setCanvasLayers: (layers: CanvasLayerItem[]) => void;
  autosaveStatus: "idle" | "saving" | "saved";
  setAutosaveStatus: (status: "idle" | "saving" | "saved") => void;
  updateParcelLabel: (id: string, label: string) => void;
  
  // Licensing states
  isLicensed: boolean;
  licenseToken: string | null;
  licenseStatus: "active" | "expired" | "revoked" | null;
  licenseModalOpen: boolean;
  isDemoMode: boolean;
  setLicensed: (isLicensed: boolean) => void;
  setLicenseToken: (token: string | null) => void;
  setLicenseStatus: (status: "active" | "expired" | "revoked" | null) => void;
  setLicenseModalOpen: (isOpen: boolean) => void;
  setDemoMode: (isDemo: boolean) => void;
  
  // Referral System
  referralModalOpen: boolean;
  setReferralModalOpen: (isOpen: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  activeTool: "select",
  artistStyle: {
    selectionEffect: "none",
    textEffect: "none",
    effectIntensity: 5,
    effectSpeed: 5,
    glowColor: "#ffffff",
  },
  canRedo: false,
  canUndo: false,
  drawSettings: {
    strokeColor: "#22d3ee",
    fillColor: "#0ea5e9",
    strokeWidth: 2,
    fillOpacity: 0.15,
    glowEffect: "none",
    glowRadius: 15,
    glowIntensity: 5,
    pulseSpeed: 5,
    flickerSpeed: 5,
  },
  exportOptions: {
    format: "png",
    quality: "high",
    includeBackground: true,
    duration: 5,
  },
  hasBackground: false,
  historyState: { history: [], future: [] },
  isRecordingVideo: false,
  isSidePanelOpen: true,
  isAnimationPlaying: true,
  canvasLayers: [],
  animationTime: 0,
  locationSettings: {
    label: "Lokasyon",
    color: "#ef4444",
    size: 32,
    showPulse: true,
    iconType: "pin",
  },
  parcelCounter: 1,
  parcels: [],
  polygonPointCount: 0,
  selectedObjectId: null,
  selectedObjectType: null,
  text3dSettings: {
    content: "Arsa İşaretleme",
    fontSize: 84,
    color: "#fbbf24",
    depth: 10,
    fontFamily: "Montserrat",
    extrusionAngle: 45,
    skewX: 0,
    skewY: 0,
  },
  textSettings: {
    content: "Yeni Metin",
    fontSize: 36,
    color: "#facc15",
    fontFamily: "Montserrat",
    textBackgroundColor: "transparent",
  },
  toolHint: null,
  addParcel: (parcel) =>
    set((state) => ({ parcels: [...state.parcels, parcel] })),
  incrementParcelCounter: () =>
    set((state) => ({ parcelCounter: state.parcelCounter + 1 })),
  nextParcelLabel: () => `Parcel ${get().parcelCounter}`,
  removeParcel: (id) =>
    set((state) => ({
      parcels: state.parcels.filter((parcel) => parcel.id !== id),
    })),
  setArtistStyle: (style) =>
    set((state) => ({ artistStyle: { ...state.artistStyle, ...style } })),
  setDrawSettings: (settings) =>
    set((state) => ({ drawSettings: { ...state.drawSettings, ...settings } })),
  setHasBackground: (hasBackground) => set({ hasBackground }),
  setHistoryState: (historyState) =>
    set({
      historyState,
      canUndo: historyState.history.length > 1,
      canRedo: historyState.future.length > 0,
    }),
  setLocationSettings: (settings) =>
    set((state) => ({
      locationSettings: { ...state.locationSettings, ...settings },
    })),
  setParcels: (parcels) => set({ parcels }),
  setPolygonPointCount: (polygonPointCount) => set({ polygonPointCount }),
  setRecordingVideo: (isRecordingVideo) => set({ isRecordingVideo }),
  setSelectedObjectId: (selectedObjectId) => set({ selectedObjectId }),
  setSelectedObjectType: (selectedObjectType) => set({ selectedObjectType }),
  setSidePanelOpen: (isSidePanelOpen) => set({ isSidePanelOpen }),
  setAnimationPlaying: (isAnimationPlaying) => set({ isAnimationPlaying }),
  setAnimationTime: (animationTime) => set({ animationTime }),
  setText3dSettings: (settings) =>
    set((state) => ({
      text3dSettings: { ...state.text3dSettings, ...settings },
    })),
  setTextSettings: (settings) =>
    set((state) => ({ textSettings: { ...state.textSettings, ...settings } })),
  setTool: (activeTool) => set({ activeTool }),
  setToolHint: (toolHint) => set({ toolHint }),
  setCanvasLayers: (canvasLayers) => set({ canvasLayers }),
  autosaveStatus: "idle",
  setAutosaveStatus: (autosaveStatus) => set({ autosaveStatus }),
  updateParcelLabel: (id, label) =>
    set((state) => ({
      parcels: state.parcels.map((parcel) =>
        parcel.id === id ? { ...parcel, label } : parcel,
      ),
    })),
  isLicensed: false,
  licenseToken: null,
  licenseStatus: null,
  licenseModalOpen: false,
  isDemoMode: true,
  setLicensed: (isLicensed) => set({ isLicensed }),
  setLicenseToken: (licenseToken) => set({ licenseToken }),
  setLicenseStatus: (licenseStatus) => set({ licenseStatus }),
  setLicenseModalOpen: (licenseModalOpen) => set({ licenseModalOpen }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  
  referralModalOpen: false,
  setReferralModalOpen: (referralModalOpen) => set({ referralModalOpen }),
}));
