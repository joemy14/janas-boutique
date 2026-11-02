# Jana's Boutique

Online ordering and inventory management project for Jana's Boutique. The repository contains a PHP/MySQL backend in `backend/` and a Next.js frontend in `frontend/`.

## Set up on a new computer

Complete these steps in order.

1. Install [XAMPP](https://www.apachefriends.org/) and start Apache and MySQL.
2. Install [Node.js](https://nodejs.org/) (LTS) and [Git](https://git-scm.com/).
3. Clone this repository and enter its folder:

   ```powershell
   git clone <repository-url>
   cd janas-boutique
   ```

4. Create the MySQL database by importing `database/schema.sql` in phpMyAdmin, or by running it with the MySQL client. **That SQL file is not present in this checkout yet.** Obtain/add the project schema before expecting a fresh database setup to work.
5. Link the repository's backend into XAMPP's document root. In PowerShell, from the repository root:

   ```powershell
   New-Item -ItemType Junction -Path C:\xampp\htdocs\janas-boutique -Target (Join-Path (Get-Location) 'backend')
   ```

   If that path already exists, inspect it before replacing it. The API base URL below assumes Apache serves the backend at `http://localhost/janas-boutique`.
6. Create `frontend/.env.local` with:

   ```dotenv
   NEXT_PUBLIC_API_URL=http://localhost/janas-boutique
   ```

   Keep local credentials and environment files private; do not commit them.
7. Install frontend dependencies and start the development server:

   ```powershell
   cd frontend
   npm install --ignore-scripts
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000). Keep XAMPP's Apache and MySQL running while using the app.

The PHP database connection is configured in `backend/db.php` (default local MySQL database: `janas_boutique`, user `root`, blank password). Adjust that file for the local machine if its MySQL credentials differ; do not add credentials to this README.

## Project map

- `backend/` — PHP API and shared database connection (`db.php`)
- `frontend/` — Next.js application
- `docs/handoff.md` — current status, known limits, and suggested next work

## Documentation

- [Project handoff](docs/handoff.md)
- [Entity-relationship diagram](docs/erd.md)
- [Data dictionary](docs/data-dictionary.md)
- [Normalization notes](docs/normalization.md)
- [Query optimization](docs/query-optimization.md)
- [Transaction demo](docs/transaction-demo.md)
- [User guide](docs/user-guide.md)
- [Deployment guide](docs/deployment.md)

## Current limits

- Done: login and registration through PHP (verified); products routes through PHP (verified: `/tops` and `/api/products` show database data); admin login works.
- In progress: checkout. `backend/checkout.php` is written and inserts orders, order items, and one pending payment; the trigger lowers stock. The orders INSERT stores `total_amount`. Checkout is NOT TESTED; verify its `bind_param` is `"id"` with `$userId` and `$total`.
- Not started: orders list and customer order history, admin stats and reports, QR payment in the footer and checkout (default still "GCash"), in-store staff sales page, removing the `lib/prisma.ts` stub, rubric stored procedures and triggers, EXPLAIN examples, transaction demo, ERD and data dictionary, and deployment.
- Build: `npm run build` is blocked by the `lib/prisma.ts` stub and routes that still import Prisma (checkout, orders, customers, product images, stats).

See [docs/handoff.md](docs/handoff.md) for the full project status and setup notes.
