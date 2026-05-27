// cPanel Node.js Başlatma Dosyası (server.js)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

// MIME type haritası
const mimeTypes = {
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.json': 'application/json',
  '.webp': 'image/webp',
};

function serveStatic(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(data);
  });
}

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // _next/static → .next/static klasöründen sun
    if (pathname.startsWith('/_next/static/')) {
      const filePath = path.join(__dirname, '.next', 'static', pathname.replace('/_next/static/', ''));
      return serveStatic(req, res, filePath);
    }

    // public klasörü → doğrudan sun
    if (pathname !== '/' && !pathname.startsWith('/_next/') && !pathname.startsWith('/api/')) {
      const publicPath = path.join(__dirname, 'public', pathname);
      if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
        return serveStatic(req, res, publicPath);
      }
    }

    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${port}`);
  });
}).catch((err) => {
  console.error("Next.js başlatılamadı:", err);
  process.exit(1);
});
