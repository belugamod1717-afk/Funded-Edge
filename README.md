# FundedEdge v4 — Deployment-ready MVP

This is a working static MVP of FundedEdge with a shared JavaScript layer, public directory, firm pages, comparison, and a browser-based admin prototype.

## Run locally
Use any static web server. Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

Opening HTML files directly may work in some browsers, but serving the folder is recommended.

## Demo admin
Email: `admin@fundededge.com`
Password: `FundedEdge123!`

**Important:** this is NOT production authentication. The credentials are visible in frontend code and firm data is stored in browser localStorage.

## Deploy
Upload the contents of this folder to any static hosting provider. `index.html` is the homepage.

## Before public launch
1. Replace demo auth with server-side authentication.
2. Move firm data to a real database.
3. Add role/permission controls and audit logs.
4. Add secure affiliate-link management.
5. Verify every prop-firm rule and price before publishing.
6. Connect a real domain and SSL.
7. Add legal pages, privacy policy, terms, and affiliate disclosure.
