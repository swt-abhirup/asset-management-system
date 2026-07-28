# IT Asset Management System (AMS)

A full-stack IT Asset Management System built for enterprise use. Tracks the complete lifecycle of IT assets — from procurement to assignment, maintenance, and retirement — through a modern, responsive web interface backed by a serverless AWS DynamoDB database.

---

## 🖥️ Live Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time KPIs, asset status breakdown, procurement snapshot, alert banners, recent activity |
| **Assets** | Add, edit, retire IT assets with category, brand, model, serial number, warranty tracking |
| **Employees** | Staff directory with roles, departments, and asset assignment history |
| **Assignments** | Assign assets to employees, track active assignments, process returns |
| **Maintenance** | Schedule and track service, repair, inspection, and upgrade logs |
| **Repair Requests** | Raise, assign, prioritise (critical/high/medium/low) and resolve hardware issues |
| **Warranty Expiry** | Visual expiry tracker — expired, expiring soon, within 90 days, valid |
| **Vendors** | Supplier directory with contact details, categories, and purchase history |
| **Purchases** | Purchase orders with line items, payment status tracking, and vendor linkage |
| **Categories** | Manage asset categories (Laptop, Server, Monitor, etc.) with live asset counts |
| **User Profile** | View and edit own profile, change password, view assigned assets |

---

## 🛠️ Tech Stack

### Backend — `ams-api`

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | v5 | REST API framework |
| AWS DynamoDB | SDK v3 | NoSQL database (serverless) |
| JSON Web Token | v9 | Stateless authentication |
| bcryptjs | v3 | Password hashing |
| UUID | v14 | Unique ID generation |
| dotenv | v17 | Environment configuration |
| nodemon | v3 | Development hot-reload |

### Frontend — `ams-client`

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | v19 | UI framework |
| Vite | v8 | Build tool & dev server |
| React Router DOM | v7 | Client-side routing |
| Tailwind CSS | v4 | Utility-first styling |
| Axios | v1 | HTTP client with interceptors |
| Lucide React | v1 | Icon library |

### Cloud Infrastructure

| Service | Usage |
|---------|-------|
| AWS DynamoDB | All data storage — 8 tables, pay-per-request billing |
| AWS IAM | Access key authentication for DynamoDB |

---

## 🗄️ Database Schema

All tables follow the `ams-` prefix convention.

| Table | Partition Key | GSI(s) | Description |
|-------|--------------|--------|-------------|
| `ams-users` | `email` | — | Auth accounts & employee records |
| `ams-assets` | `asset_id` | `category-index` | IT asset inventory |
| `ams-asset-categories` | `category_id` | — | Asset type definitions |
| `ams-asset-assignments` | `assignment_id` | `asset-index`, `employee-index` | Asset ↔ employee allocation |
| `ams-maintenance-logs` | `log_id` | `asset-maintenance-index` | Service & repair records |
| `ams-repair-requests` | `request_id` | — | Hardware issue tracking |
| `ams-vendors` | `vendor_id` | — | Supplier directory |
| `ams-purchases` | `purchase_id` | `vendor-index` | Purchase orders |

---

## 📁 Project Structure

```
AssetManagement/
├── ams-api/                    # Express REST API
│   ├── config/
│   │   └── dynamodb.js         # DynamoDB client + TABLES constants
│   ├── middleware/
│   │   └── auth.js             # JWT verify middleware
│   ├── routes/
│   │   ├── auth.js             # Login / register
│   │   ├── dashboard.js        # Aggregated stats
│   │   ├── employee.js         # Employee CRUD
│   │   ├── assets.js           # Asset CRUD
│   │   ├── categories.js       # Category CRUD
│   │   ├── assignments.js      # Assign / return assets
│   │   ├── maintenance.js      # Maintenance logs
│   │   ├── repairRequests.js   # Repair request tracking
│   │   ├── vendors.js          # Vendor CRUD
│   │   ├── purchases.js        # Purchase order CRUD
│   │   └── profile.js          # Own profile management
│   ├── scripts/
│   │   ├── createTables.js     # Create all DynamoDB tables
│   │   ├── seedAdmin.js        # Create initial admin user
│   │   ├── seedData.js         # Seed employees, assets, assignments
│   │   ├── seedVendorPurchases.js  # Seed vendors and purchase orders
│   │   └── seedMaintenanceRepairs.js  # Seed maintenance logs and repair requests
│   ├── app.js                  # Express entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── ams-client/                 # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── assets/         # AssetForm, AssetModal, AssetDrawer
    │   │   ├── assignments/    # AssignForm, ReturnModal
    │   │   ├── maintenance/    # MaintenanceForm, MaintenanceModal
    │   │   ├── purchases/      # PurchaseModal
    │   │   ├── repair/         # RepairForm, RepairModal
    │   │   ├── vendors/        # VendorModal
    │   │   ├── DataTable/      # Reusable table with sort, pagination, search
    │   │   ├── ConfirmDialog.jsx  # Promise-based confirm dialog
    │   │   ├── Toast.jsx       # Toast notification system
    │   │   ├── Sidebar.jsx     # Collapsible navigation sidebar
    │   │   ├── Navbar.jsx      # Top bar with collapse toggle
    │   │   ├── KPI.jsx         # KPI card component
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── SidebarContext.jsx  # Sidebar collapse state
    │   ├── layouts/
    │   │   └── MainLayout.jsx  # Shared page layout wrapper
    │   ├── pages/              # One file per route
    │   ├── services/
    │   │   └── api.js          # Axios instance with JWT interceptor
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- AWS account with DynamoDB access
- AWS IAM user with `AmazonDynamoDBFullAccess` policy

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/asset-management-system.git
cd asset-management-system
```

### 2 — Configure the API

```bash
cd ams-api
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
AWS_REGION=ap-south-1
ACCESS_KEY=your_aws_access_key_id
SECRET_KEY=your_aws_secret_access_key
JWT_SECRET=your_long_random_jwt_secret
```

### 3 — Create DynamoDB tables

```bash
npm install
node scripts/createTables.js
```

### 4 — Seed initial data

```bash
# Create admin user (admin@company.com / Admin@123)
node scripts/seedAdmin.js

# Seed employees, assets, assignments, categories
node scripts/seedData.js

# Seed vendors and purchase orders
node scripts/seedVendorPurchases.js

# Seed maintenance logs and repair requests
node scripts/seedMaintenanceRepairs.js
```

### 5 — Start the API

```bash
npm run dev        # development (nodemon)
npm start          # production
```

API runs on `http://localhost:5000`

### 6 — Configure the client

```bash
cd ../ams-client
cp .env.example .env
```

`.env` defaults are fine for local development:

```env
VITE_API_URL=http://localhost:5000
```

### 7 — Start the client

```bash
npm install
npm run dev
```

Client runs on `http://localhost:5173`

---

## 🔐 Default Login

| Field | Value |
|-------|-------|
| Email | `admin@company.com` |
| Password | `Admin@123` |

Seeded employee password: `Pass@1234`

> ⚠️ Change all default credentials before deploying to production.

---

## 🔑 API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Sign in, returns JWT |
| POST | `/api/auth/register` | No | Register new user |
| GET | `/api/dashboard` | Yes | Aggregated stats for all modules |
| GET/POST/PUT/DELETE | `/api/assets` | Yes | Asset CRUD |
| GET/POST/PUT/DELETE | `/api/employees` | Yes | Employee CRUD |
| GET/POST/PUT/DELETE | `/api/categories` | Yes | Category CRUD |
| GET/POST | `/api/assignments` | Yes | Create assignments |
| PUT | `/api/assignments/:id/return` | Yes | Return an asset |
| GET/POST/PUT | `/api/maintenance` | Yes | Maintenance log CRUD |
| GET/POST/PUT/DELETE | `/api/repair-requests` | Yes | Repair request CRUD |
| GET/POST/PUT/DELETE | `/api/vendors` | Yes | Vendor CRUD |
| GET/POST/PUT/DELETE | `/api/purchases` | Yes | Purchase order CRUD |
| GET/PUT | `/api/profile` | Yes | Own profile |
| PUT | `/api/profile/password` | Yes | Change own password |
| DELETE | `/api/profile` | Yes | Deactivate own account |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#19405e` | Sidebar, buttons, headings |
| Primary Dark | `#1b4f72` | Hover states, focus rings |
| Accent | `#f5cba7` | Active nav, icons, highlights |
| Background | `#eef2f6` | Page background |
| Surface | `#ffffff` | Cards, panels |
| Heading font | Bricolage Grotesque | All `h1–h6` elements |
| Body font | Roboto Condensed | All body text |

---

## 📦 Key UI Components

- **DataTable** — sortable, paginated, searchable table with skeleton loader and empty state
- **Toast** — zero-dependency toast system (success, error, warn, info) with slide-in animation
- **ConfirmDialog** — promise-based confirm modal replacing native `window.confirm()`
- **Sidebar** — collapsible navigation with grouped sections, state persisted to `localStorage`
- **KPI** — compact stat card with icon, accent variant, and left border indicator

---

## 🔒 Security Notes

- JWT tokens expire after 1 day
- Passwords hashed with bcrypt (cost factor 10)
- API interceptor auto-attaches JWT and redirects to login on 401
- `.env` files excluded from version control via `.gitignore`
- AWS credentials should be stored in `.env` only — never committed

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
