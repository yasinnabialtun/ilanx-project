# ilanx — Arsa & Gayrimenkul İşaretleme Editörü

**ilanx**, tarayıcı üzerinde çalışan, arsa ve gayrimenkul görsellerine profesyonel işaretleme, çizim ve animasyon eklemeye yarayan **production-grade** bir web uygulamasıdır.

---

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm run start
```

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16.2.6 (App Router + Turbopack) |
| UI Runtime | React 19 |
| Canvas Engine | Fabric.js v7 |
| State Management | Zustand v5 |
| Styling | TailwindCSS v4 + shadcn/ui |
| Animasyon | Framer Motion v12 |
| PDF Export | jsPDF v4 |
| Video Export | MediaRecorder API (WebM/MP4) |
| Language | TypeScript 5 (strict mode) |

---

## 📁 Proje Yapısı

```
src/
├── app/                        # Next.js App Router sayfaları
│   ├── page.tsx                # Landing page (/)
│   └── editor/
│       └── page.tsx            # Editör sayfası (/editor)
│
├── core/                       # Uygulama çapında altyapı
│   ├── components/
│   │   └── theme-toggle.tsx    # Dark/Light mode toggle
│   ├── providers/              # Global providers (ThemeProvider)
│   └── utils/
│       └── telemetry.ts        # FPS tracker & ring-buffer logger
│
├── features/
│   ├── editor/                 # Ana editör özellik modülü
│   │   ├── components/         # UI bileşenleri
│   │   │   ├── PhotoEditor.tsx         # Root layout + modal yönetimi
│   │   │   ├── Toolbar.tsx             # Üst araç çubuğu
│   │   │   ├── SidePanel.tsx           # Özellikler & Katman paneli
│   │   │   ├── CanvasContainer.tsx     # Canvas sarmalayıcı
│   │   │   ├── EditorCanvas.tsx        # Canvas mount noktası
│   │   │   ├── TimelineControls.tsx    # Animasyon zaman çizgisi
│   │   │   ├── ImageUploadArea.tsx     # Drag-drop görsel yükleme
│   │   │   ├── EmptyState.tsx          # Boş durum ekranı
│   │   │   └── panels/                 # Araç ayar panelleri
│   │   │       ├── DrawSettingsPanel.tsx
│   │   │       ├── TextSettingsPanel.tsx
│   │   │       ├── Text3DSettingsPanel.tsx
│   │   │       ├── LocationSettingsPanel.tsx
│   │   │       ├── AnimationSettingsPanel.tsx
│   │   │       ├── LogoPanel.tsx
│   │   │       └── StickerPanel.tsx
│   │   ├── hooks/
│   │   │   ├── use-canvas-tools.ts     # Canvas event yönetimi & çizim araçları
│   │   │   └── use-canvas-sync.ts      # State ↔ Canvas senkronizasyonu
│   │   ├── store/
│   │   │   └── editorStore.ts          # Zustand global state
│   │   ├── utils/
│   │   │   ├── canvas-api.ts           # Canvas public API (export, undo, layers)
│   │   │   ├── shapes.ts               # Fabric nesne fabrikaları
│   │   │   ├── history.ts              # Undo/Redo sistemi
│   │   │   ├── stickers.ts             # SVG etiket kütüphanesi
│   │   │   ├── sync-parcels.ts         # Canvas → Store parsel senkronizasyonu
│   │   │   └── timeline-registry.ts    # Animasyon zaman çizgisi kaydı
│   │   └── config/
│   │       └── colors.ts               # Renk yardımcı fonksiyonları
│   │
│   ├── animations/             # Animasyon sistemleri
│   │   └── utils/
│   │       ├── energy-beam.ts          # Saber/Neon glow renderer
│   │       └── text-3d.ts             # 3D metin oluşturma & güncelleme
│   │
│   ├── export/                 # Dışa aktarma modülü
│   │   └── utils/
│   │       └── export-image.ts         # PNG, PDF, Video export pipeline'ları
│   │
│   └── landing/                # Landing page bileşenleri
│
└── shared/                     # Paylaşılan tipler & UI bileşenleri
    ├── types/                  # TypeScript tip tanımları
    └── components/
        └── ui/                 # shadcn/ui bileşenleri
```

---

## ✨ Özellikler

### Çizim Araçları
- **Parsel (Polygon)** — Vertex editing, kapatma (Enter), iptal (Esc)
- **Dikdörtgen, Daire, Çizgi, Ok** — Sürükle-bırak çizim
- **Kalem (Pencil)** — Serbest el çizimi

### Metin & İşaretleme
- **IText** — Çift tıkla düzenlenebilir metin
- **3D Metin** — Perspektif gölge efektli yazı
- **Lokasyon İşaretçisi** — Animasyonlu pin + etiket
- **Logo** — Görsel yükleme
- **Etiketler (Stickers)** — SVG ikon kütüphanesi

### Efekt & Animasyon Sistemi
| Efekt | Açıklama |
|-------|----------|
| Glow / Neon | Fabric.js Shadow tabanlı parlama |
| Saber / Energy Beam | Kenara özel canvas overlay çizimi |
| Pulse | Opaklık animasyonu |
| Border Spin | Dönen çerçeve efekti |
| Scan Line | Tarama çizgisi animasyonu |
| Pen Draw | Kademeli çizim görünümü |

### Katman Yönetimi
- Tüm canvas nesneleri **Katman Paneli**'nde listelenir
- Her katman için: **Gizle/Göster**, **Kilitle/Aç**, **Sil**, **Seç**
- Nesne eklenip silindiğinde liste anında güncellenir

### Timeline & Animasyon
- 0–10 saniye zaman çizgisi
- Play / Pause / Scrub kontrolü
- Deterministic 30fps video kaydı (MediaRecorder)

### Dışa Aktarma
- **PNG** — Yüksek çözünürlük, tam şeffaf arka plan desteği
- **PDF** — A4 sayfa boyutunda JPEG embed
- **Video (WebM/MP4)** — Animasyonlu dışa aktarma, overlay kilidi

### Proje Yönetimi
- **Autosave** — Her değişiklikte localStorage'a kaydeder
- **Proje Kurtarma** — Sayfa yenileme sonrası yarım kalan çalışma teklifi
- **JSON İçe/Dışa Aktar** — Tam canvas state serialize/deserialize
- **Multi-tab Koruması** — Aynı anda iki sekmede düzenlemeye karşı uyarı

---

## ⌨️ Klavye Kısayolları

| Kısayol | Eylem |
|---------|-------|
| `Ctrl + Z` | Geri Al |
| `Ctrl + Y` | Yinele |
| `Ctrl + C` | Kopyala |
| `Ctrl + V` | Yapıştır |
| `Delete / Backspace` | Seçili nesneyi sil |
| `Esc` | Çizimi iptal et (Polygon) |
| `Enter` | Çizimi kapat (Polygon) |
| `Ctrl + Wheel` | Yakınlaştır / Uzaklaştır |
| `Shift + ?` | Kısayollar modalını aç |

---

## 🏗️ Mimari Prensipler

- **Feature-based Domain Structure** — Her özellik kendi klasöründe izole
- **Clean Architecture** — Core → Features → Shared katman hiyerarşisi
- **Zero Magic Strings** — Tüm sabitler tip-güvenli
- **Render Bypass** — Canvas boşta olduğunda animasyon loop'u durdurulur (CPU ≈ 0%)
- **GC-aware Shadow** — 60fps animasyonlarda Shadow nesnesi yeniden oluşturulmaz, mutate edilir
- **Deterministic Video** — Export sırasında `1000/30ms` sabit adımlama (sistem gecikmesinden bağımsız)

---

## 📊 Performans Hedefleri

| Metrik | Hedef | Mevcut |
|--------|-------|--------|
| Editör yüklenme | < 1s | ~850ms ✅ |
| Çizim latency | < 16ms | < 16ms ✅ |
| Animasyon FPS | 60fps | ~60fps ✅ |
| Boşta CPU | ~0% | ~0% ✅ |
| TypeScript hataları | 0 | 0 ✅ |
| Build süresi | < 10s | ~5s ✅ |

---

## 🔒 Güvenlik & Kararlılık

- localStorage verileri JSON.parse() doğrulamasından geçer
- Görsel yükleme: sadece JPEG, PNG, WEBP — max 4MB, otomatik resize
- Video export sırasında toolbar tamamen kilitlenir
- Multi-tab çakışma koruması (session ID tabanlı)

---

## 📄 Lisans

Özel kullanım. Tüm hakları saklıdır.