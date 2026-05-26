# Dışa Aktarma (Export) Hattı Dokümantasyonu

Bu belge; PNG, PDF ve MP4/WebM video kayıt işlerinin arkasındaki teknik yapıyı ve mobil hafıza limitleri korumalarını açıklar.

## 1. PNG Dışa Aktarma (1:1 Native Resolution)
Kullanıcı tuvali yakınlaştırıp uzaklaştırsa veya kaydırsa dahi, PNG çıktısı her zaman orijinal arka plan görselinin orijinal piksel boyutlarında (1:1) üretilir:
*   Kayıt başlamadan önce seçili nesne sınırlarının çıktıda görünmemesi için aktif seçim kaldırılır (`discardActiveObject`).
*   Tuvalin bakış alanı (viewport transform) geçici olarak kimlik matrisine `[1, 0, 0, 1, 0, 0]` çekilir.
*   Arka plan görselinin koordinat sınırları (`left`, `top`, `width`, `height`) Fabric.js `toDataURL` fonksiyonuna beslenir.
*   Dışa aktarma bittikten sonra eski bakış açısı ve aktif seçim kullanıcı hissetmeden geri yüklenir.

## 2. PDF Dışa Aktarma (jsPDF)
*   Arka plan görselinin yönüne göre (Yatay / Dikey) otomatik PDF sayfa yönelimi (`orientation`) seçilir.
*   Tuval 0.95 kaliteyle yüksek çözünürlüklü bir JPEG formatına çevrilir.
*   `jspdf` kütüphanesi kullanılarak pikseller orijinal en-boy oranı korunarak sayfaya basılır.

## 3. Video Dışa Aktarma (MediaRecorder API)
Animasyonlu çizimleri video olarak indirmek için tarayıcının `captureStream` ve `MediaRecorder` API'leri birleştirilmiştir.

```
+----------------------------------------------------+
|  Initialize: Discard Selection & Save Viewport     |
+----------------------------------------------------+
                          |
                          v
+----------------------------------------------------+
|  Adjust Resolution:                                |
|  - Low: 854px | Medium: 1280px | High: 1920px     |
|  - Capped to 720p on mobile to prevent RAM crashes |
|  - Force even width/height (multiple of 2)         |
+----------------------------------------------------+
                          |
                          v
+----------------------------------------------------+
|  Start Recording:                                  |
|  - Auto-select codec (WebM VP9 or MP4 AVC1)        |
|  - Force fixed timeline steps (1000/30 ms)         |
+----------------------------------------------------+
                          |
                          v
+----------------------------------------------------+
|  Finish: Restore Canvas Viewport & Save File       |
+----------------------------------------------------+
```

### Deterministik Kare İlerletme (Fixed-step Frame Advancing)
İşlemci veya grafik kartı üzerindeki anlık yüklenmeler normal oynatma sırasında kare atlamalarına (lag) neden olabilir. 
Bunun dışa aktarılan videoda atlamalara yol açmasını önlemek için, video kaydı açıkken zaman çizgisi delta-zaman yerine **sabit 30 FPS adımlarıyla (`1000 / 30` ms)** ilerletilir. Bu sayede tarayıcı ne kadar yavaş çalışırsa çalışsın, üretilen video kusursuz akıcılıkta olur.

### Mobil Tarayıcı Bellek Limitleri (Safari / iOS)
Mobil tarayıcılarda RAM şişmesi sonucu sekmenin çökmesini (OOM - Out of Memory) önlemek için:
*   Mobil cihazlarda video çözünürlüğü otomatik olarak maksimum **720p (1280px)** ile sınırlandırılır.
*   Görsel boyutları tek sayı ise kodlayıcı (encoder) hatalarını engellemek için genişlik ve yükseklik çift sayıya yuvarlanır (+1px eklenerek).
