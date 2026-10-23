# Intelligent Multi-Vendor Inventory and E-Commerce Management System

A production-grade, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** platform engineered with an **automated intelligent inventory monitoring engine**.

The system dynamically monitors stock depletion, prevents stockouts and warehouse overfill, computes mathematical reorder suggestions in real time, and provides dedicated dashboards for **Customers**, **Vendors**, and **Platform Administrators**.

---

## Table of Contents
1. [Project Description](#project-description)
2. [Key Features by Role](#key-features-by-role)
3. [Intelligent Inventory Logic Specification](#intelligent-inventory-logic-specification)
4. [Technology Stack](#technology-stack)
5. [System Architecture](#system-architecture)
6. [Project Folder Structure](#project-folder-structure)
7. [Environment Variables Setup](#environment-variables-setup)
8. [Installation and Setup](#installation-and-setup)
9. [Demo Login Credentials](#demo-login-credentials)
10. [REST API Documentation](#rest-api-documentation)
11. [Exact Inventory Test Scenario Verification](#exact-inventory-test-scenario-verification)
12. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Project Description

Traditional e-commerce platforms decouple sales transactions from proactive inventory replenishment, leading to missed sales due to unmonitored stockouts or locked working capital from overstocking.

**IntelliStock** solves this by embedding an **autonomous telemetry layer** into the order lifecycle:
- Every completed customer purchase immediately re-evaluates the stock health of each purchased SKU.
- When stock breaches the vendor-defined safety threshold (`minimumStock`), the engine flags the item as **Low Stock**, records a high/medium priority entry in the database `InventoryAlert` collection, and alerts the vendor.
- When stock reaches `0`, the status transitions to **Out of Stock**, and purchasing is disabled.
- The engine calculates exact **suggested reorder quantities** using capacity ceiling equations, allowing vendors to restock with a single click.

---

## Key Features by Role

### 🛒 1. Customer Marketplace
- **Marketplace Browsing:** Real-time multi-vendor product catalog loaded via REST APIs.
- **Search & Filter:** Keyword search, category filtering, price range filter, and "In-Stock Only" toggle.
- **Sorting:** By Newest, Price (Low to High / High to Low), and Customer Rating.
- **Product Details:** Live stock indicators, verified vendor attribution, product specifications, customer reviews.
- **Verified Reviews & Ratings:** Authenticated customers can submit 1–5 star reviews and feedback.
- **Persistent Cart:** Item quantity adjustments, auto-calculated tax (8%) and shipping (Free over $100).
- **Checkout & Order Tracking:** Multi-step order confirmation, shipping address capture, payment simulation, and order status tracking timeline.

### 🏪 2. Vendor Management & Intelligence Hub
- **Vendor Analytics Dashboard:** Real-time telemetry powered by Recharts (gross revenue, total orders, units sold, inventory valuation).
- **Catalog Management (CRUD):** Add, update, and delete products with image URLs, categories, and prices.
- **Safety Threshold Calibration:** Vendors set custom `minimumStock` and `maximumStock` per product.
- **Stock Replenishment:** 1-click quick-restock actions based on calculated reorder recommendations.
- **Vendor Order Tracking:** View customer orders containing vendor products, and update fulfillment states (`Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`).
- **Dedicated Inventory Hub:** Filter by Low Stock, Out of Stock, Overstock, and view all active system alerts.

### 👑 3. System Administrator Portal
- **Master Platform Overview:** Real-time macro-metrics across all registered merchants and customers.
- **User Management:** View all accounts, filter by role (`customer`, `vendor`, `admin`), and activate/deactivate accounts.
- **Catalog Oversight:** Global moderation of all vendor product listings.
- **Global Order Operations:** Platform-wide transaction ledger and order status oversight.
- **Category Control:** Add, edit, and delete product categories.

---

## Intelligent Inventory Logic Specification

The inventory intelligence module (`server/utils/inventoryLogic.js`) runs evaluation triggers whenever stock changes:

### A. Low Stock Detection
$$\text{Condition: } 0 < \text{currentStock} \le \text{minimumStock}$$
- **Status:** `Low Stock`
- **Action:** Generates `LOW_STOCK` alert in `InventoryAlert` and triggers a high/priority vendor notification.

### B. Out of Stock Detection
$$\text{Condition: } \text{currentStock} = 0$$
- **Status:** `Out of Stock`
- **Action:** Generates `OUT_OF_STOCK` alert, locks checkout for this item, and dispatches critical notification.

### C. Overstock Detection
$$\text{Condition: } \text{currentStock} > \text{maximumStock}$$
- **Status:** `Overstock`
- **Action:** Generates `OVERSTOCK` informational alert warning the vendor of surplus inventory.

### D. Suggested Reorder Calculation
$$\text{Suggested Reorder Quantity} = \max\left(0, \, \text{maximumStock} - \text{currentStock}\right)$$

### E. Status Matrix Table
| Current Stock State | Inventory Status | Alert Generated | Severity | Suggested Reorder |
| :--- | :--- | :--- | :--- | :--- |
| $\text{Stock} = 0$ | **Out of Stock** | `OUT_OF_STOCK` | `HIGH` | $\text{Max Stock}$ |
| $0 < \text{Stock} \le \text{Min Stock}$ | **Low Stock** | `LOW_STOCK` | `MEDIUM` / `HIGH` | $\text{Max Stock} - \text{Stock}$ |
| $\text{Min Stock} < \text{Stock} \le \text{Max Stock}$ | **Healthy** | None | None | 0 |
| $\text{Stock} > \text{Max Stock}$ | **Overstock** | `OVERSTOCK` | `LOW` | 0 |

---

## Technology Stack

### Frontend (`client/`)
- **React 18** with **Vite**
- **React Router DOM v6** (Nested routes, Protected routes, Role guards)
- **Axios** (Centralized API client with JWT Bearer request interceptors)
- **Recharts** (Interactive BarCharts, PieCharts, and Distribution metrics)
- **Lucide React** (Modern iconography)
- **Custom Modern CSS Design System** (Variables, cards, modal dialogs, badges, utility layout)

### Backend (`server/`)
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose ODM**
- **JWT (jsonwebtoken)** for stateless role-based authentication
- **bcryptjs** for 10-round salted password hashing
- **MongoMemoryServer** (Automatic zero-friction local fallback when external MongoDB is not active)
- **CORS** & **Dotenv** configuration

---

## System Architecture

```
React Frontend (Vite @ http://localhost:5173)
       │
       │ HTTP / REST API (Axios + JWT Bearer Token)
       ▼
Express.js Backend (@ http://localhost:5000/api)
       │
       ├── authMiddleware (JWT decoding & user validation)
       ├── roleMiddleware (RBAC: Customer / Vendor / Admin)
       ├── Controllers (Auth, Product, Cart, Order, Inventory, Admin)
       ├── inventoryLogic Engine (Evaluation & Alert generation)
       │
       ▼
Mongoose ODM
       │
       ▼
MongoDB Database (Atlas or Local / MongoMemoryServer fallback)
```

---

## Project Folder Structure

```
intelligent-inventory-system/
│
├── client/                               # React + Vite Frontend
│   ├── src/
│   │   ├── components/                   # Navbar, Footer, ProductCard, Loader, ProtectedRoute, NotificationBell
│   │   ├── context/                      # AuthContext.jsx, CartContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx                  # Hero, category carousel, 1-click role switcher
│   │   │   ├── Login.jsx                 # User login with instant demo sign-in buttons
│   │   │   ├── Register.jsx              # Customer / Vendor registration
│   │   │   ├── Products.jsx              # Marketplace search, category & price filters
│   │   │   ├── ProductDetails.jsx        # Image, stock specs, reviews list & submission
│   │   │   ├── Cart.jsx                  # Item quantity spinner, stock validation, checkout prompt
│   │   │   ├── Checkout.jsx              # Shipping address form, payment options, receipt
│   │   │   ├── Orders.jsx                # Customer order history & tracking
│   │   │   ├── Profile.jsx               # User profile info and address updater
│   │   │   ├── VendorDashboard.jsx       # 8 KPI metric cards + Recharts graphs + alert feed
│   │   │   ├── VendorProducts.jsx        # Product CRUD table, stock thresholds, restock modal
│   │   │   ├── VendorOrders.jsx          # Vendor customer orders & fulfillment updater
│   │   │   ├── InventoryDashboard.jsx    # Dedicated Intelligent Inventory Center (Tabs & 1-click restock)
│   │   │   ├── AdminDashboard.jsx        # Platform macro metrics & user distribution chart
│   │   │   ├── ManageUsers.jsx           # User directory & activation toggles
│   │   │   ├── ManageProducts.jsx        # Platform catalog oversight
│   │   │   └── ManageOrders.jsx          # Master order operations
│   │   ├── services/                     # api.js (Axios instance)
│   │   ├── utils/                        # helpers.js (Currency, dates, badges)
│   │   ├── App.jsx                       # Master routes and layout
│   │   ├── main.jsx                      # DOM mount point
│   │   └── index.css                     # Modern CSS design system
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── server/                               # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                         # Mongoose connection with embedded auto-fallback
│   ├── controllers/                      # authController, productController, cartController, etc.
│   ├── middleware/                       # authMiddleware, roleMiddleware, errorMiddleware
│   ├── models/                           # User, Product, Category, Cart, Order, Review, Notification, InventoryAlert
│   ├── routes/                           # authRoutes, productRoutes, cartRoutes, inventoryRoutes, etc.
│   ├── seed/
│   │   └── seedData.js                   # Seed script populating users, categories, products, orders
│   ├── tests/
│   │   └── verifyScenario.js             # Automated assertion script for required inventory test
│   ├── utils/
│   │   ├── inventoryLogic.js             # Core stock classification & reorder formula engine
│   │   └── generateToken.js              # JWT generator helper
│   ├── server.js                         # Express entry point
│   ├── package.json
│   └── .env
│
├── package.json                          # Root package.json for multi-workspace commands
└── README.md                             # Comprehensive project documentation
```

---

## Environment Variables Setup

### Backend: `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/intelligent_inventory_db
JWT_SECRET=super_secret_jwt_key_intelligent_inventory_2026_xyz
CLIENT_URL=http://localhost:5173
USE_MEMORY_DB=auto
```
*(Note: If your local MongoDB daemon is not running, `USE_MEMORY_DB=auto` automatically runs an embedded MongoDB instance seamlessly.)*

### Frontend: `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation and Setup

### 1. Backend Setup
Open a terminal in VS Code:
```bash
cd server
npm install
npm run seed
npm run dev
```
The server will output:
```
==================================================
🚀 Server running on port 5000
📡 Base API URL: http://localhost:5000/api
==================================================
```

### 2. Frontend Setup
In a second terminal:
```bash
cd client
npm install
npm run dev
```
The client will launch at `http://localhost:5173`.

---

## Demo Login Credentials

You can use the **1-Click Quick Demo Sign-In buttons** on the Login page and Home page, or enter these credentials manually:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@ecommerce.com` | `admin123` | Platform Control Center, Manage Users, Moderate Products, All Orders |
| **🏪 Vendor** | `vendor@ecommerce.com` | `vendor123` | Inventory Hub, KPI Analytics, Add/Edit Products, Restock, Vendor Orders |
| **🛒 Customer** | `customer@ecommerce.com` | `customer123` | Marketplace, Cart, Checkout, Order Tracking, Submit Reviews |

---

## REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new Customer or Vendor
- `POST /api/auth/login` — Sign in and obtain JWT Bearer token
- `GET /api/auth/me` — Retrieve active authenticated user profile
- `PUT /api/auth/profile` — Update account profile and address

### Products (`/api/products`)
- `GET /api/products` — Marketplace search, filters (`category`, `minPrice`, `maxPrice`, `inStock`, `sort`)
- `GET /api/products/:id` — Product details, vendor information, and customer reviews
- `POST /api/products` — *(Vendor/Admin)* Create product with min/max stock thresholds
- `PUT /api/products/:id` — *(Vendor/Admin)* Update product specifications
- `PUT /api/products/:id/stock` — *(Vendor/Admin)* Quick replenish / restock units
- `DELETE /api/products/:id` — *(Vendor/Admin)* Delete product
- `GET /api/products/vendor/me` — *(Vendor)* Fetch products belonging to logged-in vendor

### Customer Cart (`/api/cart`)
- `GET /api/cart` — Retrieve customer's active shopping cart and calculations
- `POST /api/cart/add` — Add product to cart with server-side stock validation
- `PUT /api/cart/update` — Update item quantity with stock boundary check
- `DELETE /api/cart/remove/:productId` — Remove specific SKU
- `DELETE /api/cart/clear` — Empty shopping cart

### Orders (`/api/orders`)
- `POST /api/orders` — Customer places order (checks stock, decrements inventory, triggers intelligent alerts, empties cart)
- `GET /api/orders/my-orders` — Customer order history
- `GET /api/orders/:id` — Order details
- `GET /api/orders/vendor/me` — Vendor orders containing vendor items
- `PUT /api/orders/:id/status` — *(Vendor/Admin)* Update fulfillment status
- `GET /api/orders` — *(Admin)* View all platform orders

### Intelligent Inventory (`/api/inventory`)
- `GET /api/inventory/dashboard` — Vendor 8-KPI summary, Recharts datasets, and recent alerts
- `GET /api/inventory/alerts` — List inventory alerts with severity and read status
- `PUT /api/inventory/alerts/:id/read` — Mark single alert as read
- `PUT /api/inventory/alerts/read-all` — Mark all alerts as read
- `GET /api/inventory/low-stock` — Products at or below minimum threshold
- `GET /api/inventory/out-of-stock` — Products with 0 remaining units
- `GET /api/inventory/overstock` — Products exceeding maximum capacity
- `GET /api/inventory/reorder-suggestions` — Mathematical reorder quantities and estimated costs

### Reviews & Ratings (`/api/reviews`)
- `GET /api/reviews/product/:productId` — Fetch reviews for a product
- `POST /api/reviews` — *(Customer)* Submit rating (1–5) and review comment

### Platform Administration (`/api/admin`)
- `GET /api/admin/dashboard` — Platform revenue, macro stats, and user distribution
- `GET /api/admin/users` — List platform users with role filtering
- `PUT /api/admin/users/:id/status` — Toggle user activation status
- `GET /api/admin/categories` — Category list
- `POST /api/admin/categories` — Add new product category

---

## Exact Inventory Test Scenario Verification

The system includes an automated test script that validates the exact test scenario specified:

### Test Case Parameters:
- **Product:** `Wireless Mouse`
- **Initial Stock:** `10`
- **Minimum Stock:** `5`
- **Maximum Stock:** `30`
- **Customer Purchase Quantity:** `6`

### Expected Mathematical Results:
1. **Updated Stock:** $10 - 6 = \mathbf{4}$
2. **Inventory Status:** `Low Stock` (because $4 \le 5$)
3. **Inventory Alert:** Created in `InventoryAlert` collection with severity `MEDIUM`
4. **Suggested Reorder:** $30 - 4 = \mathbf{26}$ units

### How to Run the Test:
In the `server/` directory, execute:
```bash
npm run test:scenario
```

### Verified Terminal Output:
```
🧪 STARTING VERIFICATION: EXACT INVENTORY TEST SCENARIO
✅ STEP 1 PASSED: Initial state matches test specification (Stock: 10, Min: 5, Max: 30).
✅ STEP 2 & 3 PASSED: Stock reduced to 4, status is Low Stock, suggested reorder is 26.
✅ STEP 4 PASSED: InventoryAlert and Notification properly generated in MongoDB.
🎉 ALL INVENTORY TEST SCENARIO ASSERTIONS PASSED 100%!
```

---

## Troubleshooting & FAQ

1. **MongoDB Connection: ECONNREFUSED**
   - *Behavior:* If MongoDB is not installed locally on port 27017, the server's `config/db.js` automatically starts an embedded `MongoMemoryServer`.
   - *Connecting to MongoDB Atlas:* Update `MONGO_URI` in `server/.env` with your connection string (`mongodb+srv://<user>:<password>@cluster.mongodb.net/inventory_db`).

2. **CORS Errors**
   - The backend includes `cors({ origin: '*' })` middleware and Vite proxies `/api` requests to `http://localhost:5000`.

3. **Port In Use (5000 or 5173)**
   - Change `PORT=5001` in `server/.env` and update `VITE_API_URL=http://localhost:5001/api` in `client/.env`.
