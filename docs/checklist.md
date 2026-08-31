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
- [-] Route-level lazy loading exists, but a production build has not been verified in this workspace because dependencies are not installed.
- [ ] Add meaningful unit/component tests for reducers, services, and critical flows.
- [ ] Add a project-specific README: setup steps, demo accounts, commands, features, limitations, and screenshots.
- [ ] Move the API base URL to an environment variable (for example `REACT_APP_API_URL`).
- [ ] Seed the database with products, categories, seller/admin accounts, carts, and orders for the demo.

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
- [ ] Seed and document a usable admin account.
- [ ] Add account restriction/soft-delete checks to login and protected application flows.
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

- [ ] Add a wishlist Redux slice and API service.
- [ ] Add/remove a product from the wishlist from product cards/details.
- [ ] Display saved products at `/wishlist`.
- [ ] Build customer order history at `/orders`.
- [ ] Allow authenticated customers to submit reviews and ratings.
- [ ] Display product reviews, count, and calculated average rating.

## 2. Product management

- [x] Product service supports list, detail, create, update, and delete requests.
- [x] Products Redux slice supports fetch, create, update, and delete actions.
- [x] Public product listing page requests products and categories.
- [x] Search products by title.
- [x] Filter products by category.
- [x] Product card supports image, title, description, category, price, discount, rating, and stock-status display when supplied by product data.
- [x] Reusable create/edit product modal component exists.
- [-] Categories endpoint and filtering UI exist, but the supplied database contains no category data.
- [-] Product fields for images, ratings, discounts, and availability are rendered, but the supplied database contains no products to demonstrate them.
- [-] Create/update/delete thunks exist but no current page connects them to a complete management workflow.
- [ ] Seed product categories and realistic product records with images.
- [ ] Add product details page/modal with complete information and reviews.
- [ ] Add price-range filter.
- [ ] Add availability/stock filter and sort controls.
- [ ] Add input validation for product creation/editing.
- [ ] Ensure stock is decremented safely when an order is placed.

## 3. Shopping cart and checkout

- [-] Customer-only `/cart` route and navbar cart link exist.
- [-] Product cards contain an add-to-cart button, but it only shows a browser alert.
- [-] Navbar reads a cart count from `state.cart`, but no cart reducer is registered, so the count is always empty.
- [ ] Create a cart Redux slice and register it in the store.
- [ ] Create cart API service and per-user cart persistence.
- [ ] Add items to cart.
- [ ] Remove items from cart.
- [ ] Adjust quantities and prevent quantities above available stock.
- [ ] Build cart page line items and empty state.
- [ ] Calculate subtotal, discount, shipping, and grand total.
- [ ] Build checkout screen with address selection.
- [ ] Support course-demo payment choices: saved card, cash on delivery, and wallet/mock payment.
- [ ] Add guest checkout as a bonus or explicitly exclude it from the MVP.
- [ ] Apply promo code and discount logic as a bonus.

## 4. Order management

- [-] `/orders` is protected for customers and sellers, but its page is only a placeholder.
- [ ] Create an order after successful checkout.
- [ ] Clear/update the cart after order placement.
- [ ] Display order confirmation with ID, items, address, payment method, and totals.
- [ ] Add order statuses: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, and `cancelled`.
- [ ] Display a customer order-tracking timeline/status.
- [ ] Allow sellers/admins to update statuses according to their permitted responsibilities.
- [ ] Send order email notifications as a real integration or label them as mocked bonus functionality.

## 5. Payment integration

- [x] Profile supports saving masked card metadata for a course-demo UI.
- [ ] Use saved-card data to prefill/select a checkout payment option.
- [ ] Implement Cash on Delivery.
- [ ] Implement wallet/mock wallet payment.
- [ ] Implement a real Stripe, PayPal, or Razorpay integration only if backend, keys, and server-side payment verification are available.
- [ ] Never store raw card numbers, CVVs, payment keys, or payment-provider secrets in `db.json` or the frontend.

## 6. Admin panel

- [x] Admin-only `/dashboard` route is protected by the frontend role guard.
- [-] Dashboard page exists but only renders placeholder text.
- [ ] Add dashboard statistics: users, products, orders, sales, and low-stock products.
- [ ] List and search users.
- [ ] Soft-delete/restrict and restore users; do not hard-delete records used by orders.
- [ ] Manage products and categories.
- [ ] Manage orders, shipping/status updates, and cancellations.
- [ ] Manage promo codes/discounts as a bonus.
- [ ] Manage homepage banners/content as a bonus.

## 7. Seller/vendor management

- [x] Sellers can register and access seller-only protected routes.
- [x] Seller profile has a payout-card tab using the shared masked-card UI.
- [-] `/inventory` and `/earnings` routes exist but their pages are placeholders.
- [ ] Give every seller-owned product a `sellerId`.
- [ ] List only the logged-in seller's inventory.
- [ ] Create, edit, delete, activate/deactivate, and update stock for owned products.
- [ ] Prevent sellers from modifying products owned by another seller.
- [ ] Show seller order-processing queue and allow valid status updates as a bonus.
- [ ] Calculate/display seller earnings and payouts as a bonus.

## 8. Bonus: marketing and engagement

- [ ] Promo codes and discounts.
- [ ] Email newsletter/marketing opt-in.
- [ ] Push notifications.
- [ ] Loyalty points/rewards.
- [ ] Social sharing and referrals.
- [x] Multi-language support (Arabic and English).

## 9. Final verification and presentation

- [ ] Install dependencies and confirm `npm run build` succeeds.
- [ ] Run tests with `npm test -- --watchAll=false` and fix relevant failures.
- [ ] Test all completed pages on a narrow/mobile viewport.
- [ ] Test each completed flow in Arabic/RTL and English/LTR, and in light/dark mode.
- [ ] Test unauthorized direct URL navigation for every customer/seller/admin route.
- [ ] Prepare customer, seller, and admin demo accounts and seed data.
- [ ] Prepare a presentation covering project goal, features, technologies, and architecture.
- [ ] Rehearse customer, seller, and admin demos without exposing real credentials or card information.
- [ ] Prepare fallback screenshots/video in case the local server is unavailable.
- [ ] Update this checklist and [the implementation plan](plan.md) before the final presentation.

## Recommended next five tasks

1. Install dependencies, start the API, and seed the database with enough realistic data to
   make the existing catalogue demonstrable.
2. Implement the cart slice/service/page and connect the current product-card action.
3. Implement checkout, order creation, and customer order history.
4. Build seller inventory CRUD using the already-created product thunks and modal.
5. Build the admin dashboard and management views, then complete test/presentation polish.
