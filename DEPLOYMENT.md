# RentEase Deployment Guide

This guide explains how to deploy the **RentEase - Furniture & Appliance Rental Platform** for free using Supabase (PostgreSQL Database) and Vercel/Netlify.

---

## 🛠️ Prerequisites

Before you begin, ensure you have accounts with:
1.  [Supabase](https://supabase.com/) (Free tier available)
2.  [Vercel](https://vercel.com/) (Free tier available)
3.  [Netlify](https://www.netlify.com/) (Free tier available, only needed for Option B)
4.  [GitHub](https://github.com/) (to store your code and connect to Netlify/Vercel)

---

## 💾 Step 1: Set Up Supabase (Production Database)

Since Vercel's serverless environment is stateless, a cloud database is required. RentEase uses a JSONB document-store schema on top of PostgreSQL via Supabase.

1.  Log in to **Supabase** and create a new project.
2.  Set a database password and keep it safe.
3.  Once the project is provisioned, go to **Project Settings > Database** and copy the **Transaction Connection string** or **Session Connection string** under **Connection string > URI**. It should look like:
    ```text
    postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
    ```
4.  Replace `[password]` with your database password.
5.  Also copy the **Supabase URL**, **Anon/Public Key**, and **Service Role API Key** from **Project Settings > API**.

---

## 🌱 Step 2: Seed the Production Database

To populate your live Supabase database with the default catalog (104 furniture and appliance listings) and default accounts:

1.  Open your local [backend/.env](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/backend/.env) file.
2.  Paste your Supabase environment credentials:
    ```env
    PORT=5000
    JWT_SECRET=rentease_super_secret_jwt_key_2026
    DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
    SUPABASE_URL=https://[project-id].supabase.co
    SUPABASE_SECRET_KEY=sb_secret_...
    SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
    SUPABASE_JWKS_URL=https://[project-id].supabase.co/auth/v1/.well-known/jwks.json
    ```
3.  In your terminal, navigate to the `backend` folder and run the seed script:
    ```bash
    cd backend
    npm run seed
    ```
4.  The script will automatically connect to Supabase, initialize the SQL tables (`users`, `products`, `rentals`, `maintenance_requests`), and insert the default users and 104 products.
5.  Once you see `🎉 Database seeding finished successfully!`, your cloud database is fully initialized.

---

## 📦 Option A: Single Vercel Project (Recommended Setup)
This is the easiest and most modern deployment route. Both the Next.js frontend and Express backend are deployed to a single Vercel project on the **same domain**. This uses the [vercel.json](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/vercel.json) file created in the workspace root.

1.  Push your code repository to **GitHub**.
2.  Log in to **Vercel** and click **Add New > Project**.
3.  Import your RentEase repository.
4.  In the project configuration:
    *   **Project Name:** `rent-ease`
    *   **Root Directory:** Select **`./`** (the workspace root containing the `vercel.json` file).
5.  In the **Environment Variables** section of the project, add:
    *   `DATABASE_URL`: *Your Supabase PostgreSQL connection string from Step 1.*
    *   `SUPABASE_URL`: *Your Supabase Project URL.*
    *   `SUPABASE_SECRET_KEY`: *Your Supabase Service Key.*
    *   `SUPABASE_PUBLISHABLE_KEY`: *Your Supabase Anon Key.*
    *   `SUPABASE_JWKS_URL`: `https://[project-id].supabase.co/auth/v1/.well-known/jwks.json`
    *   `JWT_SECRET`: `rentease_super_secret_jwt_key_2026` (or any secure secret key)
    *   `NEXT_PUBLIC_API_URL`: `/api`  *(Since both run on the same domain, a relative URL is fully supported and eliminates CORS issues!)*
6.  Click **Deploy**.
7.  Vercel will build both applications and host:
    *   The Next.js frontend website at the root (`/`).
    *   The Express API routes at the prefix path (`/api`).

---

## ⚡ Option B: Frontend on Netlify + Separate Backend on Vercel
If you prefer to split the hosting providers:

### 1. Deploy the Backend to Vercel
1.  Log in to **Vercel** and click **Add New > Project**.
2.  Import your repository.
3.  Set the **Root Directory** to **`backend`** and select framework preset **Other**.
4.  Add environment variables:
    *   `DATABASE_URL`: *Your Supabase connection string.*
    *   `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWKS_URL`
    *   `JWT_SECRET`: `rentease_super_secret_jwt_key_2026`
5.  Deploy and copy the deployed backend URL (e.g., `https://rentease-backend.vercel.app`).

### 2. Deploy the Frontend to Netlify
1.  Log in to **Netlify** and import the repository.
2.  It will read [netlify.toml](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/netlify.toml) automatically:
    *   **Base directory:** `frontend`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `.next`
3.  Add the environment variable:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend-project.vercel.app/api` *(Make sure to append `/api`)*
4.  Deploy.
