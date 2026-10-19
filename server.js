// PUIT24210078 HOSPITAL MANAGEMENT SYSTEM - Local Web Server
// Runs using Node.js standard libraries (zero dependencies needed)

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // Basic CORS & headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let parsedUrl = req.url.split('?')[0];
    if (parsedUrl === '/') {
        parsedUrl = '/index.html';
    }

    const safeSuffix = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(BASE_DIR, safeSuffix);

    // Prevent directory traversal
    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>404 Not Found</title></head>
                <body style="font-family:sans-serif; text-align:center; padding:50px;">
                    <h2>404 - File Not Found</h2>
                    <p>Requested: ${parsedUrl}</p>
                    <a href="/">Return to PUIT24210078 Hospital Management System</a>
                </body>
                </html>
            `);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log('========================================================');
    console.log('   PUIT24210078 HOSPITAL MANAGEMENT SYSTEM SERVER');
    console.log(`   Running at: http://localhost:${PORT}`);
    console.log('========================================================');
});

// Fallback in case port is in use
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const altPort = Number(PORT) + 1;
        console.log(`Port ${PORT} in use, trying port ${altPort}...`);
        server.listen(altPort, () => {
            console.log(`PUIT24210078 HMS running at http://localhost:${altPort}`);
        });
    } else {
        console.error('Server error:', err);
    }
});
