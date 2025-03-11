const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.mkv': 'video/x-matroska'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle CORS for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Map URLs with trailing slashes to index.html
  let url = req.url;
  if (url.endsWith('/')) {
    url += 'index.html';
  }
  
  // Handle root URL
  if (url === '/') {
    url = '/index.html';
  }
  
  // Map clean URLs to their respective index.html files
  const urlParts = url.split('?')[0].split('#')[0];
  const cleanUrl = urlParts.replace(/\/$/, '');
  
  let filePath = path.join(__dirname, 'out', cleanUrl);
  
  // Check if the file exists, if not it might be a route
  if (!fs.existsSync(filePath)) {
    // Check if it's a directory with an index.html
    if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else {
      // Otherwise serve the main index.html for client-side routing
      filePath = path.join(__dirname, 'out', 'index.html');
    }
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = CONTENT_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found, serve 404
        fs.readFile(path.join(__dirname, 'out', '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, '=================================================');
  console.log(`\x1b[32m%s\x1b[0m`, `  The Bank running at http://localhost:${PORT}`);
  console.log(`\x1b[32m%s\x1b[0m`, '=================================================');
  console.log(`\x1b[36m%s\x1b[0m`, 'Your Freqtrade strategies are accessible through the Freqtrade Dashboard link');
  console.log(`\x1b[33m%s\x1b[0m`, 'Press Ctrl+C to stop the server');
});
