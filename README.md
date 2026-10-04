# Quotation-to-Order System
A full-stack business web app that takes a customer quotation all the way through approval, sending, acceptance, and conversion into an order.

## Overview
A **Salesperson** creates a price quotation for a customer by adding one or more products. Depending on the discount given, the quotation may need **Manager** approval before it can be sent to the customer. Once the customer accepts, the quotation can be converted into an **Order** — but only once.

There is no real authentication; a **role dropdown** (Salesperson / Manager) simulates access control, while every business rule is enforced on the backend, not just hidden in the UI.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MySQL |
| Communication | REST API (JSON over HTTP), CORS-enabled |

```
React (5173)  →  Express (5000)  →  MySQL (3306)
```

## Features
- Role-based UI (Salesperson / Manager) via a simple dropdown — no login
- Create, submit, approve/reject, send, accept, and convert quotations
- Automatic discount-based approval routing
- Dashboard with live quotation counts by status and total order value
- Customer and Product management screens

## Business Rules
1. **Discount rule** — A discount above 10% requires Manager approval before the quotation can proceed. A discount of 10% or less skips approval and goes straight to **Approved**.
2. **Conversion rule** — Only a quotation in **Accepted** status can be converted into an Order.
3. **One order per quotation** — A quotation can generate only one Order. This is enforced both in application logic and with a `UNIQUE` database constraint on `orders.quotation_id`.

## Status Flow
```
Draft → Pending Approval → Approved → Sent → Accepted → Converted to Order
             │                                   │
             └──────────────► Rejected ◄─────────┘
```
- **Draft → Pending Approval / Approved**: decided by the discount rule on Submit
- **Pending Approval → Approved / Rejected**: Manager-only action
- **Sent → Accepted / Rejected**: represents the customer's response
- **Accepted → Converted to Order**: creates the Order record

## Database Schema
| Table | Purpose |
|---|---|
| `customers` | Customer master data |
| `products` | Product catalog with prices |
| `quotations` | One row per quotation — customer, discount, totals, status |
| `quotation_items` | One row per product line on a quotation (many-to-one with `quotations`) |
| `orders` | Created from an Accepted quotation; linked 1:1 via `quotation_id` |

```
customers ──< quotations ──< quotation_items >── products
                  │
                  └── 1:1 ── orders
```

Product name and price are copied into `quotation_items` at the time of quoting, so historical quotations remain accurate even if product prices change later.

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Add a customer |
| GET | `/api/products` | List products |
| POST | `/api/products` | Add a product |
| GET | `/api/quotations` | List quotations |
| GET | `/api/quotations/:id` | Get one quotation with its items |
| POST | `/api/quotations` | Create a quotation (Draft) |
| POST | `/api/quotations/:id/submit` | Submit a Draft (applies the discount rule) |
| POST | `/api/quotations/:id/approve` | Manager approves a Pending Approval quotation |
| POST | `/api/quotations/:id/reject` | Reject a Pending Approval or Sent quotation |
| POST | `/api/quotations/:id/send` | Mark an Approved quotation as Sent |
| POST | `/api/quotations/:id/accept` | Mark a Sent quotation as Accepted |
| POST | `/api/quotations/:id/convert` | Convert an Accepted quotation into an Order |
| GET | `/api/orders` | List all orders |
| GET | `/api/dashboard` | Quotation counts by status + total order value |

## Project Structure
```
quotation-app/
├── backend/
│   ├── routes/
│   │   ├── customers.js
│   │   ├── products.js
│   │   ├── quotations.js
│   │   ├── orders.js
│   │   └── dashboard.js
│   ├── db.js
│   ├── server.js
│   ├── schema.sql
│   └── seed.sql
└── frontend/
    └── src/
        ├── components/
        │   ├── Dashboard.jsx
        │   ├── Quotations.jsx
        │   ├── NewQuotation.jsx
        │   ├── Orders.jsx
        │   ├── Customers.jsx
        │   └── Products.jsx
        ├── api.js
        └── App.jsx
```
## Getting Started

### Prerequisites
- Node.js (LTS)
- MySQL Server + MySQL Workbench (or CLI)

### 1. Set up the database
```bash
mysql -u root -p < backend/schema.sql
mysql -u root -p < backend/seed.sql   # optional sample data
```

### 2. Run the backend
```bash
cd backend
npm install
npm run dev
```

Update the MySQL password in `backend/db.js` before running.
Server runs at `http://localhost:5000`.

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## Design Notes
- **The backend, not the frontend, calculates all prices and totals.** The client sends only `product_id` and `quantity`; the server looks up real prices to prevent tampering.
- **Every status-changing endpoint checks the quotation's current status first**, so invalid transitions (e.g. sending a Draft directly) are rejected server-side even if the UI is bypassed.
- **Role checks happen on the server**, not just by hiding buttons in the UI.
- `quotation_items` exists because a quotation can hold multiple products, and a relational row can't store a list — a standard one-to-many pattern.

## Possible Improvements

- Real authentication instead of a role dropdown
- Database transactions when saving a quotation with multiple items
- Editing/deleting quotations while still in Draft
- Pagination for large quotation/order lists
