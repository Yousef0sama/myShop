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
