const { createServer } = require('http');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
let logs = ['🚀 Starting cPanel Auto Installation...'];
let isDone = false;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(`
    <html style="background:#111; color:#0f0; font-family:monospace; padding:20px;">
      <h2>IlanX Deployment Console</h2>
      <pre style="white-space: pre-wrap; word-wrap: break-word;">${logs.join('\n')}</pre>
      ${!isDone ? '<script>setTimeout(()=>location.reload(), 5000)</script>' : '<h3>✅ DONE! Change Startup file to server.js and Restart.</h3>'}
    </html>
  `);
  res.end();
});

server.listen(port, () => {
  console.log('Install server listening on', port);

  // Step 0: Remove old .next directory to force a clean build
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    logs.push('🧹 Removing old .next directory for clean build...');
    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
      logs.push('✅ Old .next directory removed.');
    } catch (e) {
      logs.push('[WARN] Could not remove .next: ' + e.message);
    }
  }

  // Run installation commands sequentially
  // Each step is separated so we can see individual progress
  const steps = [
    { name: '📦 npm install', cmd: 'npm install --no-audit --no-fund' },
    { name: '🔧 prisma generate', cmd: 'npx prisma generate' },
    { name: '🗄️ prisma db push', cmd: 'npx prisma db push --accept-data-loss' },
    { name: '🏗️ next build (this takes 3-8 minutes...)', cmd: 'npx next build' },
  ];

  let currentStep = 0;

  function runNextStep() {
    if (currentStep >= steps.length) {
      isDone = true;
      logs.push('');
      logs.push('🎉 ALL TASKS COMPLETED SUCCESSFULLY!');
      return;
    }

    const step = steps[currentStep];
    logs.push('');
    logs.push(`--- ${step.name} ---`);

    const child = exec(step.cmd, { 
      maxBuffer: 1024 * 1024 * 50,
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    child.stdout.on('data', (data) => {
      const lines = data.toString().trim();
      if (lines) {
        console.log(lines);
        logs.push(lines);
      }
    });

    child.stderr.on('data', (data) => {
      const lines = data.toString().trim();
      if (lines) {
        console.error(lines);
        logs.push('[LOG] ' + lines);
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        logs.push(`✅ ${step.name} completed successfully.`);
        currentStep++;
        runNextStep();
      } else {
        isDone = true;
        logs.push(`❌ ${step.name} FAILED with exit code ${code}`);
        logs.push('⚠️ Fix the error and restart install.js');
      }
    });
  }

  runNextStep();
});
