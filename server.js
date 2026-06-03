const { createServer } = require('http');
const { parse } = require('url');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// Check if a valid Next.js build exists
const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const hasBuild = fs.existsSync(buildIdPath);

if (!hasBuild) {
  // ============================================================
  // NO BUILD FOUND — serve a "Building..." page while compiling
  // ============================================================
  console.log('> No Next.js build found. Starting auto-build...');
  
  let logs = ['🚀 IlanX Auto-Build Started...', ''];
  let buildDone = false;
  let buildSuccess = false;

  // Serve a status page while building
  const tempServer = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html style="background:#0a0a0a; color:#22c55e; font-family:'Courier New',monospace; padding:40px;">
        <h2 style="color:#60a5fa;">🏗️ IlanX — Otomatik Kurulum</h2>
        <p style="color:#a1a1aa;">Site ilk kez başlatılıyor. Bu işlem 3-8 dakika sürebilir...</p>
        <pre style="background:#111; border:1px solid #333; border-radius:8px; padding:20px; white-space:pre-wrap; max-height:60vh; overflow-y:auto;">${logs.join('\n')}</pre>
        ${buildDone 
          ? (buildSuccess 
              ? '<h3 style="color:#22c55e;">✅ Build tamamlandı! Sayfa 10 saniye içinde otomatik yenilenecek...</h3><script>setTimeout(()=>location.reload(), 10000)</script>' 
              : '<h3 style="color:#ef4444;">❌ Build başarısız oldu. Logları kontrol edin.</h3>')
          : '<p style="color:#facc15;">⏳ Lütfen bekleyin...</p><script>setTimeout(()=>location.reload(), 5000)</script>'
        }
      </html>
    `);
  });

  tempServer.listen(port, () => {
    console.log(`> Build status page on http://localhost:${port}`);

    // Run build steps sequentially
    const steps = [
      { name: '📦 npm install', cmd: 'npm install --no-audit --no-fund' },
      { name: '🔧 prisma generate', cmd: 'npx prisma generate' },
      { name: '🗄️ prisma db push', cmd: 'npx prisma db push --accept-data-loss' },
      { name: '🏗️ next build', cmd: 'npx next build' },
    ];

    let i = 0;
    function runStep() {
      if (i >= steps.length) {
        buildDone = true;
        buildSuccess = true;
        logs.push('', '🎉 ALL TASKS COMPLETED!', '♻️ Restarting server with the new build...');
        console.log('> Build complete! Restarting...');
        
        // Close temp server and start the real Next.js server
        tempServer.close(() => {
          startNextServer();
        });
        return;
      }

      const step = steps[i];
      logs.push(`--- ${step.name} ---`);

      const child = exec(step.cmd, {
        maxBuffer: 1024 * 1024 * 50,
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'production' }
      });

      child.stdout.on('data', (d) => { 
        const line = d.toString().trim();
        if (line) { logs.push(line); console.log(line); }
      });
      child.stderr.on('data', (d) => { 
        const line = d.toString().trim();
        if (line) { logs.push('[LOG] ' + line); console.error(line); }
      });

      child.on('close', (code) => {
        if (code === 0) {
          logs.push(`✅ ${step.name} tamamlandı.`);
          i++;
          runStep();
        } else {
          logs.push(`❌ ${step.name} HATA! (exit code: ${code})`);
          buildDone = true;
          buildSuccess = false;
        }
      });
    }

    runStep();
  });

} else {
  // ============================================================
  // BUILD EXISTS — start Next.js normally
  // ============================================================
  startNextServer();
}

function startNextServer() {
  const next = require('next');
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
}
