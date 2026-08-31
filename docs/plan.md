# MyShop — ITI React Summer Course Plan

## 1. Project goal

Build and present a responsive, role-based e-commerce frontend. The application must let
customers discover and buy products, sellers manage their stock, and administrators manage
the marketplace. The current project already has a React/Redux foundation, authentication,
profile address/card screens, a product-listing screen, Arabic/English support, dark mode,
and protected role routes.

The local `json-server-auth` backend is suitable for the course demo. Features that require
an external provider (Google login, email, Stripe/PayPal, push notifications) should be
presented as clearly-labelled bonus integrations or mocked in the UI unless a real backend
and credentials are available.

## 2. Current baseline

| Area               | Current state                                                    | Required next work                                                                                           |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Authentication     | Email/password registration and login; customer/seller selection | Add email uniqueness feedback, preserve intended redirect after login, and document mock/bonus social login. |
| Profile            | Edit name/email/phone, addresses, saved card metadata            | Validate inputs, safely implement password change, and expose profile feedback consistently.                 |
| Products           | Fetch, search by name, category filter, reusable product card    | Seed categories/products; add price/stock filtering and product detail behavior.                             |
| Cart and wishlist  | Routes and navbar links exist                                    | Implement Redux/API state and full UI.                                                                       |
| Orders             | Route exists                                                     | Implement checkout, history, order states, and role-specific processing.                                     |
| Seller/admin       | Protected routes exist                                           | Build inventory and admin management screens.                                                                |
| Localization/theme | Arabic/English and dark mode work                                | Translate all new user-facing content and test RTL layouts.                                                  |

## 3. Scope and priorities

### Must-have course MVP

1. Email/password registration and login for customer and seller; an admin account seeded in `db.json`.
2. Customer profile, addresses, saved-card metadata, wishlist, cart, checkout, and order history.
3. Product catalogue with categories, images, price, stock status, search, and filters.
4. Seller inventory CRUD and stock updates for that seller's products.
5. Admin user soft-delete/restrict actions, category/product management, and order-status management.
6. Arabic/English support and responsive layouts for all completed screens.

### Bonus only after the MVP is demonstrable

- Google/social authentication and confirmation email.
- Real Stripe/PayPal integration, promotional codes, wallet, and guest checkout.
- Email notifications, marketing, loyalty, referrals, and push notifications.
- Seller earnings/payouts and richer analytics.

Do not claim that a mocked integration is a real payment, email, or social-login system in
the presentation.

## 4. Proposed technical design

### Frontend

- **React 19 + React Router:** pages, layouts, lazy loading, and role-protected routes.
- **Redux Toolkit:** keep `auth`, `ui`, `products`, and `profile`; add `cart`, `wishlist`,
  `orders`, and optionally `users`/`categories` slices.
- **Axios services:** one service per resource (`auth`, `products`, `profile`, `cart`,
  `wishlist`, `orders`, `admin`). Use a `REACT_APP_API_URL` environment variable instead of
  a hard-coded host.
- **Tailwind CSS + Font Awesome:** responsive UI and accessible controls.
- **i18next:** add every new visible string to both Arabic and English JSON files.

### Demo data model (`db.json`)

| Resource     | Important fields                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `users`      | `id`, `name`, `email`, `phone`, `role`, `isDeleted`, `isRestricted`                                                       |
| `categories` | `id`, `name`, `slug`, `image`                                                                                             |
| `products`   | `id`, `sellerId`, `title`, `description`, `price`, `category`, `thumbnail`, `stock`, `isActive`                           |
| `carts`      | `id`, `userId`, `items: [{ productId, quantity, price }]`                                                                 |
| `wishList`   | `id`, `userId`, `productIds` (or one row per product)                                                                     |
| `orders`     | `id`, `userId`, `items`, `addressId`, `paymentMethod`, `subtotal`, `discount`, `shipping`, `total`, `status`, `createdAt` |
| `reviews`    | `id`, `productId`, `userId`, `rating`, `comment`, `createdAt`                                                             |
| `promoCodes` | `id`, `code`, `type`, `value`, `active`, `expiresAt`                                                                      |

For a frontend demo, never save a full card number or CVV. Persist only masked card data
such as last four digits, brand, expiry, and card holder.

## 5. Build checklist

- [ ] **1. Stabilize the project and seed demo data**
  - Build: install dependencies, start both servers, add representative categories,
    customer/seller/admin users, products with images/stock, and sample orders.
  - Acceptance: the home page renders a populated catalogue and every role has demo data.
  - Verify: run `npm run server`, `npm start`, then view `/products`.

- [ ] **2. Complete product discovery**
  - Build: add price-range and availability filters, sort options, product details, and
    empty/error states. Ensure category values match the product data.
  - Acceptance: a user can search by name and combine category, price, and stock filters.
  - Verify: manually filter seeded products and confirm results/counts change correctly.

- [ ] **3. Implement cart state and cart page**
  - Build: create `cartSlice` and cart service; add, remove, increment, decrement, and
    persist cart items per user. Replace the current product-card alert.
  - Acceptance: cart badge, totals, and line-item quantities stay accurate after refresh.
  - Verify: add a product, change quantity, remove it, refresh, and inspect `/cart`.

- [ ] **4. Implement wishlist and reviews**
  - Build: add a wishlist slice/service with a favourite toggle; add authenticated review
    and rating submission/display on product details.
  - Acceptance: favourites are visible at `/wishlist`; reviews are tied to the product and
    display an average rating.
  - Verify: favourite/unfavourite a product, submit a review, and refresh the page.

- [ ] **5. Build checkout and order history**
  - Build: select an address and a mock payment method (saved card/COD/wallet), calculate
    subtotal, shipping, discount, and total, then create an order and clear the cart.
  - Acceptance: an order confirmation appears and the customer can see it at `/orders`.
  - Verify: place an order with two products; compare the checkout total and saved order.

- [ ] **6. Add order status and customer tracking**
  - Build: define statuses such as `pending`, `confirmed`, `processing`, `shipped`, and
    `delivered`; show a clear status timeline in order history.
  - Acceptance: customers can see an order's current status and item/payment summary.
  - Verify: update a seeded order status and refresh the customer order page.

- [ ] **7. Build seller inventory management**
  - Build: populate `/inventory` with only the logged-in seller's products; connect the
    existing product modal to create/edit/delete actions; allow stock updates.
  - Acceptance: a seller cannot manage another seller's products and changes appear in the
    public catalogue.
  - Verify: log in as seller, create/edit/delete a product, then inspect `/products`.

- [ ] **8. Build admin management screens**
  - Build: add dashboard summaries, user list with soft-delete/restrict action, category
    CRUD, product moderation, and order-status/shipping management.
  - Acceptance: only admins can access these actions; restricted/soft-deleted users cannot
    use protected flows.
  - Verify: test each route with customer, seller, and admin accounts.

- [ ] **9. Harden validation and session behavior**
  - Build: validate unique email, phone, profile fields, card length/expiry, and stock;
    preserve the requested route after login; guard malformed local storage and API errors.
    Password changes must require current-password verification from a proper backend; keep
    this screen disabled or marked mock-only with `json-server-auth` if that backend cannot
    provide it.
  - Acceptance: invalid data has readable translated errors and cannot corrupt client state.
  - Verify: test invalid registration, expired/short card input, malformed `authData`, and
    unauthorized URL navigation.

- [ ] **10. Finish polish, tests, and accessibility**
  - Build: complete Arabic/English strings, RTL checks, responsive layouts, loading/error
    states, keyboard-accessible modals, image alt text, and focused tests for reducers and
    critical user flows.
  - Acceptance: core flows work on mobile/desktop, in both languages and both themes.
  - Verify: run `npm run build` and `npm test -- --watchAll=false`; manually test RTL and
    a narrow viewport.

## 6. Presentation plan

### Suggested 8–10 minute structure

1. **Problem and goal (0:30):** introduce MyShop and the three roles.
2. **Technology choices (1:00):** React, Router, Redux Toolkit, Axios, Tailwind,
   i18next, and `json-server-auth`; explain why Redux is used for shared app state.
3. **Customer walkthrough (3:00):** register/login, switch language/theme, search/filter,
   add to wishlist/cart, checkout, and view tracked order.
4. **Seller walkthrough (1:30):** login as seller, manage an owned product and stock.
5. **Admin walkthrough (1:30):** login as admin, manage users/categories/products/orders.
6. **Codebase walkthrough (1:30):** show `App.jsx` routes/guards, Redux slices, services,
   component reuse, and translation files.
7. **Closing (0:30):** recap completed requirements, name bonus/mock features honestly, and
   describe the next production steps (real backend, payment provider, email service).

### Demo safety checklist

- Start the API before the frontend and verify port `3001` is available.
- Seed and test customer, seller, and admin accounts in advance.
- Keep one browser profile/incognito window available for each role if role switching is slow.
- Prepare one product, one cart, and one order so every interaction has visible data.
- Avoid real card numbers, credentials, or payment keys in the demo or repository.
- Have screenshots or a short recording as a fallback for network/server issues.

## 7. Definition of done

The MVP is ready for presentation when all must-have routes are implemented, each role has
one end-to-end flow, data changes persist in the local API, role restrictions hold when URLs
are entered directly, the product catalogue is seeded, and the production build/tests pass.
