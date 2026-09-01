# MyShop

MyShop is a role-based e-commerce frontend built with React, Redux Toolkit, Tailwind CSS,
i18next, and a local `json-server-auth` API. It supports customer shopping flows, seller
inventory management, and admin management screens for the course demo.

## Run locally

```bash
npm ci --legacy-peer-deps
npm run server
npm start
```

The frontend runs at `http://localhost:3000`; the local API runs at `http://localhost:3001`.
Set `REACT_APP_API_URL` to use another API host.

### Test the AI Assistant locally

The chatbot is served by Vercel Functions (`/api/chat` and `/api/health`), so `npm start`
alone does not test it. Start the mock API in one terminal:

```bash
npm run server
```

Create a local-only `.env.local` file from `.env.example` and set your OpenRouter key:

```text
OPENROUTER_API_KEY=your_openrouter_key
REACT_APP_API_URL=http://localhost:3001
```

Do not add `REACT_APP_CHAT_API_URL`; leaving it unset makes the browser call the same local
Vercel origin. In a second terminal, run:

```bash
set -a
. ./.env.local
set +a
npx vercel dev --local --listen 3000
```

Open the URL printed by Vercel (normally `http://localhost:3000`) and use the floating robot
button. The `--local` option avoids linking or creating a Vercel project. Exporting
`.env.local` first makes its variables available to the Vercel Function. Confirm the function
is configured with:

```bash
curl http://localhost:3000/api/health
```

It should return `{"status":"ok","configured":true}`. `.env.local` is gitignored; never
commit the key. For a linked Vercel project, `vercel pull` can retrieve its Development
environment variables instead of entering the key manually.

## Demo accounts

All seeded demo accounts use password `yousef123`.

| Role     | Email                  |
| -------- | ---------------------- |
| Customer | `customer@myshop.test` |
| Seller   | `seller@myshop.test`   |
| Admin    | `admin@myshop.test`    |

## Included flows

- Product search, category/price/availability filters, product details, reviews, and wishlist.
- Persistent customer cart, mock checkout, stock updates, order history, and status tracking.
- Seller-owned inventory create/edit/delete, stock, and catalogue visibility controls.
- Admin dashboard for users, categories, products, and order statuses.

Payment options are mock/demo-only. Saved cards store masked metadata only; no card number or
CVV is persisted.

## Verification

```bash
npm run build
npm test -- --watchAll=false
```
