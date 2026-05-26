# Render ve Animasyon Pipeline Dokümantasyonu

Bu belge, `ilanx` üzerindeki canlı neon efektleri, 3D metin gölgeleri ve yüksek hızlı render döngüsünün çalışma mantığını açıklar.

## Animasyon Döngüsü (RequestAnimationFrame)

Editör, animasyonları çalıştırmak için tarayıcının yerel `requestAnimationFrame` (RAF) API'sini kullanan tekil bir döngü barındırır. Bu döngü, seçili nesnelerin kenar taramalarını, konum işaretçilerinin pulsasyon hareketlerini ve metin efektlerini gerçek zamanlı günceller.

```
+--------------------------------------------------+
|            requestAnimationFrame Loop            |
+--------------------------------------------------+
                          |
                          v
           +------------------------------+
           |   telemetry.registerFrame()  |
           +------------------------------+
                          |
                          v
       +--------------------------------------+
       |   State Check: Paused & Idle?        |
       |   (Yes -> Bypass Rendering/CPU)      |
       +--------------------------------------+
                          |
                          v
  +------------------------------------------------+
  | Update live texts (typewriter, wave, neon)     |
  +------------------------------------------------+
                          |
                          v
  +------------------------------------------------+
  | Mutate shadows (Pulse, Flicker, Saber, Bloom)  |
  +------------------------------------------------+
                          |
                          v
           +------------------------------+
           |    canvas.requestRenderAll() |
           +------------------------------+
```

## Performans Optimizasyonları

### 1. Sıfır GC (Garbage Collector) Yükü ile Gölge Efektleri
Geleneksel render motorlarında, her karede `new Shadow({...})` şeklinde nesne tahsis etmek (allocation) Garbage Collector üzerinde yoğun yük oluşturur ve takılmalara (jank) yol açar.
`ilanx` bu problemi aşmak için **Gölge Mutasyonu** yöntemini uygular:
*   Nesnenin halihazırda bir gölgesi yoksa tek bir kereye mahsus `Shadow` nesnesi oluşturulur.
*   Sonraki tüm karelerde, mevcut `obj.shadow.color` ve `obj.shadow.blur` değerleri doğrudan mutasyona uğratılır.
*   Bu sayede döngü esnasında bellek tahsisi **%0**'a indirilmiştir.

### 2. Sıfır Boşta Çalışma (Idle) Yükü
Animasyon oynatılmıyorsa (paused), zaman çizgisi kaydırılmıyorsa (scrubbing değil) ve çizim ayarları değişmemişse render döngüsü ağır Fabric.js işlemlerini tamamen pas geçer (**bypass**). Bu sayede editör açıkken bilgisayarın CPU/GPU kullanımı sıfıra yakındır.

### 3. Zaman Çizgisi Doğrudan DOM Güncellemeleri
React durum güncellemeleri bileşenleri baştan çizdiği için yüksek frekanslı kaydırma işlemlerinde gecikmeye yol açar. Zaman çizgisinin (timeline slider) saniye sayacı ve ilerleme çubuğu, React render döngüsünü tamamen aşarak `timelineRegistry` aracılığıyla **doğrudan DOM manipülasyonu** ile güncellenir.
