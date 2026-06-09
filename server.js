const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const hasBuild = fs.existsSync(buildIdPath);

if (!hasBuild) {
  console.error('> ERROR: No Next.js build found. Run "npm run build" first.');
  process.exit(1);
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

startNextServer();
