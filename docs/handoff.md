# Project handoff

## Current stage

- Done: login and registration through PHP (verified). Products routes through PHP (verified: `/tops` and `/api/products` show database data). Admin login works.
- In progress: checkout. `backend/checkout.php` is written (accepts province, zip, items; inserts orders, order_items, one pending payment; the trigger lowers stock). The orders INSERT was changed to store `total_amount`. NOT TESTED.
  - Pending check: bind_param for the orders INSERT must be `"id"` with `$userId` and `$total`.
- Not started: orders list, customer order history, admin stats, reports, QR payment in the footer and checkout (default still "GCash"), in-store staff sales page, remove `lib/prisma.ts` stub, stored procedures and triggers for the rubric, EXPLAIN examples, transaction demo, ERD and data dictionary, deployment.
- Build: `npm run build` is blocked by the `lib/prisma.ts` stub and other routes that still import Prisma (checkout, orders, customers, product images, stats).

The intended fresh setup imports `database/schema.sql`, but **that file is missing from this checkout**. Obtain the authoritative schema before relying on a clean database setup.

## New-computer setup

Follow the numbered setup in the root [README](../README.md): install XAMPP, Node.js, and Git; clone the repository; initialize the database; link the backend under XAMPP `htdocs`; create `frontend/.env.local`; install frontend packages with `npm install --ignore-scripts`; then run `npm run dev`.

The local frontend environment needs the API base URL:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost/janas-boutique
```

Never copy local passwords, `.env.local` contents, or database credentials into tracked files or handoff notes. The PHP connection settings live in `backend/db.php`.

## Suggested next steps

1. Recover and commit the authoritative `database/schema.sql`; verify its database and table names against `backend/db.php` and the PHP endpoints.
2. Migrate product reads and writes from Prisma routes to the PHP API, using the shared `backend/db.php` connection.
3. Migrate order history and checkout, including inventory updates and appropriate transaction handling.
4. Migrate admin totals to the PHP/MySQL data source.
5. Exercise each migrated flow locally before describing it as working.
