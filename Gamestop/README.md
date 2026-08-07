# GameStop — Full-Stack E-Commerce Application

A GameStop-style e-commerce web application with a **Spring Boot** REST API backend, a **MySQL** database, and a **React + Vite + Tailwind CSS** frontend. It supports user authentication (JWT), product and category browsing, a shopping cart, **Razorpay online payments**, order history, and user profiles.

---

## Features

- 🔐 **User authentication** with JWT (register, login, forgot password)
- 🛍️ **Product & category browsing** with filtering and product detail pages
- 🛒 **Shopping cart** with add / update / remove
- 💳 **Razorpay checkout** — create payment orders and verify payment signatures
- 📦 **Order history** — view past orders and their status (PENDING / SUCCESS / FAILED)
- 👤 **User profile** with an account dropdown (Profile / Orders / Logout)

---

## Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | React 19, Vite 8, React Router 7, Tailwind CSS 4, React Icons     |
| Backend    | Spring Boot 3.5.5, Java 21, Spring Security, Spring Data JPA      |
| Auth       | JWT (jjwt 0.12.7)                                                  |
| Payments   | Razorpay (razorpay-java 1.4.8)                                    |
| Database   | MySQL                                                             |
| Build      | Maven (backend), npm (frontend)                                   |

---

## Prerequisites

Make sure the following are installed:

- **Java JDK 21**
- **Maven** (or use the bundled `mvnw` wrapper)
- **Node.js 18+** and **npm**
- **MySQL Server** (running locally on port `3306`)

---

## Project Structure

```
Gamestop/
├── backend/          # Spring Boot REST API (Java 21, Maven)
│   └── src/main/resources/application.properties
├── frontend/         # React + Vite + Tailwind client
│   └── src/services/api.js
└── package.json
```

> The SQL table scripts live one level up in `../sqle_commercedatabase/`.

---

## 1. Database Setup

1. Start your MySQL server.
2. Create the database (the backend expects a schema named `e_commerce`):

   ```sql
   CREATE DATABASE e_commerce;
   ```

3. (Optional) Import the provided table scripts from the `sqle_commercedatabase/` folder:

   ```bash
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_users.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_categories.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_products.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_productimages.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_cart_items.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_orders.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_order_items.sql
   mysql -u root -p e_commerce < ../sqle_commercedatabase/e_commerce_jwt_tokens.sql
   ```

   > Hibernate is set to `ddl-auto=update`, so tables will also be created/updated automatically on first run.

4. Update the database credentials in
   `backend/src/main/resources/application.properties` to match your local MySQL:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/e_commerce
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

5. Add your **Razorpay test keys** in the same `application.properties` file
   (get them from the [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys):

   ```properties
   razorpay.key.id=YOUR_RAZORPAY_KEY_ID
   razorpay.key.secret=YOUR_RAZORPAY_KEY_SECRET
   ```

---

## 2. Run the Backend (Spring Boot)

From the `Gamestop/backend/` folder:

```bash
cd backend

# Windows
./mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The API starts on **http://localhost:8080**.

---

## 3. Run the Frontend (React + Vite)

Open a **second terminal** in the `Gamestop/frontend/` folder:

```bash
cd frontend
npm install
npm run dev
```

The app starts on **http://localhost:5173** (Vite default).

> The frontend talks to the backend via the base URL defined in
> `frontend/src/services/api.js` → `http://localhost:8080/api`.

> **Note:** Run `npm run dev` from inside the `Gamestop/frontend/` directory, not from the repository root — otherwise npm will fail because there is no dev server there.

---

## Available Frontend Scripts

Run these inside `frontend/`:

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Build the production bundle          |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

---

## API Overview

Base URL: `http://localhost:8080/api`

| Base Path         | Purpose                          |
| ----------------- | -------------------------------- |
| `/api/auth`       | Login / authentication (JWT)     |
| `/api/users`      | User management                  |
| `/api/products`   | Product catalog                  |
| `/api/categories` | Product categories               |
| `/api/cart`       | Shopping cart operations         |
| `/api/orders`     | Orders & Razorpay payments       |

### Payment & Order Endpoints

| Method | Endpoint                             | Purpose                                             |
| ------ | ------------------------------------ | --------------------------------------------------- |
| `POST` | `/api/orders/{userId}/create-payment`| Create an internal order + Razorpay order           |
| `POST` | `/api/orders/verify-payment`         | Verify the Razorpay signature and finalize the order |
| `GET`  | `/api/orders/{userId}`               | List a user's orders                                |

---

## Quick Start (TL;DR)

```bash
# 1. Create the MySQL database `e_commerce` and set your password in application.properties

# 2. Backend
cd backend
./mvnw.cmd spring-boot:run      # Windows (use ./mvnw on macOS/Linux)

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.
