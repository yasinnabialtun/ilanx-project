const { createServer } = require('http');
const { exec } = require('child_process');

const port = process.env.PORT || 3000;
let logs = ['Starting cPanel Auto Installation...'];
let isDone = false;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(`
    <html style="background:#111; color:#0f0; font-family:monospace; padding:20px;">
      <h2>IlanX Deployment Console</h2>
      <pre style="white-space: pre-wrap; word-wrap: break-word;">${logs.join('\n')}</pre>
      ${!isDone ? '<script>setTimeout(()=>location.reload(), 3000)</script>' : '<h3>✅ DONE! Change Startup file to server.js and Restart.</h3>'}
    </html>
  `);
  res.end();
});

server.listen(port, () => {
  console.log('Install server listening on', port);
  
  // Run installation commands sequentially (skipping build as we upload .next directly)
  const cmd = 'npm install --no-audit --no-fund && npx prisma db push --accept-data-loss';
  
  const child = exec(cmd, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer for build logs
  
  child.stdout.on('data', (data) => {
    console.log(data);
    logs.push(data);
  });
  
  child.stderr.on('data', (data) => {
    console.error(data);
    logs.push('[ERR] ' + data);
  });
  
  child.on('close', (code) => {
    isDone = true;
    if (code === 0) {
      logs.push('🎉 ALL TASKS COMPLETED SUCCESSFULLY!');
    } else {
      logs.push(`❌ PROCESS EXITED WITH CODE ${code}`);
    }
  });
});
