const http = require('http');
const fs = require('fs');
const path = require('path');

/*
 * Simple Node.js server for the SRTEEN social network demo.
 *
 * This file implements a small HTTP server with the following features:
 * - Loads translation JSON files from the "../locales" directory into memory.
 * - Provides endpoints to fetch translations and demo feed data.
 * - Implements a naive in‑memory rate limiter to mitigate abusive clients.
 * - Responds with CORS headers so a browser-based client can access the API.
 *
 * Note: This server is intentionally minimal and does not use external
 * dependencies such as Express.js to avoid requiring additional
 * installations. It serves as a starting point for developing a more
 * sophisticated backend (e.g. NestJS) as described in the project plan.
 */

// Load all translations from the locales directory. Each language file
// should be named with the language code (e.g. en.json, es.json).
const translations = {};
const localeDir = path.join(__dirname, '..', 'locales');
try {
  const files = fs.readdirSync(localeDir);
  files.forEach((file) => {
    if (file.endsWith('.json')) {
      const lang = path.basename(file, '.json');
      const content = fs.readFileSync(path.join(localeDir, file), 'utf8');
      translations[lang] = JSON.parse(content);
    }
  });
} catch (err) {
  console.error('Failed to load locale files:', err);
}

// In‑memory rate limiting. Stores the number of requests per IP within
// a rolling time window (60 seconds). If a client exceeds the limit,
// further requests will be rejected with HTTP 429.
const rateLimit = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50;

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = rateLimit[ip];
  if (!entry) {
    entry = { count: 0, start: now };
  }
  // Reset the counter if outside the window.
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateLimit[ip] = entry;
  return entry.count <= RATE_LIMIT_MAX_REQUESTS;
}

// Utility to send JSON responses.
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// In‑memory user store. Each user object has a username and password.
// This is only for demonstration; in production use a persistent
// datastore and password hashing.
const users = [];

// Create HTTP server.
// Directory containing the client files. This allows serving the frontend
// directly from the same origin as the API to avoid CORS issues.
const clientDir = path.join(__dirname, '..', 'client');

const server = http.createServer((req, res) => {
  const { method } = req;
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const ip = req.socket.remoteAddress || '';

  // Apply CORS headers so browser clients can access the API.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Enforce rate limiting. If the limit is exceeded, respond with 429.
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Too many requests, please try again later.' });
    return;
  }

  // Endpoint: GET /api/translations?lang=<code>
  if (pathname === '/api/translations' && method === 'GET') {
    const lang = parsedUrl.searchParams.get('lang') || 'en';
    const data = translations[lang] || translations['en'] || {};
    sendJson(res, 200, data);
    return;
  }

  // Endpoint: GET /api/feed/shorts
  if (pathname === '/api/feed/shorts' && method === 'GET') {
    // Demo data for short video feed. Each entry could contain more
    // properties in a real application (e.g. media URL, number of likes).
    const feed = [
      {
        id: 1,
        author: 'Alice',
        description: 'Check out this street dance move!',
        posted_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        author: 'Bob',
        description: 'New graffiti art in town!',
        posted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ];
    sendJson(res, 200, feed);
    return;
  }

  // Endpoint: GET /api/feed/live
  if (pathname === '/api/feed/live' && method === 'GET') {
    // Demo data for live sessions. A production system would include
    // streaming URLs and viewer counts.
    const live = [
      {
        id: 1,
        streamer: 'Charlie',
        title: 'Skateboarding live session',
        started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        streamer: 'Dana',
        title: 'Breakdancing battle!',
        started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];
    sendJson(res, 200, live);
    return;
  }

  // Endpoint: POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      let credentials;
      try {
        credentials = JSON.parse(body);
      } catch (err) {
        credentials = {};
      }
      const { username, password } = credentials;
      if (!username || !password) {
        sendJson(res, 400, { error: 'errorMissingFields' });
        return;
      }
      // Find the user in the in‑memory store.
      const user = users.find((u) => u.username === username);
      if (!user || user.password !== password) {
        sendJson(res, 401, { error: 'errorInvalidCredentials' });
        return;
      }
      // On success, return a dummy token. In production, generate a JWT.
      sendJson(res, 200, {
        user: { username: user.username },
        token: 'demo-token',
      });
    });
    return;
  }

  // Endpoint: POST /api/auth/signup
  if (pathname === '/api/auth/signup' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      let credentials;
      try {
        credentials = JSON.parse(body);
      } catch (err) {
        credentials = {};
      }
      const { username, password } = credentials;
      if (!username || !password) {
        sendJson(res, 400, { error: 'errorMissingFields' });
        return;
      }
      // Check if user already exists.
      const existing = users.find((u) => u.username === username);
      if (existing) {
        sendJson(res, 409, { error: 'errorUserExists' });
        return;
      }
      // Add the new user to the store.
      users.push({ username, password });
      sendJson(res, 201, { message: 'signupSuccess' });
    });
    return;
  }

  /*
   * Static file serving: if the request is a GET and does not match any of
   * the API routes above, attempt to serve a file from the client directory.
   * This makes it possible to access the frontend via http://localhost:3000/
   * rather than loading the HTML file from the filesystem. Serving the
   * frontend from the same origin as the API eliminates cross‑origin
   * restrictions when making fetch calls.
   */
  if (method === 'GET') {
    let staticPath;
    if (pathname === '/' || pathname === '') {
      staticPath = path.join(clientDir, 'index.html');
    } else {
      // Remove leading slash to build a relative path. Do not allow
      // directory traversal by using path.resolve and checking the prefix.
      const relPath = pathname.replace(/^\//, '');
      staticPath = path.join(clientDir, relPath);
    }
    try {
      const resolved = path.resolve(staticPath);
      const clientRoot = path.resolve(clientDir);
      if (resolved.startsWith(clientRoot) && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        const data = fs.readFileSync(resolved);
        const ext = path.extname(resolved).toLowerCase();
        let contentType;
        switch (ext) {
          case '.html': contentType = 'text/html'; break;
          case '.js': contentType = 'application/javascript'; break;
          case '.css': contentType = 'text/css'; break;
          case '.json': contentType = 'application/json'; break;
          case '.png': contentType = 'image/png'; break;
          case '.jpg':
          case '.jpeg': contentType = 'image/jpeg'; break;
          default: contentType = 'text/plain'; break;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(data);
        return;
      }
    } catch (err) {
      // If an error occurs, ignore it and fall through to 404.
    }
  }

  // Default: Not Found
  sendJson(res, 404, { error: 'Not Found' });
});

// Start listening on port 3000. When the server is up, log a message.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SRTEEN server running at http://localhost:${PORT}`);
});