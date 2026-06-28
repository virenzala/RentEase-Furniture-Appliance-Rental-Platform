# RentEase Deployment Guide

This guide explains how to deploy the **RentEase - Furniture & Appliance Rental Platform** for free using two options:
*   **Option 1:** Frontend on Netlify + Backend on Vercel (Recommended separate setup)
*   **Option 2:** Both Frontend and Backend on a Single Vercel Project (Recommended for single-domain / no CORS)

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

## 🌱 Step 2: Seed the Production Database

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

## 📦 Option A: Single Vercel Project (Multi-Service Monorepos)
This is the easiest and most modern deployment route. Both the Next.js frontend and Express backend are deployed to a single Vercel project on the **same domain**. This uses the [vercel.json](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/vercel.json) file created in the workspace root.

1.  Push your code repository to **GitHub**.
2.  Log in to **Vercel** and click **Add New > Project**.
3.  Import your RentEase repository.
4.  In the project configuration:
    *   **Project Name:** `rent-ease-furniture-appliance-rental-platform`
    *   **Root Directory:** Select **`./`** (the workspace root containing the `vercel.json` file).
    *   Vercel will read the root `vercel.json` and automatically detect the **Frontend** service (Next.js) and the **Backend** service (Express).
5.  In the **Environment Variables** section of the project, add:
    *   `MONGODB_URI`: *Your MongoDB Atlas connection string from Step 1.*
    *   `JWT_SECRET`: `rentease_super_secret_jwt_key_2026`
    *   `NEXT_PUBLIC_API_URL`: `/_/backend/api`  *(Since both run on the same domain, a relative URL is fully supported and eliminates CORS issues!)*
6.  Click **Deploy**.
7.  Vercel will deploy:
    *   The frontend website at the root (`/`).
    *   The Express API routes at the prefix path (`/_/backend`).

---

## ⚡ Option B: Frontend on Netlify + Separate Backend on Vercel
If you prefer to split the hosting providers:

### 1. Deploy the Backend to Vercel
1.  Log in to **Vercel** and click **Add New > Project**.
2.  Import your repository.
3.  Set the **Root Directory** to **`backend`** and select framework preset **Other**.
4.  Add environment variables:
    *   `MONGODB_URI`: *Your MongoDB Atlas connection string.*
    *   `JWT_SECRET`: `rentease_super_secret_jwt_key_2026`
5.  Deploy and copy the deployed URL (e.g., `https://rentease-backend.vercel.app`).

### 2. Deploy the Frontend to Netlify
1.  Log in to **Netlify** and import the repository.
2.  It will read [netlify.toml](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/netlify.toml) automatically:
    *   **Base directory:** `frontend`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `.next`
3.  Add the environment variable:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend-project.vercel.app/api` *(Make sure to append `/api`)*
4.  Deploy.
