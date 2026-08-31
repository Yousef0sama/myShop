# MyShop — Development Progress Checklist

**Reviewed:** 2026-08-31  
**Status key:** `[x]` verified in the current codebase · `[-]` partially implemented or scaffolded · `[ ]` not implemented

This is the working progress tracker for the ITI React Summer Course project. Mark an item
`[x]` only after it works against the local API and its related route/UI has been manually
tested. Keep incomplete items as `[-]` when code exists but the full user flow is not ready.

## 0. Project setup and quality

- [x] React application is set up with Create React App.
- [x] Styling uses Tailwind CSS and Font Awesome.
- [x] Redux Toolkit store is configured.
- [x] Local JSON backend command is configured: `npm run server` (`json-server-auth`, port `3001`).
- [x] API service layer and shared Axios instance exist.
- [x] Responsive shared layout and navigation exist.
- [x] Arabic/English translation files and RTL/LTR switching exist.
- [x] Light/dark theme preference exists and is persisted locally.
- [x] Route-level lazy loading exists and the production build succeeds.
- [x] ESLint and Prettier are configured; `npm run lint`, `npm run format`, and `npm run format:check` are available.
- [ ] Add meaningful unit/component tests for reducers, services, and critical flows.
- [x] Project-specific README documents setup, demo accounts, commands, core features, and mock-payment limitation.
- [x] API base URL supports `REACT_APP_API_URL` with a local fallback.
- [x] Database is seeded with products, categories, customer/seller/admin accounts, a cart, wishlist, order, and reviews.

## 1. User management

### Authentication and roles

- [x] Register with name, email, phone, password, and customer/seller role.
- [x] Login with email and password.
- [x] Persist the authenticated user and access token in local storage.
- [x] Restore a saved authentication session when the app reloads.
- [x] Log out and clear the saved session.
- [x] Frontend route guards protect authenticated routes.
- [x] Frontend route guards restrict customer, seller, and admin routes by role.
- [-] Registration validates required fields, email format, Egyptian phone format, and password confirmation; server-side duplicate-email handling/feedback is not explicitly implemented.
- [-] The login guard remembers the originally requested location, but the login page always redirects to `/` instead of returning there.
- [x] Seed and document a usable admin account.
- [-] Login and route guards reject restricted/soft-deleted accounts in the frontend; server-side authorization still needs a production backend.
- [ ] Implement confirmation email.
- [ ] Implement Google/social-media login as a real bonus integration, or label it as a mock.

### Profile and payment details

- [x] View profile name, email, phone, and role.
- [x] Edit name, email, and phone through API-backed profile actions.
- [x] Add, edit, and delete user addresses.
- [x] Choose a default address in the UI.
- [x] Add and delete masked saved-card records; the UI does not persist the full card number or CVV.
- [-] Password-change UI exists, but it does not verify the entered current password and needs a backend-safe implementation.
- [-] Default-address updates are sent as separate client requests, so the API does not guarantee exactly one default address under concurrent updates.
- [ ] Validate card number length, expiry date, and CVV before saving card metadata.
- [ ] Add profile-level loading, success, and error behavior consistently across all tabs.

### Wishlist, history, and reviews

- [-] Wishlist Redux slice and API service are implemented; full browser flow still needs manual verification.
- [-] Product cards and details can add/remove wishlist entries; full browser flow still needs manual verification.
- [-] Saved products render at `/wishlist`; full browser flow still needs manual verification.
- [-] Customer order history renders at `/orders`; full browser flow still needs manual verification.
- [-] Authenticated customers can submit ratings and reviews; full browser flow still needs manual verification.
- [-] Product details display reviews, count, and calculated average rating; full browser flow still needs manual verification.

## 2. Product management

- [x] Product service supports list, detail, create, update, and delete requests.
- [x] Products Redux slice supports fetch, create, update, and delete actions.
- [x] Public product listing page requests products and categories.
- [x] Search products by title.
- [x] Filter products by category.
- [x] Product card supports image, title, description, category, price, discount, rating, and stock-status display when supplied by product data.
- [x] Reusable create/edit product modal component exists.
- [x] Seeded categories are available and match product category values.
- [x] Seeded products demonstrate images, discounts, availability, and stock; all seeded image URLs were checked successfully.
- [-] CRUD thunks are connected to seller/admin workflows; form validation is still basic and browser flows need manual verification.
- [x] Product categories and realistic product records with images are seeded.
- [-] Product details and reviews are implemented; full browser flow still needs manual verification.
- [x] Maximum-price filter is implemented.
- [x] Availability/stock filter and sort controls are implemented.
- [ ] Add comprehensive input validation for product creation/editing.
- [-] Checkout decrements stock after creating an order; a real backend transaction is needed for concurrency-safe stock handling.

## 3. Shopping cart and checkout

- [-] Customer-only `/cart` route, navbar badge, and cart page are implemented; full browser flow still needs manual verification.
- [-] Product cards now persist add-to-cart actions through Redux/API; product-card error feedback can be improved.
- [-] Navbar reads the registered `state.cart` reducer and calculates the item count.
- [x] Cart Redux slice is registered in the store.
- [x] Cart API service and per-user persistence are implemented.
- [-] Add/remove cart actions are implemented; full browser flow still needs manual verification.
- [-] Quantity controls enforce current product stock; a real backend is needed to prevent concurrent overselling.
- [-] Cart line items, empty state, subtotal, shipping, and total are implemented; discount is currently zero.
- [-] Checkout screen supports address selection; full browser flow still needs manual verification.
- [-] Course-demo payment options include saved card, cash on delivery, and mock wallet.
- [ ] Add guest checkout as a bonus or explicitly exclude it from the MVP.
- [ ] Apply promo code and discount logic as a bonus.

## 4. Order management

- [-] `/orders` is protected for customers and sellers and has an order view; full browser flow still needs manual verification.
- [-] Checkout creates a persistent order and clears the cart; full browser flow still needs manual verification.
- [-] Order confirmation shows the ID; history shows items, payment method, and totals. Address display should be added.
- [x] Order status values include `pending`, `confirmed`, `processing`, `shipped`, `delivered`, and `cancelled`.
- [-] Customer order tracking has a visual status timeline; full browser flow still needs manual verification.
- [-] Seller and admin status controls are implemented in the UI; role permissions require a production backend for enforcement.
- [ ] Send order email notifications as a real integration or label them as mocked bonus functionality.

## 5. Payment integration

- [x] Profile supports saving masked card metadata for a course-demo UI.
- [-] Saved-card metadata can be selected as a checkout payment option.
- [-] Cash on Delivery is available as a demo checkout choice.
- [-] Mock wallet payment is available as a demo checkout choice.
- [ ] Implement a real Stripe, PayPal, or Razorpay integration only if backend, keys, and server-side payment verification are available.
- [ ] Never store raw card numbers, CVVs, payment keys, or payment-provider secrets in `db.json` or the frontend.

## 6. Admin panel

- [x] Admin-only `/dashboard` route is protected by the frontend role guard.
- [-] Dashboard page implements management tabs; full browser flow still needs manual verification.
- [-] Dashboard statistics display users, products, orders, sales, and low-stock products.
- [-] User list and search are implemented.
- [-] Soft-delete/restrict and restore actions are implemented through flags; server-side enforcement needs a production backend.
- [-] Product and category management views are implemented; product assignment to a specific seller needs refinement.
- [-] Admin order status management is implemented; shipping detail and cancellation rules need refinement.
- [ ] Manage promo codes/discounts as a bonus.
- [ ] Manage homepage banners/content as a bonus.

## 7. Seller/vendor management

- [x] Sellers can register and access seller-only protected routes.
- [x] Seller profile has a payout-card tab using the shared masked-card UI.
- [-] `/inventory` is implemented; `/earnings` remains a placeholder bonus screen.
- [x] Every seeded product has a `sellerId`.
- [-] Inventory filters to the logged-in seller's products; backend authorization is still needed to prevent direct API bypass.
- [-] Seller create/edit/delete, activation, and stock updates are implemented; full browser flow still needs manual verification.
- [-] Frontend only exposes owned products; backend authorization is still needed to prevent direct API bypass.
- [-] Seller order-processing queue and status control are available at `/orders`; full browser flow still needs manual verification.
- [ ] Calculate/display seller earnings and payouts as a bonus.

## 8. Bonus: marketing and engagement

- [ ] Promo codes and discounts.
- [ ] Email newsletter/marketing opt-in.
- [ ] Push notifications.
- [ ] Loyalty points/rewards.
- [ ] Social sharing and referrals.
- [x] Multi-language support (Arabic and English).

## 9. Final verification and presentation

- [x] Dependencies are installed and `npm run build` succeeds.
- [ ] `npm test -- --watchAll=false` currently reports no tests found; add tests before presentation.
- [x] `npm run lint` and `npm run format:check` pass.
- [ ] Test all completed pages on a narrow/mobile viewport.
- [ ] Test each completed flow in Arabic/RTL and English/LTR, and in light/dark mode.
- [ ] Test unauthorized direct URL navigation for every customer/seller/admin route.
- [x] Customer, seller, and admin demo accounts and seed data are prepared and documented.
- [ ] Prepare a presentation covering project goal, features, technologies, and architecture.
- [ ] Rehearse customer, seller, and admin demos without exposing real credentials or card information.
- [ ] Prepare fallback screenshots/video in case the local server is unavailable.
- [ ] Update this checklist and [the implementation plan](plan.md) before the final presentation.

## Recommended next five tasks

1. Manually test every customer, seller, and admin flow against the local API, including a
   complete checkout and status update.
2. Add reducer, service, and end-to-end/component tests for cart, checkout, role guards, and
   inventory ownership.
3. Translate all newly added customer, seller, and admin UI strings, then check RTL/mobile and
   dark mode layouts.
4. Harden profile/product validation and replace client-only stock updates and role checks with
   production-backend transactions and authorization.
5. Finish presentation assets: screenshots, fallback recording, and a rehearsed role-based demo.
