# Deployment guide

This project runs the Next.js frontend on Vercel and the PHP/MySQL backend on InfinityFree. Keep real database credentials and the shared session secret in hosting environment settings or untracked `.env` files; never add them to Git.

## 1. Database (InfinityFree)

1. Create an InfinityFree hosting account and add the domain or subdomain for the site.
2. Open the hosting account's Control Panel and create a MySQL database. Record the database host, database name, username, and password shown by the panel; use those assigned values rather than the examples in `backend/.env.example`.
3. Open phpMyAdmin from the Control Panel and select the newly created database.
4. Choose **Import**, select `database/schema.sql`, and run the import. Confirm the tables, views, routines, and triggers are present before deploying the app.
5. Create an untracked `backend/.env` on the server using `backend/.env.example` as a template. Fill in the database values and set `SESSION_SECRET` to the same random value configured for the frontend. The `db.php` connection reads `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` from this file.

After importing the schema, you must manually create an admin account. You can register a normal account on the site, then go into phpMyAdmin, open the `users` table, and change that user's `role` from 'customer' to 'admin'.

## 2. Backend (InfinityFree)

Upload the contents of the repository's `backend/` folder with InfinityFree File Manager or an FTP client. Place them under `htdocs/janas-boutique/backend/` if you want the API base URL to be `https://your-infinityfree-domain.example/janas-boutique`; alternatively, place them in the matching directory for your chosen API base URL. The resulting product endpoint should resolve at `<API base URL>/backend/getProducts.php`.

Keep `backend/.env` private and outside the Git repository. In particular, do not upload `backend/.env.example` as if it were a configured credential file.

After upload, open `<API base URL>/backend/getProducts.php` in a browser to check that the endpoint responds. A JSON error about database connection indicates that the host/name/user settings or database import need attention; an HTML page or 404 usually indicates an incorrect folder path.

## 3. Frontend (Vercel)

1. In Vercel, import the GitHub repository and select the Next.js project.
2. Set **Root Directory** to `frontend/`.
3. In the project's environment variable settings, add:
   - `NEXT_PUBLIC_API_URL`: the backend base URL, without `/backend` at the end (for example, `https://your-infinityfree-domain.example/janas-boutique`).
   - `SESSION_SECRET`: the same random value used in `backend/.env`, at least 32 characters long.
   - `APP_ENV`: `production`, so the session cookie uses `SameSite=None; Secure`.
4. Deploy the project. When an environment variable changes, create a new deployment so the new value is used.

Vercel's environment variables are configured in project settings and apply to new deployments; changes do not retroactively update existing builds. See [Vercel's environment variable documentation](https://vercel.com/docs/environment-variables) and [Git deployment documentation](https://vercel.com/docs/git).

## 4. CORS checklist

- Set `ALLOWED_ORIGIN` in `backend/.env` to the exact deployed frontend origin, such as `https://your-app.vercel.app`.
- Include the scheme (`https://`), but no path, trailing slash, or endpoint suffix.
- The value must match the browser's frontend origin exactly, including a custom domain if one is used.
- Keep the same `SESSION_SECRET` in the frontend and backend configuration.
- If a deployment URL changes, update `ALLOWED_ORIGIN` and redeploy or restart the backend as needed.

## 5. Rollback

### Frontend

In the Vercel project, open **Deployments**, find the previous working production deployment, and use its menu to roll back or promote it. A rollback restores the prior deployment; changed environment variables require a new deployment to take effect. See [Vercel's rollback guide](https://vercel.com/docs/instant-rollback).

### Database

Before importing schema changes or modifying production data, export a backup from the database in phpMyAdmin. To restore it, select the intended database in phpMyAdmin, open **Import**, and import the backup file. Confirm the selected database and backup before starting, because restoring a dump can replace existing tables and data.

InfinityFree's support documentation describes creating the database first, using phpMyAdmin, and uploading website files beneath `htdocs`; see [their migration guide](https://forum.infinityfree.com/t/how-to-migrate-your-website-to-infinityfree/49315/1) and [file placement guidance](https://forum.infinityfree.com/t/why-are-my-files-deleted-after-uploading-them/49310).
