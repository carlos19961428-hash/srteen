# SRTEEN Social Network Demo

This directory contains a minimal prototype for the SRTEEN social network. It demonstrates how you might structure a backend API and a simple client with multilingual support. The project is intentionally lightweight and free of external dependencies so it can run in this environment.

## Structure

```
social_network/
  README.md            – This documentation file.
  server/              – Simple Node.js API server.
    server.js          – HTTP server with rate limiting and demo endpoints.
  client/              – Browser‑based client.
    index.html         – Web page with language selector and feed views.
    main.js            – Script that fetches translations and feed data.
  locales/             – JSON translation files for different languages.
    en.json            – English translations.
    es.json            – Spanish translations.
    pt.json            – Portuguese translations.
    zh.json            – Simplified Chinese translations.
    ar.json            – Arabic translations.
```

## Running the demo

1. **Start the API server.**

   From within the `social_network` directory, run the server:

   ```sh
   cd server
   node server.js
   ```

   The server listens on port 3000 by default. It serves translation data (e.g. `/api/translations?lang=es`) and simple feed endpoints (`/api/feed/shorts` and `/api/feed/live`). A basic rate limiter is enabled to reject clients making more than 50 requests per minute.

2. **Open the client.**

   Open the `client/index.html` file in a web browser, or visit `http://localhost:3000/` if you are serving the app via the Node.js server. The page will fetch translations from the running API server and display demo feed data.  
   For authentication, navigate to `/login.html` or `/signup.html` (e.g. `http://localhost:3000/login.html`). These pages let you register new users and log in using the in‑memory API endpoints.

3. **Switch languages.**

   Use the drop‑down menu on the page to select different languages. The UI text will update automatically. For right‑to‑left languages such as Arabic, the page flips direction.

This prototype is a foundation for building out a full‑fledged social network with features such as live streaming, real user authentication, database storage and content moderation. The backend can be expanded into a complete NestJS application, while the client can be converted into a React Native or Next.js project.