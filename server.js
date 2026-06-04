const { createServer } = require('http');
const { parse } = require('url');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// Check if a valid Next.js build exists
const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const forceBuildPath = path.join(__dirname, 'force-build.txt');
const hasBuild = fs.existsSync(buildIdPath);
const forceBuild = fs.existsSync(forceBuildPath);

if (!hasBuild || forceBuild) {
  // ============================================================
  // NO BUILD FOUND or FORCE BUILD — serve a "Building..." page while compiling
  // ============================================================
  console.log(`> Starting auto-build (hasBuild: ${hasBuild}, forceBuild: ${forceBuild})...`);
  
  // Clean old build folders and node_modules for clean installation
  try {
    const nodeModulesDir = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) {
      fs.rmSync(nodeModulesDir, { recursive: true, force: true });
      console.log('> Deleted old node_modules directory for clean installation.');
    }
  } catch (err) {
    console.error('> Error deleting node_modules directory:', err.message);
  }

  if (forceBuild) {
    try {
      const nextDir = path.join(__dirname, '.next');
      if (fs.existsSync(nextDir)) {
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('> Deleted old .next directory for clean forced build.');
      }
    } catch (err) {
      console.error('> Error deleting .next directory:', err.message);
    }
    try {
      fs.unlinkSync(forceBuildPath);
      console.log('> Deleted force-build.txt');
    } catch (err) {
      console.error('> Error deleting force-build.txt:', err.message);
    }
  }
  
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
    const maxPollTime = 15 * 60 * 1000;
    const steps = [
      { name: '📦 npm install', cmd: 'npm install --no-audit --no-fund' },
      { name: '🔧 prisma generate', cmd: 'npx prisma generate' },
      { name: '🗄️ prisma db push', cmd: 'npx prisma db push' },
      { name: '🏗️ next build', cmd: 'npx next build --webpack' },
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

      const stepEnv = { ...process.env, NEXT_DISABLE_TURBOPACK: '1' };
      if (step.name.includes('npm install')) {
        stepEnv.NODE_ENV = 'development';
      } else {
        stepEnv.NODE_ENV = 'production';
      }

      const child = exec(step.cmd, {
        maxBuffer: 1024 * 1024 * 50,
        cwd: __dirname,
        env: stepEnv
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

      // Raw, uncompiled diagnostic endpoint bypassing Next.js
      if (parsedUrl.pathname === '/api/debug-raw') {
        const secret = parsedUrl.query.secret;
        if (secret !== 'tsukodebug123') {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Unauthorized');
          return;
        }

        const report = {};
        try {
          const { execSync } = require('child_process');
          report.currentDir = process.cwd();
          
          try {
            report.gitCommit = execSync('git log -n 5 --oneline', { encoding: 'utf8' }).trim().split('\n');
            report.gitStatus = execSync('git status', { encoding: 'utf8' }).trim().split('\n');
          } catch (e) {
            report.gitError = e.message;
          }

          try {
            report.files = fs.readdirSync(process.cwd());
            report.nextDirExists = fs.existsSync(path.join(process.cwd(), '.next'));
            if (report.nextDirExists) {
              const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
              report.hasBuildId = fs.existsSync(buildIdPath);
              if (report.hasBuildId) {
                report.buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
              }
            }
          } catch (e) {
            report.filesError = e.message;
          }

          report.forceBuildExists = fs.existsSync(path.join(process.cwd(), 'force-build.txt'));
          report.nodeVersion = process.version;
          report.env = {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
          };
        } catch (err) {
          report.error = err.message;
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(report, null, 2));
        return;
      }

      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
}
