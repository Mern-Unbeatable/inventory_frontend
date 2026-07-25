# Inventory Management — Frontend

React 19 + Vite dashboard for the inventory backend (`../api`), aligned with `../api/postman`.

## Stack

- React 19, Vite, React Router DOM
- Tailwind CSS v4
- Redux Toolkit + React Redux
- Axios (centralized client with JWT refresh)
- React Hook Form + Zod
- React Hot Toast, Lucide icons

## Architecture

```
Component → Feature Hook → AsyncThunk → Service → *API.js → Axios client → Backend
```

UI state (modals) stays local. Domain data lives in Redux slices under `src/features/`.

## Run

```bash
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

Default API: `http://localhost:5000/api`

### Seed credentials (from API seed)

| Role   | Email                              | Password       |
|--------|-------------------------------------|----------------|
| Admin  | `admin@inventory.com`               | `Admin@12345`  |
| Seller | `seller.addis@inventory.com`        | `Seller@12345` |
| Seller | `seller.hawassa@inventory.com`      | `Seller@12345` |
| Seller | `seller.dhaka@inventory.com`        | `Seller@12345` |
| Seller | `seller.chittagong@inventory.com`   | `Seller@12345` |

## Roles

| Role | Access |
|------|--------|
| ADMIN | Dashboard, countries, branches, users, products CRUD, inventory assign/quantity |
| SELLER | Dashboard (own summary), products (assigned + sell), inventory (own stock) |

For a full walkthrough of Admin and Seller day-to-day flows, see **[../WORKFLOWS.md](../WORKFLOWS.md)**.

## API alignment notes

- Auth tokens come nested: `data.tokens.accessToken` / `refreshToken`
- Products use `title` + `price` (not `name` / `basePrice`)
- Inventory is **user–product** assignment (not branch stock / sales)
- Cascading filters: Country → Branch → Seller
- Dashboard uses a single role-aware `/dashboard/overview` endpoint
# inventory_frontend
