const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 cPanel için özel derleme başlatılıyor...');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
const serverJsPath = path.join(standaloneDir, 'server.js');

// 1. Port hatasını (parseInt) düzelt
if (fs.existsSync(serverJsPath)) {
  console.log('🔧 server.js dosyasındaki PORT okuma hatası düzeltiliyor...');
  let serverJs = fs.readFileSync(serverJsPath, 'utf8');
  serverJs = serverJs.replace(
    'const currentPort = parseInt(process.env.PORT, 10) || 3000',
    'const currentPort = process.env.PORT || 3000'
  );
  fs.writeFileSync(serverJsPath, serverJs, 'utf8');
} else {
  console.error('❌ server.js bulunamadı! Önce npm run build yapmalısınız.');
  process.exit(1);
}

// 2. Klasörleri kopyala
const copyRecursiveSync = function(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

console.log('📂 public ve .next/static klasörleri standalone içine kopyalanıyor...');
copyRecursiveSync(path.join(__dirname, '..', 'public'), path.join(standaloneDir, 'public'));
copyRecursiveSync(path.join(__dirname, '..', '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

// 3. tar.gz oluştur
console.log('🗜️ ilanx_guncel_surum.tar.gz dosyası oluşturuluyor (Bu biraz sürebilir)...');
try {
  const dataPath = path.join(standaloneDir, '.data');
  if (fs.existsSync(dataPath)) {
    fs.rmSync(dataPath, { recursive: true, force: true });
    console.log('🧹 .data klasörü paketten çıkarıldı (Canlı veriler ezilmesin diye).');
  }

  const desktopPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop', 'ilanx_guncel_surum.tar.gz');
  execSync(`tar -a -c -f "${desktopPath}" -C "${standaloneDir}" *`, { stdio: 'inherit' });
  console.log(`✅ BAŞARILI! Masaüstünüzde "ilanx_guncel_surum.tar.gz" oluşturuldu.`);
  console.log("🚀 Bu dosyayı cPanel'e yükleyip Extract edin ve Restart tuşuna basın.");
} catch (error) {
  console.error('❌ ZIP oluşturulurken hata oluştu:', error.message);
}
