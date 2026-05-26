# Hata Giderme (Troubleshooting) Dokümantasyonu

Bu belge, uygulamada karşılaşılabilecek yaygın kararlılık sorunlarını, çakışmaları ve bunların çözümlerini içerir.

## 1. Çoklu Sekme Çakışmaları (Multi-tab Conflicts)
*   **Sorun:** Aynı projeyi birden fazla tarayıcı sekmesinde açıp düzenlemek, `localStorage` üzerindeki autosave verilerinin birbirinin üstüne yazılmasına ve veri kayıplarına yol açar.
*   **Çözüm:** `ilanx` sekmeler arası aktifliği izlemek için tab-session ID ve timestamp kontrolü yapar. Başka sekmeyle çakışma algılandığında ekranı kaplayan bir uyarı penceresi çıkar.
*   **Aksiyon:** Çakışma uyarısı aldığınızda diğer sekmedeki çalışmanızı bitirin veya bu sekmelerden birini kapatın.

## 2. Yarım Kalan Çalışmayı Kurtarma (Project Recovery)
*   **Sorun:** Sayfa kazara yenilendiğinde veya tarayıcı çöktüğünde çalışmanın kaybolması.
*   **Çözüm:** Editör her işlemde projeyi yerel depolamaya yedekler. Sayfa yüklendiğinde yedek tespit edilirse sol altta glassmorphic bir kurtarma bildirimi belirir.
*   **Aksiyon:** Önceki çalışmanızı yüklemek için "Geri Yükle"ye tıklayabilir veya temiz bir sayfa açmak için "Temizle" diyebilirsiniz.

## 3. WebGL ve Canvas Çökmeleri (Error Boundary)
*   **Sorun:** Büyük görseller işlenirken tarayıcının WebGL bağlamını (context) kaybetmesi veya Fabric.js'in hata vermesi sonucu tüm uygulamanın beyaz ekran olması.
*   **Çözüm:** Editörün ana tuvali `ErrorBoundary` bileşeni ile sarmalanmıştır.
*   **Aksiyon:** Kritik bir hata durumunda uygulama tamamen çökmez; kullanıcıya hata bilgisi gösterilir ve "Editörü Sıfırla" veya "Kurtarma Dosyasını İndir" butonları sunularak çalışmanın kurtarılması sağlanır.

## 4. Mobil Safari (iOS) Hafıza Limitleri ve Donmalar
*   **Sorun:** iOS cihazlarda 5 saniyeden uzun video kaydı alırken tarayıcı sekmesinin kendiliğinden kapanması/yenilenmesi.
*   **Aksiyon:** 
    1.  Cihaz belleğini korumak için dışa aktarma kalitesini "Düşük (Low)" veya "Orta (Medium)" seçin.
    2.  Arka plana yüklediğiniz görsellerin çözünürlüğünü optimize edin. Editör zaten görselleri yüklerken otomatik olarak maksimum 2400px genişliğe küçültür.
