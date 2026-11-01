# HANDOFF: Jana's Boutique Project

## 1. Project overview
- Course: Database Systems 1 (IM101 / CC105), BSIT 3A & 3B, Holy Cross of Davao College
- System: Online Ordering and Inventory Management for Jana's Boutique (women's apparel store, Davao)
- Users: Admin (owner Jana), Staff (5 workers, sales and inventory), Customer (online shoppers)
- Payments: QR (any e-wallet or bank) and cash (in-store)
- Sizes: stock tracked per size. One-size items use `ONE`.

## 2. Decisions made
- No table prefix (`products`, not `tbl_products`).
- Roles: `admin`, `staff`, `customer`.
- Stock goes down when an order is placed. Cancelling puts it back.
- Password reset included.
- Sample data is synthetic only (policy requirement).
- Final project is the database-driven system described in the course rules (see section 6).

## 3. What is done
- [x] Proposal submitted (Google Slides "Jana's Boutique System Proposal")
- [x] Final database design: 10 tables (users, password_resets, categories, products, product_sizes, orders, order_items, payments, stock_movements, feedback)
- [x] `schema.sql` written and run in phpMyAdmin with no errors
  - 1 function (`fn_order_total`)
  - 2 triggers (`trg_order_items_before_insert`, `trg_order_items_after_insert`)
  - 2 procedures (`sp_create_order`, `sp_cancel_order`)
  - 1 view (`v_low_stock`)
  - 3 indexes (for the optimization section)
- [x] Admin account created with hashed password (Admin123!). Test password only, change before final demo.
- [x] `backend/login.php` rewritten for `janas_boutique` and new columns. Tested: returns admin role.
- [x] `backend/stats.php` created for dashboard numbers. Tested: dashboard shows live numbers.
- [x] Frontend `LoginForm.js` points to new backend URL and redirects by role (admin to /admin, staff to /admin/orders, customer to /profile).
- [x] `admindashboard.js` checks `role` and uses `stats.php`. Card renamed to "Active Products".
- [x] Repo cloned locally: `C:\Users\Mayumi\Downloads\jmc\janas-boutique`
- [x] XAMPP link: `C:\xampp\htdocs\janas-boutique` points to the repo.
- [x] Frontend runs with `npm run dev` in `frontend\my-app` on http://localhost:3000

## 4. Current step
- Test staff login: `staff@example.test` / `Staff123!`
  - Set the hash first (same method as admin: hash.php, then UPDATE users).
  - Expected: redirect to /admin/orders.
  - Status: NOT YET TESTED.

## 5. Known issues and to-do
- [ ] Staff login test (current)
- [ ] `pages/adminlogin.js` still exists and calls old `admin_login.php`. Delete it.
- [ ] `LoginForm.js` still has "Login as Admin" link to /adminlogin. Remove it.
- [ ] `admindashboard.js` sidebar links and other pages still call the old `Backend/CC105Backend` folder. Update each page one at a time.
- [ ] Old `admin` page logic (`localStorage.is_admin`) in other pages. Change to `role`.
- [ ] Remove `hash.php` from htdocs if it still exists.
- [ ] Remove `php-error.log`, `vendor/`, `node_modules/` from GitHub (add to .gitignore).
- [ ] Delete unused files: `testEmail.js`, `pages/api/hello.js`, `create_admin_hash.php` (move out of web folder).
- [ ] Old backend files still reference `cc105_boutique` and old column names. Update each to `janas_boutique`.
- [ ] Login-related: password reset pages (`/forgotpassword`, `/adminforgotpassword`) use old backend.
- [ ] Registration (sign up) page for customers: check it uses new columns (user_id, password_hash, role).
- [ ] Customer flows: product list, cart, checkout (use sp_create_order and order_items trigger), order history.
- [ ] Staff flows: record store sales (channel = store, payment = cash), update order status.
- [ ] Admin flows: products CRUD, product_sizes stock, staff account creation, reports.
- [ ] QR payment page (payments table, method = qr, provider, reference_no).

## 6. Course requirements checklist (from "FINAL PROJECT - DATABASE SYSTEMS 1")
Required:
- [ ] At least 5 tables (we have 10)
- [ ] Primary and foreign keys (done in schema)
- [ ] 3NF normalization explanation (in documentation)
- [ ] Data dictionary (documentation)
- [ ] ERD (documentation, use the new design, not the proposal diagram)
- [ ] DDL: CREATE, ALTER, DROP (schema has CREATE and DROP DATABASE; add an ALTER example)
- [ ] DML: INSERT, SELECT, UPDATE, DELETE (in app)
- [ ] Filtering, sorting, aggregate queries (reports)
- [ ] Joins (order and product queries)
- [ ] Subqueries (add one, e.g. products never ordered)
- [ ] Set operation UNION (e.g. online plus store sales)
- [ ] 2+ stored procedures (done: sp_create_order, sp_cancel_order)
- [ ] 1+ function (done: fn_order_total)
- [ ] 2+ triggers (done: 2)
- [ ] 2+ query optimization examples with EXPLAIN (indexes added; need before/after plans)
- [ ] 1+ transaction demo (sp_cancel_order uses one; also show ROLLBACK)
- [ ] Concurrency explanation (two buyers, last item, row locking via FOR UPDATE)
- [ ] App: CRUD, search and filter, validation, error handling
- [ ] 3+ reports (sales by month, low stock via v_low_stock, top products)
- [ ] Authentication and role-based access (done for login; enforce roles on all admin pages)
- [ ] Discussion: distributed database, XML use, data warehousing (written proposal section)

Deliverables:
- [ ] Milestone 1: proposal (done)
- [ ] Milestone 2: ERD, business rules, schema, normalization, data dictionary
- [ ] Milestone 3: SQL files (schema.sql done; add queries file)
- [ ] Milestone 4: application (in progress)
- [ ] Milestone 5: testing, optimization evidence, transaction demo
- [ ] Final: user guide, presentation slides, demo video or live demo
- [ ] Working application source code in GitHub repo
- [ ] Presentation: each member must explain their part

## 7. Instructor concerns to answer
- ERD: explain the change from the proposal (inventory per size, not 1:1 per product).
- Admin login: admin accounts are created with password_hash() (PHP). Passwords are never stored as plain text. Login uses password_verify().
- Roles: admin (owner), staff (workers), customer.

## Files and locations
- Repo root: C:\Users\Mayumi\Downloads\jmc\janas-boutique
- Active branch: combined (main still has the old frontend at frontend/my-app)
- Frontend: frontend/ (friend's Next.js + TypeScript code, copied from friend-repo)
- Backend: backend/ (PHP + MySQL, janas_boutique database)
- Database SQL: database/schema.sql
- Frontend env: frontend/.env.local, must contain NEXT_PUBLIC_API_URL=http://localhost/janas-boutique/backend
- Friend's original repo: C:\Users\Mayumi\Downloads\jmc\friend-repo\jana-s-boutique-ver2.0-main

## Current stage
- Stage: login works through PHP (verified). Next: lib/orders.ts build error.
- Prisma removed from frontend/package.json. Remaining Prisma imports: lib/*.ts and pages/api/*.

## Known problems
- npm run build fails on Prisma imports (expected, being replaced).
- frontend/my-app was deleted; main branch still has it.

## 9. Rules for the next AI or person picking this up
- Keep replies short and in clear steps. The user has ADHD. Give one next action at a time.
- Do not invent facts about the rules, the proposal, or the code. Ask the user to paste the file.
- Test login and each feature before moving on.
- Never store real personal data. Synthetic data only.
- Never put passwords or .env values in GitHub or in these notes.
- Change the test passwords (Admin123!, Staff123!) before the final demo.

## 10. Plan (order)
1. Finish login and role tests (admin and staff).
2. Clean up old files and old backend references.
3. Customer flow: sign up, products, cart, checkout, order history.
4. Staff flow: store sales, order status.
5. Admin flow: products, stock, staff accounts, reports.
6. Add missing SQL: subquery, UNION, ALTER, EXPLAIN examples, ROLLBACK demo.
7. Documentation: ERD, data dictionary, normalization, user guide.
8. Testing and optimization evidence.
9. Deploy (after everything works locally).
10. Presentation and demo.
