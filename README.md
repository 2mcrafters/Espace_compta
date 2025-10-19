# Espace Compta — Laravel + React (Vite) + MySQL + Tailwind

This workspace contains a Laravel backend and a Vite + React + Tailwind frontend, wired with a dev proxy and a sample `/api/ping` route.

## Prerequisites
- PHP 8.2+
- Composer 2+
- Node.js 18+ and npm
- A MySQL server with a database named `espace_compta`

## Backend (Laravel)
- Location: `backend/`
- Env (`backend/.env`) DB settings already set to:
  - DB_CONNECTION=mysql
  - DB_HOST=127.0.0.1
  - DB_PORT=3306
  - DB_DATABASE=espace_compta
  - DB_USERNAME=root
  - DB_PASSWORD=

Initial setup:
1. Generate key (done):
   - `php artisan key:generate`
2. Run migrations:
   - `php artisan migrate`

Run server (any one of the below):
- Built-in server from public directory:
  - `cd backend/public` then `php -S 127.0.0.1:8002 index.php`
- Or Artisan serve (if available on your system ports):
  - `php artisan serve --host=127.0.0.1 --port=8001`

API test:
- GET `http://127.0.0.1:8002/api/ping`

## Frontend (Vite + React + Tailwind)
- Location: `frontend/`
- Tailwind v4 (import-only) is used, see `src/styles.css`.

Install and run:
- `npm install`
- `npm run dev`

The dev server listens on port 5173. It proxies `/api` to the backend at `http://127.0.0.1:8002`.

Open http://localhost:5173 and click "Ping API" to verify end-to-end.

## Notes
- CORS is enabled via Laravel's global `HandleCors` middleware and config `config/cors.php` allowing `http://localhost:5173` by default. You can adjust `CORS_ALLOWED_ORIGINS` in `backend/.env` if needed.
- To change DB credentials, edit `backend/.env` and re-run migrations.
# Espace_compta

## GED confidentiality

- When uploading a client document, you can mark it as confidential (Confidentiel toggle in the UI).
- Only ADMIN and CHEF_EQUIPE can list and download confidential documents. Others will not see them.
- Endpoints:
  - GET `/api/clients/{client}/documents` (filters confidential docs for non-privileged)
  - POST `/api/clients/{client}/documents` (multipart: file, category, title, is_confidential)
  - GET `/api/clients/{client}/documents/{document}/download`
  - DELETE `/api/clients/{client}/documents/{document}`

## Collaborators assignment

- You can assign collaborators to Portfolios and Clients via the UI modals.
- For Tasks, use the assignee dropdown on each task card (requires `tasks.manage`).
- Users lookup endpoint for dropdowns: GET `/api/users/lookup`.

## Tasks workflow

- Columns by status: En attente, En cours, En validation, Terminée.
- Filters: category, nature, and owner.
- Quick-edit: change status from a select and adjust progress with a slider.
- Start/Stop time tracking buttons per task; see live running state.
- Assignees are shown as initials bubbles on task cards.
