# Purchase Portal Admin Panel

## Running locally (development)

Nothing has changed here — this still works exactly as before:

```bash
docker compose up --build
```

- PostgreSQL → localhost:5432
- Django API (runserver) → http://localhost:8000
- React (Vite dev server) → http://localhost:5173

## Deploying to production (e.g. AWS EC2)

A separate, production-only setup lives alongside the dev one and does not
touch it: Gunicorn instead of `runserver`, a built React app served by
Nginx instead of the Vite dev server, no exposed Postgres/backend ports,
and environment-driven secrets.

```bash
cp .env.example .env
# edit .env — set DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS,
# CORS_ALLOWED_ORIGINS, CSRF_TRUSTED_ORIGINS, POSTGRES_PASSWORD

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

App: `http://<server-ip>/`  ·  API: `http://<server-ip>/api/`  ·  Health check: `http://<server-ip>/api/health/`


A full-stack purchase/order management admin panel: Django 4.2 + DRF backend
(PostgreSQL, JWT auth) and a React 18 + TypeScript + Tailwind CSS frontend
styled to match the Purchase Portal mobile design (purple `#6C5CE7` primary,
Inter font, card-based UI).

## Project structure

```
purchase-portal/
├── backend/            Django + DRF API
├── frontend/           React + TypeScript admin UI
└── docker-compose.yml  postgres + backend + frontend
```

## Option A — Run everything with Docker (fastest)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- Django API on `http://localhost:8000` (migrations + seed data run automatically)
- React dev server on `http://localhost:5173`

Open `http://localhost:5173` and log in with:
- Superadmin: `admin@store.com` / `123456`
- Store admin: `manager@store.com` / `123456`

## Option B — Run locally without Docker

### 1. PostgreSQL

Install PostgreSQL locally and create a database:

```bash
createdb purchase_portal
```

Or run just the Postgres container:

```bash
docker run --name pp-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=purchase_portal -p 5432:5432 -d postgres:15-alpine
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # adjust DB credentials if needed

python manage.py makemigrations accounts stores vendors products orders activity
python manage.py migrate
python manage.py createsuperuser   # optional, seed_data already creates one
python manage.py seed_data         # creates demo store, users, vendors, products, orders

python manage.py runserver          # http://localhost:8000
```

Demo accounts created by `seed_data`:

| Role         | Username            | Password |
|--------------|----------------------|----------|
| Super Admin  | admin@store.com      | 123456   |
| Store Admin  | manager@store.com    | 123456   |
| Staff (x3)   | staff1..3@store.com  | 123456   |

### 3. Frontend setup

```bash
cd frontend
npm install

cp .env.example .env    # VITE_API_BASE_URL=http://localhost:8000/api

npm run dev              # http://localhost:5173
```

The Vite dev server also proxies `/api` to `http://localhost:8000`, so the
frontend works even if `VITE_API_BASE_URL` is left relative.

## API overview

All endpoints are namespaced under `/api/`. JWT auth via
`djangorestframework-simplejwt`:

- `POST /api/auth/login/` — obtain access/refresh tokens
- `POST /api/auth/refresh/` — refresh access token
- `GET  /api/auth/me/` — current user
- `/api/stores/` — CRUD, superadmin only
- `/api/users/` — list/create staff, store-scoped
- `/api/vendors/`, `/api/products/` — store-scoped CRUD
- `/api/orders/` — list (filters: `status`, `vendor`, `staff`, `date_from`,
  `date_to`, `search`), create
- `/api/orders/{id}/` — retrieve/update/delete
- `/api/orders/{id}/items/` — add item to an order
- `/api/order-items/{id}/` — PATCH/DELETE, plus actions:
  - `POST /api/order-items/{id}/collect/`
  - `POST /api/order-items/{id}/deliver/`
  - `POST /api/order-items/{id}/uncollect/` (body: `{ "reason": "..." }`)
- `/api/activity/` — audit log (filters: `actor`, `action`, `search`, dates)
- `/api/reports/dashboard/` — KPI summary
- `/api/reports/volume/?days=14` — daily order counts
- `/api/reports/vendor-performance/` — units ordered/collected per vendor
- `/api/reports/staff-performance/` — collected/delivered counts per staff member
- `/api/reports/uncollected/` — list of uncollected items

## Roles & permissions

- **SUPERADMIN** — full access across all stores, manages `Store` records.
- **STORE_ADMIN** — manages their store's users, vendors, products, orders.
- **STAFF** — can view/edit orders, vendors, products, but cannot delete users.

Order status (`PENDING → PARTIAL → COLLECTED → DELIVERED`) is recomputed
automatically whenever an item is collected, delivered, uncollected, added,
or removed. Every state-changing action is written to `ActivityLog`.

## Notes

- CSV export on tables is implemented client-side (no external CSV library).
- Bulk product import on the Catalog page is a mocked/simulated import for
  demo purposes — wire it to a real `POST /api/products/bulk-import/`
  endpoint for production use.
- CORS is fully open (`CORS_ALLOW_ALL_ORIGINS = True`) for local development;
  tighten this before deploying.
