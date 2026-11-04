const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleRequest } = require('./api/backend');

const PORT = process.env.PORT || 3000;
const UI_DIR = path.join(__dirname, 'complaint_system_ui');

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
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
    const host = req.headers.host || `localhost:${PORT}`;
    const parsedUrl = new URL(req.url, `http://${host}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Route API requests to backend handler
    if (pathname.startsWith('/api')) {
        return handleRequest(req, res);
    }

    // Default route
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    // Resolve static file path within complaint_system_ui
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(UI_DIR, safePath);

    // Check if directory, try index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    // If file doesn't have an extension, try appending .html
    if (!fs.existsSync(filePath) && !path.extname(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
        }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`<h1>404 Not Found</h1><p>The requested file <code>${pathname}</code> was not found.</p>`);
    }
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`\n======================================================`);
        console.log(`🚀 Grievance Management System is running!`);
        console.log(`🌐 Local URL: http://localhost:${PORT}`);
        console.log(`📡 API URL:   http://localhost:${PORT}/api`);
        console.log(`======================================================\n`);
    });
}

module.exports = server;

