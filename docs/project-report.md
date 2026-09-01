# MyShop — Code-Based Project Report

**Prepared:** 1 September 2026  
**Basis of this report:** the current source code, `db.json`, and local verification commands. This report deliberately does **not** treat the earlier plan as proof of delivery.

## 1. Executive summary

MyShop is a responsive, role-based e-commerce **course-demo application**. It is built as a React single-page application (SPA) with three distinct personas:

- **Customer:** discovers products, maintains a wishlist and cart, selects an address and a demo payment method, creates orders, reviews products, and follows order status.
- **Seller:** manages products shown in that seller's inventory, views relevant orders, and views sales/payout-style calculations.
- **Administrator:** views marketplace summaries and manages users, categories, products, and order statuses from a tabbed dashboard.

The project has a substantial implemented UI and a coherent client-side data flow. It uses a local `json-server-auth`/`db.json` API for a demonstrable backend, so it must be presented as a **functional local/demo marketplace**, not as a production-ready commerce platform. Payment is explicitly demo-only; authorization and stock consistency are not enforced by a purpose-built server.

The latest production build completes with three ESLint warnings from the orders page. Automated tests do not exist, and the repository-wide Prettier check currently fails on existing formatting issues.

## 2. What is demonstrably in the code

### 2.1 Roles and access

| Persona       | Implemented routes/capabilities                                                          | Route handling                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Guest         | Browse `/` and `/products`, open product detail, log in, register, open the AI assistant | Public catalogue routes; login/register are guest-only.                                                      |
| Customer      | `/profile`, `/wishlist`, `/cart`, `/checkout`, `/orders`                                 | Customer-only cart, checkout, and wishlist routes; customer order history.                                   |
| Seller        | `/profile`, `/inventory`, `/earnings`, `/orders`                                         | Seller-only inventory and earnings; order view is limited in the UI to orders containing the seller’s items. |
| Administrator | `/profile`, `/dashboard`                                                                 | Admin-only dashboard route with five management tabs.                                                        |

`ProtectedRoute` checks for a saved token, blocked account flags, and an allowed role. It retains the requested URL in redirect state; however, the login page currently always navigates to `/` after a successful login rather than returning to that retained URL.

### 2.2 Authentication and profile

- Email/password login and registration are implemented through `/login` and `/register`.
- Registration collects name, email, Egyptian mobile number, password confirmation, and customer/seller role. Client validation checks required fields, email format, Egyptian mobile format, name length, and password length/match.
- The authenticated `user` and `accessToken` are stored as `authData` in local storage and restored when the application reloads.
- Restricted or soft-deleted users are rejected by the frontend after login and by protected-route checks.
- A signed-in user can edit name, email, and phone; change password after current-password verification through the mock API; and soft-delete their own account.
- Customer profiles also manage addresses. Addresses have country, governorate/state, city, street, country code, and a default flag. The UI uses country labels/flags and supports create, edit, delete, and default-address selection.
- Customer and seller profiles include a card/payout-card view. Existing saved-card records are displayed as masked metadata (brand, expiry, holder, last four digits); full card number and CVV are not written to `db.json` by the form payload.

### 2.3 Catalogue and product discovery

The public catalogue fetches products and categories, then filters on the client. It provides:

- title search;
- category filter;
- availability filter (in stock/out of stock);
- maximum-price filter;
- sort by price ascending/descending or title;
- reset action, match count, loading state, API-error toast, and empty state;
- responsive product-card grid.

Only products whose `isActive` value is not `false` appear in the public catalogue. Product cards show image, category, brand, discount badge where supplied, live review average/count, availability label, price, wishlist control for customers, and cart control. A product detail page fetches the chosen product and its reviews, computes the average rating, shows stock, supports add-to-cart/wishlist actions for customers, and permits customers to submit a 1–5 rating plus a comment. It also presents edit/delete controls for the signed-in owner of a review.

### 2.4 Customer purchasing workflow

The current code provides this end-to-end workflow:

```text
Catalogue / product detail
        ↓
Wishlist toggle or add product to persistent per-user cart
        ↓
Cart quantity/remove controls and totals
        ↓
Checkout: select saved address + demo payment method
        ↓
Create order → decrement each product's stock → clear cart
        ↓
Customer order history with address/payment details, filters, and visual status progression
```

Details of the implementation:

- Cart records are persisted per user in the `carts` resource. Adding an existing product increments its quantity only up to the stock currently held by the client.
- Cart and checkout calculate subtotal, flat EGP 60 shipping for a non-empty cart, and total. The discount is currently fixed at zero.
- Checkout requires at least one cart line and an address. It offers cash on delivery, mock wallet, and selection of a seeded saved card. It creates an order with item snapshots, seller IDs, a delivery-address text snapshot, payment method, totals, `pending` status, and timestamp.
- After order creation, the client issues a separate product update for each stock reduction and then clears the cart.
- Orders render item quantities, delivery address, payment method, totals, and the states `pending`, `confirmed`, `processing`, `shipped`, `delivered`, and `cancelled`. The page adds text search by order ID/item title and status filtering. Customer cards include a five-step visual bar through delivery.

### 2.5 Seller workflow

The seller inventory screen fetches the catalogue and filters it in the browser using `product.sellerId === user.id`. It supports:

- viewing owned items;
- creating an item with seller ID assigned from the session;
- editing title, price, category, brand, description, image URL, stock, and active/visible state;
- deleting an item after browser confirmation.

The shared product modal includes price, discount percentage, stock, visibility, category, brand, image URL, and description fields. Sellers see only orders containing at least one of their products in the orders screen; the current seller view is read-only for order status.

The earnings screen is implemented, despite its modest scope: it filters relevant orders, calculates total sales and units only for statuses `confirmed`, `processing`, `shipped`, or `delivered`, labels delivered-item revenue as “Ready to Pay,” and lists the seller's share for each relevant order. It is a calculated dashboard, not an actual payout integration.

### 2.6 Administrator workflow

The admin dashboard is a single responsive page with five tabs:

1. **Overview:** summary cards for user count, product count, order count, and non-cancelled sales; recent orders; low-stock and outstanding-order queues; quick actions.
2. **Users:** name/email search; account status badges; restrict/unrestrict and soft-delete/restore actions using `isRestricted` and `isDeleted` fields.
3. **Categories:** create, rename, and delete category records; category slugs are generated from their names.
4. **Products:** browse all product cards and create or delete products. The current shared card renders an edit control for sellers, but not for administrators.
5. **Orders:** view every order and transition the order through the defined status values.

Dashboard totals are live client-side calculations from the fetched local data. “Sales” excludes cancelled orders. The low-stock queue is defined as `stock <= 5`.

### 2.7 AI assistant

MyShop includes a floating, role- and route-aware AI support assistant in the shared layout.

- The React chat UI is available to guests and authenticated users, uses Arabic or English based on the UI, provides translated role-specific starter prompts and error states, stores an authenticated user's short transcript in session storage, and can clear it.
- The browser calls a same-origin Vercel Function at `/api/chat`; it never receives the OpenRouter API key.
- The server function accepts only POST, limits input to 800 characters, limits history to eight messages, rate-limits requests in memory (20 per minute per forwarded IP), rejects common email/phone/card/password/token/address patterns, and caps model output.
- The system prompt confines responses to MyShop capabilities, current role, and current route; it expressly says that payment and delivery-related external integrations are demo-only.
- `/api/health` lets the UI determine whether the server-side `OPENROUTER_API_KEY` is configured.

This is an optional AI-assisted help feature, dependent on an OpenRouter key and a Vercel Functions runtime. It is not part of the local CRA server alone.

## 3. Architecture and implementation approach

```text
React 19 SPA
  ├─ React Router 7: public, guest-only, and role-protected routes
  ├─ Redux Toolkit: auth, ui, products, cart, wishlist, orders, profile
  ├─ Reusable components: layout/navbar, inputs, buttons, cards, alerts,
  │  product card/modal, sidebar, profile tabs, chatbot
  ├─ Axios service layer: auth, profile, products, cart, wishlist, orders,
  │  reviews, administration
  └─ i18next + Tailwind CSS + Font Awesome
          │
          ├─ Local/demo REST API: json-server-auth + db.json
          │    └─ users, addresses, cards, categories, products, carts,
          │       wishList, orders, reviews, promoCodes
          │
          └─ Optional deployed help API: Vercel /api/chat → OpenRouter
```

The Redux store separates application concerns into `auth`, `profile`, `ui`, `products`, `cart`, `reviews`, `wishlist`, and `orders` slices. The new review slice caches review lists by product ID and defines fetch/create/update/delete thunks; product cards consume its fetched review counts and averages, while the detail page currently calls the review service directly. Async thunks call small Axios service modules. The Axios request interceptor attaches the saved bearer token; the response interceptor turns server responses into normalized errors.

Route-level code splitting is implemented with `React.lazy` and a `Suspense` loader. `vercel.json` has an SPA rewrite designed to allow direct navigation to client routes without intercepting API or asset requests.

## 4. Current seed data

The checked-in `db.json` is intentionally small and presentation-oriented:

| Resource    | Current count | Presentation relevance                                                                 |
| ----------- | ------------: | -------------------------------------------------------------------------------------- |
| Users       |             3 | One customer, one seller, one administrator                                            |
| Addresses   |             1 | Default delivery address for the customer                                              |
| Saved cards |             1 | Masked Visa metadata ending in 4242                                                    |
| Categories  |             4 | Electronics, Fashion, Home, Books                                                      |
| Products    |             6 | Seller-owned catalogue, including an out-of-stock item                                 |
| Carts       |             1 | Customer cart record, currently empty                                                  |
| Wishlists   |             1 | Customer has one saved product                                                         |
| Orders      |             4 | Delivered, cancelled, and pending examples, each with a delivery-address text snapshot |
| Reviews     |             2 | Product-review examples                                                                |
| Promo codes |             0 | No promo-code feature/data is implemented                                              |

All six seeded products are currently assigned to seller ID 2.

The documented course demo accounts are customer, seller, and admin records in this seed. Do not place their password on presentation slides; log in before presenting or use a private presenter note.

## 5. User experience, responsiveness, and localization

- The navigation changes by role, includes a mobile drawer, shows customer wishlist/cart icons and a cart quantity badge, and is shared across the application.
- Dark mode and language selection are persisted in local storage. Language changes the document language and `dir` attribute (`rtl` for Arabic, `ltr` for English).
- Translation JSON files exist for Arabic and English. The authentication, shared navigation, profile, chatbot, catalogue/product cards, product detail, cart, checkout, orders, and administrator dashboard use named translation namespaces. The dashboard has a dedicated `dashboard.json` namespace; its tabs, cards, status labels, dialogs, messages, and Arabic EGP formatting are localized. The shared product modal also localizes its form controls.
- Tailwind breakpoints are used throughout pages and grids, including product grids, dashboard cards, mobile navigation, and profile layout.
- There are accessible touches in the newer UI: labelled product images, tab roles in the dashboard, focus rings, a dialog role for chat, visually hidden labels, button aria labels, loading/empty/error states, and status descriptions.

Localization should be described accurately as **bilingual support for the core customer journey, shared UI, AI chat, and administrator dashboard**, not complete application translation. The seller inventory and earnings pages still contain hard-coded English strings. RTL/mobile behaviour has not been confirmed by automated tests in this review.

## 6. Evidence from local verification

The following commands were run in this workspace on 1 September 2026:

| Check                                  | Result               | Notes                                                                                                                                                                |
| -------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                        | Passed with warnings | Create React App produced an optimized production build; its main initial JS bundle is 184.08 kB gzipped. The orders page has three unused-variable ESLint warnings. |
| `npm run lint`                         | Passed with warnings | ESLint reports the same three unused-variable warnings in `src/pages/orders.jsx`; it reports no errors.                                                              |
| `npm run format:check`                 | Failed               | Prettier reported formatting issues in 36 files, including newly added translation files, product/customer pages, the review slice, and existing project files.      |
| `CI=true npm test -- --watchAll=false` | Failed               | No test files were found (0 matches across 62 checked source files).                                                                                                 |

The successful build verifies compilation, not that every browser interaction or API-backed route has been manually exercised. No claim in a presentation should imply a passing automated test suite.

## 7. Important implementation boundaries and risks

These points are essential for an honest presentation and a credible Q&A.

| Area                  | Current implementation                                                                                                              | Accurate presentation language                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Backend               | `json-server-auth` writing to `db.json`                                                                                             | “A local mock/course backend with persistent JSON data while the server is running.”                             |
| Authorization         | Role restrictions are enforced in React routes/UI; resource ownership and admin controls are not enforced by a custom server policy | “Frontend role-based access control for the demo,” not “secure server-side authorization.”                       |
| Payments              | Checkout records a selected method only: COD, mock wallet, or saved-card ID                                                         | “Demo checkout / simulated payment selection.” No real charge, gateway, refund, or wallet exists.                |
| Card data             | Card entry is transformed to masked metadata before persistence                                                                     | “Masked display metadata is stored.” Do not claim PCI compliance or real card vaulting.                          |
| Stock/order integrity | Order creation, per-product stock decrements, and cart clearing are separate client-initiated API calls                             | “Stock updates in the demo”; no transaction or concurrency protection against overselling.                       |
| Order fulfilment      | Administrators can select any order status; sellers have a read-only view of relevant orders                                        | “Manual demo status management,” not granular multi-seller fulfilment or tracking.                               |
| Earnings              | Client-side aggregation of qualifying order item values                                                                             | “Estimated sales and payout-style metrics,” not an accounting/payout system.                                     |
| AI assistant          | Server-side Vercel function calls OpenRouter only if a key is configured                                                            | “Optional AI help assistant”; it may be unavailable without configuration or if the free upstream model is busy. |
| Deployment            | Documentation proposes Vercel for UI/functions and Render for mock API                                                              | A deployment design is documented; it does not prove a live deployment is currently configured.                  |

### Known code-level gaps to avoid overstating

1. **Saved-card creation has a wiring defect.** The add-card component intentionally converts the entered number/CVV into masked metadata before dispatching. The slice then validates the transformed payload as if it still contained `cardNumber`, `expiryDate`, and `cvv`, so a new card cannot pass that validation as currently wired. The seeded masked card can be displayed and selected at checkout, but adding a new card is not a verified working flow.
2. **Email uniqueness is not pre-checked in the registration screen.** An unused `checkEmailExists` service method exists, but the UI does not call it.
3. **Admin-created products are assigned `sellerId: 2` in the dashboard code.** There is no seller-assignment control.
4. **Product-management ownership regressed in the shared card.** The public catalogue is accessible at `/products`. When a seller opens it, the current `Product` component renders edit/delete controls for every visible product and dispatches updates/deletes itself, without checking `sellerId`. Inventory itself is filtered to owned products, but that does not protect the public route.
5. **Administrator product editing is not currently wired.** The dashboard retains an update callback, but the revised shared product card shows administrators a delete action only; it does not invoke that callback for editing. Admin-created products still hard-code `sellerId: 2`.
6. **Review editing is not safely wired for `PUT`.** The edit UI sends only `rating` and `comment` through `reviewService.update`, which uses a full `PUT`. With `json-server`, this can replace the review and remove fields such as product/user IDs and timestamp. It should use `PATCH` or send the complete record. Ownership is only a client-side UI check.
7. **Product modal validation is basic.** It sets browser constraints for price, stock, and discount, but does not provide comprehensive business validation for category/image/stock consistency.
8. **Currency presentation is now mostly consistent.** The revised product cards, product detail, cart, checkout, orders, earnings, and dashboard use EGP; the format should still be manually checked across every locale.
9. **A card form is still an unsuitable way to collect live card data.** Even though full numbers/CVV are not persisted, production use would require a provider-hosted/tokenized payment form.
10. **No automated tests exist.** The project has testing libraries and a test setup file, but no test cases.

## 8. Recommended presentation narrative (8–10 minutes)

### Slide 1 — MyShop in one sentence

“MyShop is a React-based, role-driven e-commerce course demo that connects customer shopping, seller inventory, and administrator marketplace management in one responsive application.”

Show the three roles. Avoid claiming a production marketplace or real payments.

### Slide 2 — Problem and users

Explain the three operational views: customers need product discovery and purchasing; sellers need catalogue/stock control and order visibility; administrators need marketplace oversight. State that the project demonstrates these views with a local demo API.

### Slide 3 — Implemented customer journey

Show the catalogue filter panel and a product detail screen. Walk through search/filter → wishlist/cart → cart quantity → checkout address/payment selection → order history. Mention the shipping rule (EGP 60 for a non-empty cart) and that discount is currently zero.

### Slide 4 — Seller journey

Show inventory. Create or edit a product, adjust stock/visibility, then open orders/earnings. Explain that inventory filters data by seller ID in the client and that earnings calculates the seller's item share from qualifying orders. Do not demonstrate seller product controls from the public `/products` route until the ownership regression is fixed.

### Slide 5 — Admin dashboard

Show the dashboard overview first, then its five tabs: users, categories, products, and orders. Demonstrate one safe action, such as adjusting an order status or creating a category. The current product tab is suitable for browsing, adding, and deleting; do not claim administrator product editing. Mention dashboard totals are derived from the demo data.

### Slide 6 — Architecture

Use the architecture diagram from section 3. Call out React Router for navigation/access gates, Redux Toolkit for shared state, Axios services for data access, Tailwind for responsive styling, i18next for bilingual/RTL foundations and feature namespaces, and `json-server-auth` for the local demo API.

### Slide 7 — Quality and privacy choices

Show dark mode/Arabic switch and the AI assistant. Explain masked stored-card metadata, the assistant's client/server separation, sensitive-input rejection, role/page context, and rate limiting. State the actual verification results: build/lint pass; test suite is not yet implemented.

### Slide 8 — Scope boundary and next steps

Close with an explicit production roadmap: replace JSON storage with a real database/API, apply server-side RBAC and ownership checks, use payment-provider tokenization, make checkout inventory updates transactional, complete the remaining seller-page translation and RTL/manual-device testing, fix the add-card validation wiring, normalize currency display, and add reducer/component/end-to-end tests.

## 9. Suggested live-demo sequence

1. Start the JSON API with `npm run server`, then start the client with `npm start`. Use the Vercel development workflow only if demonstrating chat.
2. Begin as a guest: search/filter the catalogue and open a product detail page.
3. Log in as the seeded customer; add a product to wishlist/cart, adjust its quantity, then show checkout and the existing default address / seeded masked card. Use cash on delivery if you place a fresh order—do not imply that a card is charged. The current orders page does not display a route-state confirmation after checkout, so navigate to it normally after placing the order.
4. Open customer orders to show the delivered/cancelled/pending mix, address snapshots, search/status controls, and the status bar.
5. Switch to seller: show the owned-product inventory, safely edit stock or visibility, then show seller orders and earnings.
6. Switch to administrator: show dashboard totals, category maintenance, user flags, product management, and order status control.
7. Optionally open the chatbot only after checking `/api/health`; describe it as configuration-dependent support, not a required core flow.

Before presenting, make a copy/commit of `db.json` or reseed it: checkout, product creation, deletes, category edits, and user flags modify the demo data.

## 10. Concise conclusion

MyShop successfully demonstrates a multi-role React commerce experience with persistent local demo data, shared Redux state, role-aware navigation, responsive UI, bilingual/RTL foundations across the core journey, AI chat, and administrator dashboard, catalogue discovery, cart/order flows, seller tooling, administrator controls, and an optional privacy-conscious AI support interface. Its strongest presentation value is the complete connection between the three roles in one codebase. Its most important caveat is that it remains a course-demo architecture: production security, payment processing, transactions, remaining seller-page localization, automated testing, and a few identified UI/data-flow defects still require work.
