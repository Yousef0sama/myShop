# MyShop Deployment Guide

## Chosen architecture

Deploy the application as two services:

```text
Browser → Vercel (React frontend) → Render (json-server-auth API)
```

Vercel hosts the Create React App build at `https://<frontend>.vercel.app`; Render runs the existing `json-server-auth` service at `https://<backend>.onrender.com`.

This is suitable for an ITI course demo. File-based `db.json` and `json-server-auth` are not suitable for production user management or payments.

## 1. Before deployment

- Push the project to a GitHub repository.
- Connect both Vercel and Render to GitHub.
- Run `npm install`, then confirm `npm run build` succeeds locally.
- Seed `db.json` with categories, products, and customer/seller/admin test accounts.
- Never commit real card data, API keys, or payment-provider credentials.

## 2. Required code changes

### Configure the API URL by environment

Replace the hard-coded base URL in `src/services/api.js` with:

```js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});
```

Optionally add this local-only `.env.local` file:

```text
REACT_APP_API_URL=http://localhost:3001
```

`REACT_APP_*` values are public browser configuration; never put secrets in them.

### Configure the backend port

Change the `server` script in `package.json` to:

```json
"server": "json-server-auth db.json --port ${PORT:-3001}"
```

This uses Render's assigned `PORT` while continuing to use port `3001` locally.

### Support direct React Router URLs

Create `vercel.json` in the repository root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This prevents 404s when a reviewer opens `/profile` or `/products` directly.

## 3. Deploy the API to Render

1. Select **New → Web Service** in Render and connect the GitHub repository.
2. Configure the service:

   | Setting       | Value                                |
   | ------------- | ------------------------------------ |
   | Runtime       | Node                                 |
   | Build command | `npm ci`                             |
   | Start command | `npm run server`                     |
   | Health check  | `/products` once products are seeded |

3. Deploy and copy the generated URL, for example `https://myshop-api.onrender.com`.
4. Verify that `https://<backend>.onrender.com/products` and `/categories` return JSON.

### Data persistence warning

Render's filesystem is ephemeral by default. Since `json-server-auth` writes changed data to `db.json`, registrations, carts, and orders may disappear after a restart or redeployment.

For the demo, keep essential records committed in `db.json` and reset/redeploy from that seed before the presentation if needed. Attaching a Render persistent disk is an optional improvement if this data must survive redeployments.

## 4. Deploy the frontend to Vercel

1. Select **Add New → Project** in Vercel and import the same GitHub repository.
2. Confirm that Vercel detects **Create React App**.
3. Set these build settings:

   | Setting          | Value           |
   | ---------------- | --------------- |
   | Build command    | `npm run build` |
   | Output directory | `build`         |

4. Add this Vercel environment variable for Production (and Preview if required):

   | Name                | Value                            |
   | ------------------- | -------------------------------- |
   | `REACT_APP_API_URL` | `https://<backend>.onrender.com` |

5. Deploy. Vercel provides a public URL similar to `https://myshop.vercel.app`.
6. Redeploy the frontend whenever `REACT_APP_API_URL` changes.

## 5. Live-demo verification

- [ ] The Vercel URL loads a populated product catalogue.
- [ ] Browser Network requests target the Render URL, never `localhost:3001`.
- [ ] Login and registration work with demo accounts.
- [ ] One API-backed profile action works, such as adding an address.
- [ ] Direct visits to `/products`, `/login`, and `/profile` work.
- [ ] Customer, seller, and admin route guards work.
- [ ] Arabic/RTL, English/LTR, and dark mode work on the deployed app.
- [ ] Frontend and backend URLs are included in the README/presentation.
- [ ] The Render data is reseeded before the final presentation when needed.

## 6. Troubleshooting

| Symptom                                | Likely cause                                              | Fix                                                     |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Requests still target `localhost:3001` | Missing environment variable or stale build               | Set `REACT_APP_API_URL` in Vercel and redeploy.         |
| Product request fails                  | Render is unavailable, misconfigured, or has no seed data | Check Render logs and open the `/products` endpoint.    |
| Nested URL is 404                      | SPA rewrite is missing                                    | Add `vercel.json`, commit it, and redeploy.             |
| New data disappeared                   | Render restarted or redeployed                            | Re-seed `db.json` or configure a persistent disk later. |

## 7. Presentation note

Describe the deployed API honestly as a mock course backend. A production version would use a secured backend, managed database, and server-side payment-provider integration.
