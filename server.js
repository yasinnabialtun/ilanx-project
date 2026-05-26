// Güzel Hosting cPanel Node.js Başlatma Dosyası (server.js)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

// cPanel otomatik olarak PORT ataması yapar, aksi halde 3000 portunu kullanır.
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${port}`);
  });
}).catch((err) => {
  console.error("Next.js başlatılamadı:", err);
  process.exit(1);
});
