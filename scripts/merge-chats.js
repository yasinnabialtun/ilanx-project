const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\yasin\\.gemini\\antigravity\\brain';
const outputFile = path.join(__dirname, '..', 'tum_sohbetler.md');

console.log('🔍 Sohbet günlükleri aranıyor...');

if (!fs.existsSync(brainDir)) {
  console.error('❌ Brain klasörü bulunamadı:', brainDir);
  process.exit(1);
}

const folders = fs.readdirSync(brainDir).filter(f => {
  return fs.statSync(path.join(brainDir, f)).isDirectory() && f !== 'tempmediaStorage';
});

console.log(`📁 Toplam ${folders.length} adet potansiyel sohbet klasörü bulundu.`);

let allMessages = [];

folders.forEach(folder => {
  const transcriptPath = path.join(brainDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(transcriptPath)) return;

  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      
      const step = JSON.parse(line);
      const timestamp = step.created_at || step.timestamp;
      
      if (!timestamp) return;

      // Extract user inputs
      if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
        allMessages.push({
          timestamp: new Date(timestamp),
          role: 'Kullanıcı',
          content: step.content,
          conversationId: folder
        });
      }
      
      // Extract model outputs (if they contain actual text content)
      if (step.source === 'MODEL' && step.content && typeof step.content === 'string' && step.content.trim()) {
        // Skip technical or system-only logs if they don't contain real answers
        if (step.content.includes('"tool_calls"') || step.content.startsWith('{"step_index"')) return;
        
        allMessages.push({
          timestamp: new Date(timestamp),
          role: 'Yapay Zeka',
          content: step.content,
          conversationId: folder
        });
      }
    });
  } catch (err) {
    console.warn(`⚠️ ${folder} klasörü okunurken hata oluştu (atlandı):`, err.message);
  }
});

// Sort messages chronologically
allMessages.sort((a, b) => a.timestamp - b.timestamp);

console.log(`💬 Toplam ${allMessages.length} adet mesaj toplandı. Markdown yazılıyor...`);

let mdContent = `# 📚 Tüm Sohbet Geçmişi (Konsolide)\n\n`;
mdContent += `Bu dosya, projedeki tüm farklı sohbet oturumlarının kronolojik sırayla birleştirilmesiyle oluşturulmuştur.\n\n`;

let lastDateStr = '';

allMessages.forEach(msg => {
  const dateStr = msg.timestamp.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const timeStr = msg.timestamp.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (dateStr !== lastDateStr) {
    mdContent += `\n## 📅 ${dateStr}\n\n`;
    lastDateStr = dateStr;
  }

  mdContent += `### 👤 ${msg.role} (${timeStr})\n`;
  mdContent += `> *Sohbet ID: [${msg.conversationId.substring(0, 8)}](file:///${path.join(brainDir, msg.conversationId).replace(/\\/g, '/')})*\n\n`;
  
  // Format content nicely
  mdContent += `${msg.content}\n\n`;
  mdContent += `---\n\n`;
});

fs.writeFileSync(outputFile, mdContent, 'utf8');
console.log(`✅ BAŞARILI! Tüm geçmiş "${outputFile}" dosyasına yazıldı.`);
