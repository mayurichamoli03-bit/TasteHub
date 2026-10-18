# 🍲 TasteHub — Modern Online Food Ordering Website

A complete, beginner-friendly, fully working full-stack online food ordering web application built specifically for computer science engineering students.

Designed with a clean, modern aesthetic: **Dark Charcoal header and hero**, **warm off-white/cream background**, and vibrant **appetizing orange accents**.

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [Folder Structure](#3-folder-structure)
4. [Software Prerequisites](#4-software-prerequisites)
5. [MongoDB Atlas Setup Guide](#5-mongodb-atlas-setup-guide)
6. [Environment Variables Configuration](#6-environment-variables-configuration)
7. [Backend Installation and Startup](#7-backend-installation-and-startup)
8. [Database Seeding (Sample Dishes)](#8-database-seeding-sample-dishes)
9. [Running the Frontend Locally](#9-running-the-frontend-locally)
10. [Step-by-Step Feature Testing Guide](#10-step-by-step-feature-testing-guide)
11. [How to Upload to GitHub](#11-how-to-upload-to-github)
12. [Deploying the Express.js Backend (Render)](#12-deploying-the-expressjs-backend-render)
13. [Deploying the Frontend (Vercel)](#13-deploying-the-frontend-vercel)
14. [Connecting Deployed Frontend to Deployed Backend](#14-connecting-deployed-frontend-to-deployed-backend)
15. [Troubleshooting & Common Errors](#15-troubleshooting--common-errors)

---

## 1. Project Overview

**TasteHub** is an end-to-end food delivery web application that allows customers to:
- Browse culinary categories: *Indian, Pizza, Burgers, Chinese, South Indian, Desserts, Beverages, and Healthy Food*.
- Search dishes dynamically with instant real-time filtering.
- Add items to an interactive cart stored persistently in browser `localStorage`.
- Register new accounts and log in securely using password hashing and JSON Web Tokens (JWT).
- Place orders with genuine **Cash on Delivery (COD)** checkout.
- Calculate order prices and subtotals strictly on the backend to prevent client-side price tampering.
- View real-time order history with order IDs and preparation status (*Pending, Preparing, Out for Delivery, Delivered*).

---

## 2. Technologies Used

### Frontend (No heavy frameworks — pure standards):
- **HTML5:** Semantic markup structure.
- **CSS3:** Custom responsive layout, CSS variables, flexbox, CSS grid, smooth hover animations, dark charcoal/cream/orange theme.
- **Vanilla JavaScript (ES6+):** Dynamic DOM rendering, asynchronous `fetch()` API calls, cart persistence via `localStorage`.

### Backend:
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Fast, unopinionated REST API framework.
- **JavaScript:** Clean, beginner-friendly modular route architecture.

### Database:
- **MongoDB Atlas:** Cloud-hosted NoSQL document database.
- **Mongoose:** Object Data Modeling (ODM) library for MongoDB.

### Security & Authentication:
- **bcryptjs:** Salted password hashing (passwords are never saved in plain text).
- **jsonwebtoken (JWT):** Stateless token-based user authentication.
- **cors:** Cross-Origin Resource Sharing control.
- **dotenv:** Environment variable isolation.

---

## 3. Folder Structure

```text
TasteHub/
├── frontend/
│   ├── index.html          # Homepage with hero, categories, featured dishes
│   ├── menu.html           # Full menu with search & 8 category filters
│   ├── cart.html           # Cart page with qty adjustment & subtotal
│   ├── login.html          # Customer login page
│   ├── signup.html         # Customer registration page
│   ├── checkout.html       # Delivery details & Cash on Delivery order placement
│   ├── orders.html         # Customer order history with live status
│   ├── vercel.json         # Vercel static site configuration
│   ├── css/
│   │   └── style.css       # Complete unified responsive stylesheet
│   ├── js/
│   │   ├── config.js       # API URL base, constants, cart/auth helpers
│   │   ├── app.js          # Shared navbar, mobile toggle, featured dishes
│   │   ├── menu.js         # Menu loader, category tabs, live search
│   │   ├── cart.js         # Cart view, quantity +/-, removal, totals
│   │   ├── auth.js         # Signup & Login form submission, validation
│   │   ├── checkout.js     # Order placement & confirmation modal
│   │   └── orders.js       # Customer orders fetcher & timeline rendering
│   └── images/
│       └── logo.svg        # TasteHub brand logo
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema (name, email, passwordHash)
│   │   ├── Dish.js         # Dish schema (name, category, price, image)
│   │   └── Order.js        # Order schema (userId, items, COD status)
│   ├── routes/
│   │   ├── authRoutes.js   # POST /signup, POST /login, GET /me
│   │   ├── dishRoutes.js   # GET /dishes, GET /dishes/:id
│   │   └── orderRoutes.js  # POST /orders, GET /my-orders, GET /:id
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   ├── server.js           # Express app, DB connection, API routes
│   ├── seed.js             # Seeds 24 sample dishes across 8 categories
│   ├── package.json        # Dependencies and scripts
│   ├── .env.example        # Example environment variables
│   └── .gitignore          # Ignores node_modules and .env
├── README.md               # Complete documentation
└── .gitignore              # Root gitignore
```

---

## 4. Software Prerequisites

Make sure you have the following installed on your machine:
1. **Node.js (LTS version 18 or 20+):** [Download from nodejs.org](https://nodejs.org/)
   - Verify installation in Windows PowerShell:
     ```powershell
     node -v
     npm -v
     ```
2. **Visual Studio Code (VS Code):** [Download from code.visualstudio.com](https://code.visualstudio.com/)
3. **VS Code Extension (Recommended):**
   - **Live Server** (by Ritwick Dey) to run `frontend/index.html` with one click.
4. **Git:** [Download from git-scm.com](https://git-scm.com/)

---

## 5. MongoDB Atlas Setup Guide

TasteHub uses MongoDB Atlas in the cloud so you don't have to install MongoDB locally.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create Deployment** and select the **FREE Shared M0** cluster.
3. Under **Security Quickstart**:
   - Create a database user with a **Username** (e.g., `tastehub_admin`) and a **Password** (e.g., `SecurePassword123`). *Write these down!*
4. Under **Network Access (IP Access List)**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** -> Confirm.
5. In your cluster dashboard:
   - Click **Connect** -> Select **Drivers** (Node.js).
   - Copy the connection string. It looks like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Insert the database name `tastehub` before the `?`:
     ```text
     mongodb+srv://tastehub_admin:SecurePassword123@cluster0.xxxxx.mongodb.net/tastehub?retryWrites=true&w=majority
     ```

---

## 6. Environment Variables Configuration

1. In VS Code, navigate to the `backend/` folder.
2. Create a new file named `.env` (or copy `.env.example` to `.env`):
   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```
3. Open `backend/.env` and paste your actual settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://tastehub_admin:SecurePassword123@cluster0.xxxxx.mongodb.net/tastehub?retryWrites=true&w=majority
   JWT_SECRET=tastehub_super_secret_jwt_token_key_2024
   FRONTEND_URL=*
   ```

> ⚠️ **Important:** Never commit the `.env` file to GitHub. It is already added to `.gitignore`.

---

## 7. Backend Installation and Startup

Open Windows PowerShell or VS Code Integrated Terminal (`Ctrl + ~`):

```powershell
# 1. Navigate to the backend folder
cd TasteHub/backend

# 2. Install all dependencies
npm install

# 3. Start the backend server
npm start
```

If you want the server to auto-reload whenever you edit code, run:
```powershell
npm run dev
```

You should see:
```text
✅ Successfully connected to MongoDB Atlas
🚀 TasteHub Server running on http://localhost:5000
```

Verify in your browser by visiting: `http://localhost:5000`  
You will receive:
```json
{
  "success": true,
  "message": "TasteHub API Server is running happily!"
}
```

---

## 8. Database Seeding (Sample Dishes)

We have created an automated seed script that inserts 24 delicious sample dishes across all 8 required categories (Indian, Pizza, Burgers, Chinese, South Indian, Desserts, Beverages, and Healthy Food) with realistic rupee prices and photos.

In a terminal inside `backend/`:
```powershell
npm run seed
```

Output:
```text
Connecting to MongoDB Atlas...
Connected to MongoDB successfully.

Seed completed successfully!
- Sample dishes in script: 24
- Total dishes currently in MongoDB: 24
- Categories covered: Indian, Pizza, Burgers, Chinese, South Indian, Desserts, Beverages, Healthy Food
MongoDB connection closed.
```

> 💡 **Duplicate Prevention:** The seed script uses Mongoose `findOneAndUpdate` with `{ upsert: true }` based on dish names, so you can safely run `npm run seed` as many times as you like without creating duplicate items!

---

## 9. Running the Frontend Locally

You have two easy ways to open the frontend:

### Method A: Using VS Code "Live Server" (Recommended)
1. Open the `TasteHub` folder in VS Code (`File > Open Folder...`).
2. Right-click on `frontend/index.html`.
3. Click **"Open with Live Server"**.
4. Your browser will automatically open: `http://127.0.0.1:5500/frontend/index.html`.

### Method B: Using Node `npx serve` or `http-server`
In a new terminal window:
```powershell
cd TasteHub/frontend
npx serve .
```
Then visit `http://localhost:3000`.

---

## 10. Step-by-Step Feature Testing Guide

Follow this test checklist to demonstrate all features:

1. **Browse Homepage:**
   - Open `index.html`. Notice the dark charcoal hero section and header with the brand logo `🍲 TasteHub`.
   - Scroll through category pills, featured dishes, promo banner, and reviews.
2. **Live Search:**
   - In the hero search box, type `pizza` and hit Enter. You are redirected to `menu.html` showing filtered pizza options.
3. **Category Filtering:**
   - On `menu.html`, click on category tabs like **Indian**, **Burgers**, **South Indian**, or **Healthy Food**. The grid updates immediately.
4. **Add to Cart:**
   - Click **+ Add** on 2 or 3 dishes.
   - Notice the green `"✓ Added"` animation, the floating toast alert, and the cart badge count updating in the navigation bar.
5. **Adjust Cart Quantities:**
   - Go to `cart.html`.
   - Click `+` and `−` buttons to increase/decrease item quantities. Notice the subtotal and total calculate in real time.
   - Test free delivery threshold: If subtotal is ₹500 or more, delivery fee becomes **FREE**!
6. **Customer Registration:**
   - Click **Sign Up** in the header (`signup.html`).
   - Enter your name (e.g. `Rahul Sharma`), email (`rahul@example.com`), and a password (min 6 characters).
   - Click **Create Account**. Your account is created, hashed with bcrypt, and a JWT token is saved.
7. **Cash on Delivery Checkout:**
   - Click **Proceed to Checkout** (`checkout.html`).
   - Your name is auto-filled. Enter a 10-digit phone number (e.g. `9876543210`) and full delivery address.
   - Notice the payment method is clearly set to **Cash on Delivery (COD)**.
   - Click **Place Order (Cash on Delivery)**.
8. **Order Confirmation:**
   - The backend validates all items, calculates the official prices from MongoDB, creates the order in the database, and returns the order.
   - An attractive Order Confirmation Modal pops up displaying your official **Order ID** (`#6620...`).
9. **View Order History:**
   - Click **View My Orders** (`orders.html`).
   - See your newly placed order with its items, delivery address, phone, total amount, and live status badge (`● Pending`).
10. **Logout:**
    - Click **Logout** in the top navigation bar.
    - Notice protected state resets to showing "Login" and "Sign Up".

---

## 11. How to Upload to GitHub

1. Open PowerShell in the root `TasteHub/` folder:
   ```powershell
   cd TasteHub
   git init
   git add .
   git commit -m "Initial commit: TasteHub food ordering platform"
   ```
2. Go to [github.com](https://github.com) and click **New Repository**.
3. Name it `tastehub-food-ordering` and keep it **Public**.
4. Link and push your repository:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/tastehub-food-ordering.git
   git push -u origin main
   ```

---

## 12. Deploying the Express.js Backend (Render)

Because standard Express.js servers require a continuous Node.js runtime with port listening, **Render** is the best free hosting platform for the backend:

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your `tastehub-food-ordering` repository.
4. Fill in the deployment settings:
   - **Name:** `tastehub-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Scroll down to **Environment Variables** and add:
   - `MONGO_URI`: *(Your MongoDB Atlas connection string)*
   - `JWT_SECRET`: *(A strong secret key, e.g. `tastehub_prod_secret_token_999`)*
   - `FRONTEND_URL`: `*`
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide your public backend URL (e.g. `https://tastehub-backend.onrender.com`).

---

## 13. Deploying the Frontend (Vercel)

Vercel is the premier platform for hosting static HTML, CSS, and JavaScript websites:

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New... > Project**.
3. Import your `tastehub-food-ordering` GitHub repository.
4. In the project configure screen:
   - **Root Directory:** Click "Edit" and choose `frontend`.
   - **Framework Preset:** Select **Other**.
   - Build and output settings can remain default.
5. Click **Deploy**.
6. In a few seconds, your frontend will be live on a URL like `https://tastehub-food-ordering.vercel.app`!

---

## 14. Connecting Deployed Frontend to Deployed Backend

Once your backend is deployed on Render and your frontend is on Vercel:

1. Open `frontend/js/config.js` in VS Code.
2. Find the `API_BASE_URL` property:
   ```javascript
   const CONFIG = {
     API_BASE_URL: (() => {
       if (
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.protocol === 'file:'
       ) {
         return 'http://localhost:5000/api';
       }
       // Replace this URL with your actual deployed Render backend URL:
       return 'https://tastehub-backend.onrender.com/api';
     })(),
     ...
   };
   ```
3. Commit and push the updated `frontend/js/config.js` to GitHub:
   ```powershell
   git add frontend/js/config.js
   git commit -m "Update production API URL"
   git push origin main
   ```
4. Vercel will automatically re-deploy your frontend. Now your online website communicates directly with your cloud database!

---

## 15. Troubleshooting & Common Errors

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| **"Cannot connect to MongoDB"** | IP address not whitelisted in Atlas or invalid password | In MongoDB Atlas, go to **Network Access** and verify `0.0.0.0/0` (allow all) is active. Ensure `<password>` in `backend/.env` has no special characters causing URL encoding issues. |
| **"CORS error in browser console"** | Backend blocking frontend origin | In `backend/.env`, set `FRONTEND_URL=*` and restart the backend. |
| **"Cart is empty after refresh"** | Browser cookies/storage disabled | Ensure browser localStorage is enabled and not running in extreme incognito mode that blocks storage. |
| **"jwt malformed / unauthorized"** | Token expired or secret mismatch | Log out via the header button and log back in to generate a fresh JWT token. |
| **"Port 5000 already in use"** | Another process is using port 5000 | Change `PORT=5001` in `backend/.env` and adjust the local URL in `frontend/js/config.js`. |

---

## 👨‍🎓 Project Credits & Presentation Tips for College

- **Backend Architecture:** Clean RESTful separation with Model-Route-Middleware pattern.
- **Price Security:** The backend recalculates order subtotal by looking up dishes in MongoDB; clients cannot manipulate prices.
- **Demo Script:**
  1. Show MongoDB Atlas cluster empty or with sample dishes.
  2. Register a new user live and show the bcrypt password hash in Atlas.
  3. Add items, show localStorage in Developer Tools (Application tab).
  4. Place Cash on Delivery order and view the order document created in MongoDB Atlas.

Good luck with your project demonstration! 🚀
