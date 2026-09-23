# 🚀 CampusCare Production Deployment Guide

This guide explains how to deploy **CampusCare** online for **free** so anyone can access it from their phone, tablet, or laptop.

---

## 🏗️ Architecture Overview

| Component | Technology | Free Recommended Host |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router | **Vercel** or **Netlify** |
| **Backend API** | Node.js, Express, REST API | **Render** or **Railway** |

---

## 📋 Step 1: Push Code to GitHub

1. Open your terminal in the project root:
   ```bash
   git init
   git add .
   git commit -m "feat: complete CampusCare platform with light pink theme"
   ```
2. Create a new repository on [GitHub.com](https://github.com/new) named `campuscare`.
3. Link and push your repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/campuscare.git
   git push -u origin main
   ```

---

## ⚙️ Step 2: Deploy Backend to Render (Free)

1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository (`campuscare`).
4. Fill in the service configuration:
   * **Name**: `campuscare-backend`
   * **Root Directory**: `backend`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Plan**: `Free`
5. Under **Environment Variables**, add:
   * `PORT` = `5000`
   * `JWT_SECRET` = `campuscare_super_secret_jwt_key_2026_secure`
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://campuscare-backend-xxxx.onrender.com`).

> **API Health Check**: Visit `https://your-render-url.onrender.com/api/health` — it should return `{"status":"OK"}`.

---

## 🌐 Step 3: Deploy Frontend to Vercel (Free)

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository (`campuscare`).
4. In the configuration screen:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `./` (leave default)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-render-url.onrender.com/api` (replace with your Render backend URL from Step 2)
6. Click **Deploy**.
7. Within 1 minute, your live site will be ready at `https://campuscare-xxxx.vercel.app`! 🎉

---

## 🌐 Alternative: Deploy Frontend to Netlify

1. Go to [Netlify.com](https://netlify.com) and click **Add new site** &rarr; **Import an existing project**.
2. Connect your GitHub repository.
3. Configure build settings:
   * **Base directory**: (empty / root)
   * **Build command**: `npm run build`
   * **Publish directory**: `dist`
4. Under **Environment variables**, add:
   * `VITE_API_URL` = `https://your-render-url.onrender.com/api`
5. Click **Deploy campuscare**.

---

## 🔑 Live Demo Credentials

| Role | Email / Identifier | Password |
| :--- | :--- | :--- |
| **Dean / Administrator** | `admin@college.edu` | `admin123` |
| **IT Lead / Staff** | `alex.chen@college.edu` | `staff123` |
| **Student** | `STU-2024-8841` or `priya.sharma@college.edu` | `student123` |
