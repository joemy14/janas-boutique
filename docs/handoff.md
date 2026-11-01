# Project handoff

## Current state

- Repository: Jana's Boutique; active branch seen during this handoff: `combined`.
- `backend/` contains the PHP API. Use `backend/db.php` as the shared MySQL connection; its default database name is `janas_boutique`.
- `frontend/` contains the Next.js app. Start it from that directory with `npm run dev` after installing dependencies.
- The intended fresh setup imports `database/schema.sql`, but **that file is missing from this checkout**. Add or locate the authoritative schema before relying on a clean-machine setup.
- The frontend includes remaining Prisma-backed API routes for products, orders/checkout, and admin stats. The PHP backend's login and stats endpoints exist, but this does not mean the full application has been migrated or verified.

## Known limits

- Products, orders, checkout, and admin totals are not migrated yet.
- Do not treat product/order/checkout/admin-total flows as complete until their data access is migrated and exercised against the PHP/MySQL backend.
- The repository does not include `database/schema.sql` at present, so fresh database initialization is blocked until it is supplied.

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
