# RentEase Deployment Guide

This guide explains how to deploy the **RentEase - Furniture & Appliance Rental Platform** for free using two options:
*   **Option 1:** Frontend on Netlify + Backend on Vercel (Recommended)
*   **Option 2:** Both Frontend and Backend on Vercel (100% Free)

---

## 🛠️ Prerequisites

Before you begin, ensure you have accounts with:
1.  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
2.  [Vercel](https://vercel.com/) (Free tier available)
3.  [Netlify](https://www.netlify.com/) (Free tier available, only needed for Option 1)
4.  [GitHub](https://github.com/) (to store your code and connect to Netlify/Vercel)

---

## 💾 Step 1: Set Up MongoDB Atlas (Production Database)

Since Vercel's serverless environment is stateless and read-only, the local `db.json` file database will not persist data. A cloud database is required.

1.  Log in to **MongoDB Atlas** and create a new free cluster (Shared tier).
2.  In **Security > Database Access**, create a database user with read/write privileges (e.g., username: `rentease-admin`). Keep the password safe.
3.  In **Security > Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel's serverless functions can connect.
4.  Go to **Database > Cluster > Connect**, click **Drivers**, and copy the connection string. It should look like:
    ```text
    mongodb+srv://rentease-admin:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    ```
5.  Replace `<password>` with your database user's password and change the database name (before the `?`) to `rentease`. Keep this URI ready.

---

## ⚡ Step 2: Deploy the Backend to Vercel (Free)

The Express backend is preconfigured for Vercel using the [backend/vercel.json](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/backend/vercel.json) file.

1.  Push your code repository to **GitHub**.
2.  Log in to **Vercel** and click **Add New > Project**.
3.  Import your RentEase repository.
4.  In the project configuration:
    *   **Project Name:** `rentease-backend`
    *   **Framework Preset:** Select **Other** (since it's a sub-directory Express app).
    *   **Root Directory:** Edit and select **`backend`**.
5.  Expand the **Environment Variables** section and add:
    *   `MONGODB_URI`: *Your MongoDB Atlas connection string from Step 1.*
    *   `JWT_SECRET`: *A secure random string (e.g., `5f8d9b23...`).*
    *   `NODE_ENV`: `production`
6.  Click **Deploy**. Once completed, Vercel will provide you with a deployment URL (e.g., `https://rentease-backend.vercel.app`).
7.  Verify the backend is live by visiting `https://your-backend.vercel.app/api/health` in your browser. You should receive a status response: `{"status":"healthy","message":"RentEase Full-Stack Backend..."}`.

---

## 🌱 Step 3: Seed the Production Database

To populate your live MongoDB Atlas catalog with default furniture & appliances:

1.  Open your local [backend/.env](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/backend/.env) (create it if it doesn't exist).
2.  Temporarily paste your MongoDB Atlas connection string:
    ```env
    MONGODB_URI=mongodb+srv://rentease-admin:<password>@cluster0.xxxxxx.mongodb.net/rentease?retryWrites=true&w=majority
    ```
3.  In your terminal, navigate to the `backend` folder and run the seed script:
    ```bash
    cd backend
    node scripts/seed.js
    ```
4.  Once you see `🎉 Database seeding finished successfully!`, your cloud database is fully initialized with mock users and product listings.
5.  *Security Tip:* Remove the production `MONGODB_URI` from your local `.env` file to prevent accidental overwrites.

---

## 🌐 Step 4: Deploy the Frontend (Select Option A or B)

Both hosting options are completely **100% Free** on their Hobby/Starter plans.

### Option A: Deploy Frontend on Netlify (Recommended)
This uses the preconfigured [netlify.toml](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/netlify.toml) file in the root.

1.  Log in to **Netlify** and click **Add new site > Import an existing project**.
2.  Select your git provider (GitHub) and authorize.
3.  Choose your RentEase repository.
4.  Netlify will automatically read the [netlify.toml](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/netlify.toml) file. Double-check that these fields match:
    *   **Base directory:** `frontend`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `.next`
5.  Expand **Advanced build settings > Environment variables** and add:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend.vercel.app/api`
        *(Replace `your-backend.vercel.app` with your actual Vercel backend URL, and ensure it ends with `/api`)*
6.  Click **Deploy site**.

---

### Option B: Deploy Frontend on Vercel (Alternative - 100% Free)
Since Next.js is developed by Vercel, it runs exceptionally well here on their free Hobby plan.

1.  Log in to your **Vercel** dashboard and click **Add New > Project**.
2.  Import your RentEase repository again (this creates a second project separate from your backend).
3.  In the project configuration:
    *   **Project Name:** `rentease-frontend`
    *   **Framework Preset:** Select **Next.js**.
    *   **Root Directory:** Edit and select **`frontend`**.
4.  Expand the **Environment Variables** section and add:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend.vercel.app/api`
        *(Replace `your-backend.vercel.app` with your Vercel backend URL, and ensure it ends with `/api`)*
5.  Click **Deploy**.
6.  Once completed, Vercel will provide you with your public website URL (e.g., `https://rentease-frontend.vercel.app`).

---

## 🔍 Step 5: Verification & Testing

1.  Open your deployed Netlify or Vercel frontend URL.
2.  Try signing in using one of the preloaded credentials:
    *   **Customer Role:** `user@rentease.com` (password: `user123`)
    *   **Admin Role:** `admin@rentease.com` (password: `admin123`)
3.  Navigate through the catalog, view products, and test a rental checkout.
4.  Open the browser developer tools (F12) and inspect the **Network** tab to confirm all requests (e.g., `/products`, `/auth/login`) are pointing to your Vercel backend URL.
