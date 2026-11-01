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

## Current limits

Products, orders, checkout, and admin totals are not migrated yet. See [docs/handoff.md](docs/handoff.md) before continuing development.
