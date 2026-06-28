# RentEase Deployment Guide (Option 1)

This guide explains how to deploy the **RentEase - Furniture & Appliance Rental Platform** using the recommended configuration:
*   **Frontend:** Next.js deployed on **Netlify**
*   **Backend:** Express API deployed on **Vercel** (or alternatively **Render**)
*   **Database:** Cloud-hosted **MongoDB Atlas** (replacing the local JSON file database for production)

---

## 🛠️ Prerequisites

Before you begin, ensure you have accounts with:
1.  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
2.  [Vercel](https://vercel.com/) (Free tier available)
3.  [Netlify](https://www.netlify.com/) (Free tier available)
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

## ⚡ Step 2: Deploy the Backend to Vercel

The Express backend is preconfigured for Vercel using the [backend/vercel.json](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/backend/vercel.json) file.

### Option A: Via Vercel Web Dashboard (Recommended)
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

### Option B: Via Vercel CLI
1.  Install Vercel CLI: `npm install -g vercel`
2.  Open your terminal in the [backend/](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/backend) directory:
    ```bash
    cd backend
    vercel
    ```
3.  Follow the prompts to link the project, and then set your environment variables in the Vercel dashboard.

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
    npm run seed
    ```
4.  Once you see `🎉 Database seeding finished successfully!`, your cloud database is fully initialized with mock users and product listings.
5.  *Security Tip:* Remove the production `MONGODB_URI` from your local `.env` file to prevent accidental overwrites.

---

## 🌐 Step 4: Deploy the Frontend to Netlify

The frontend is configured using the [netlify.toml](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/netlify.toml) file in the root.

1.  Log in to **Netlify** and click **Add new site > Import an existing project**.
2.  Select your git provider (GitHub) and authorize.
3.  Choose your RentEase repository.
4.  Netlify will automatically read the [netlify.toml](file:///c:/Users/hp/OneDrive/Desktop/RentEase%20%E2%80%93%20Furniture%20&%20Appliance%20Rental%20Platform/netlify.toml) file. Double-check that these fields match:
    *   **Base directory:** `frontend`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `.next`
5.  Expand **Advanced build settings > Environment variables** and add:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend.vercel.app/api`
        *(Make sure to replace `your-backend.vercel.app` with your actual Vercel backend URL, and ensure it ends with `/api`)*
6.  Click **Deploy site**.
7.  Once deployed, Netlify will assign a live URL (e.g., `https://rentease-furniture.netlify.app`).

---

## 🔍 Step 5: Verification & Testing

1.  Open your deployed Netlify website URL.
2.  Try signing in using one of the preloaded credentials:
    *   **Role: Customer**
        *   **Email:** `user@rentease.com`
        *   **Password:** `user123`
    *   **Role: Admin**
        *   **Email:** `admin@rentease.com`
        *   **Password:** `admin123`
3.  Navigate through the catalog, view products, and test a rental checkout.
4.  Open the browser developer tools (F12) and inspect the **Network** tab to confirm all requests (e.g., `/products`, `/auth/login`) are pointing to your Vercel backend URL.

---

## 🔄 Alternative: Deploying Backend to Render

If you prefer **Render** instead of Vercel for hosting your Express backend:

1.  Create a new project on Render and select **Web Service**.
2.  Connect your GitHub repository.
3.  Configure the service details:
    *   **Name:** `rentease-backend`
    *   **Language:** `Node`
    *   **Base Directory:** `backend`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
4.  In the **Environment** tab, add the environment variables:
    *   `MONGODB_URI`: *Your Atlas connection string.*
    *   `JWT_SECRET`: *Your JWT secret.*
5.  Deploy the service and use the resulting URL (e.g., `https://rentease-backend.onrender.com/api`) as your `NEXT_PUBLIC_API_URL` on Netlify.
