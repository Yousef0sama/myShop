# MyShop Deployment Guide

## Chosen architecture

Deploy the application as one Vercel project plus the existing mock API:

```text
Browser → Vercel (React frontend + /api/chat) → OpenRouter
        → Render (json-server-auth API)
```

Vercel hosts the Create React App build and MyShop AI Assistant function at
`https://<frontend>.vercel.app`; Render runs the existing `json-server-auth` service at
`https://<backend>.onrender.com`.

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

`REACT_APP_*` values are public browser configuration; never put secrets in them. The chatbot
uses the same-origin `/api/chat` function, so it does not need a public chat API URL.

### Configure the backend port

Change the `server` script in `package.json` to:

```json
"server": "json-server-auth db.json --host 0.0.0.0 --port ${PORT:-3001}"
```

This binds to Render's public interface and uses its assigned `PORT`, while continuing to
use port `3001` locally.

### Support direct React Router URLs

Create `vercel.json` in the repository root:

```json
{
  "rewrites": [
    {
      "source": "/:path((?!api/|static/|favicon\\.ico$|manifest\\.json$|asset-manifest\\.json$|robots\\.txt$|logo192\\.png$|logo512\\.png$).*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents 404s when a reviewer opens `/profile` or `/products` directly without
rewriting Vercel Function paths or Create React App assets such as `/api/chat`,
`/static/js/bundle.js`, and `/locales/ar/common.json`.

### Test Vercel Functions locally

`npm start` runs only the Create React App development server, so it cannot serve the
`/api/chat` and `/api/health` Vercel Functions. To test the full local integration:

1. In one terminal, run `npm run server` to start the mock API on port `3001`.
2. Create a gitignored `.env.local` file using `.env.example` and set:

   ```text
   OPENROUTER_API_KEY=your_openrouter_key
   REACT_APP_API_URL=http://localhost:3001
   ```

   Do not use a `REACT_APP_` prefix for `OPENROUTER_API_KEY`; that would expose it to the
   browser. Leave `REACT_APP_CHAT_API_URL` unset so chat uses the same local Vercel origin.
3. In a second terminal, export the local environment variables and run Vercel:

   ```bash
   set -a
   . ./.env.local
   set +a
   npx vercel dev --local --listen 3000
   ```

   This serves the React app and functions together at `http://localhost:3000`, without
   linking or creating a Vercel project. The explicit export is required because unlinked
   `--local` mode does not pull Vercel environment variables.
4. Verify the chat configuration:

   ```bash
   curl http://localhost:3000/api/health
   ```

   The expected response is `{"status":"ok","configured":true}`. Then open the site and
   test the floating chatbot. A message containing a password, payment card, email address,
   or more than 800 characters should be rejected.

If the repository is linked to Vercel, run `vercel pull` to retrieve the Development
environment variables for `vercel dev` instead of manually creating `.env.local`.

## 3. Deploy the API to Render

1. Select **New → Blueprint** in Render and connect the GitHub repository.
2. Set the Blueprint Path to `deploy/render.yaml`, then select the `main` branch and deploy it.
   The repository Blueprint supplies the following service settings:

   | Setting | Value |
   | ------- | ----- |
   | Runtime | Node  |
   | Build command | `npm ci --legacy-peer-deps` |
   | Start command | `npm run server` |
   | Health check | `/products` once products are seeded |

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
   | Install command  | Configured in `vercel.json` |
   | Build command    | `npm run build` |
   | Output directory | `build`         |

4. Add these Vercel environment variables for Production (and Preview if required):

| Name                 | Value                            |
| -------------------- | -------------------------------- |
| `REACT_APP_API_URL`  | `https://<backend>.onrender.com` |
| `OPENROUTER_API_KEY` | Your real OpenRouter key         |

`OPENROUTER_API_KEY` is read only by `api/chat.js` on Vercel. Do not prefix it with
`REACT_APP_`, and never commit it in an `.env` file.

5. Deploy. Vercel provides a public URL similar to `https://myshop.vercel.app`.
6. Redeploy the frontend whenever `REACT_APP_API_URL` changes.

## 5. Live-demo verification

- [ ] The Vercel URL loads a populated product catalogue.
- [ ] Browser Network requests target the Render URL, never `localhost:3001`.
- [ ] `https://<frontend>.vercel.app/api/health` returns JSON and reports whether the chat key is configured.
- [ ] Chat requests go to `/api/chat` on the Vercel URL, never directly to OpenRouter.
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
