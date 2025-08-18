# Render Deployment Guide for Family Grove Connect

## Overview
This guide helps you deploy your Family Grove Connect app on Render, which is easier than Vercel for full-stack apps.

## Prerequisites
1. GitHub repository (already done ✅)
2. Render account (sign up at https://render.com)
3. MongoDB Atlas database (already configured ✅)

## Deployment Steps

### 1. Create Web Service on Render

1. **Go to Render Dashboard:**
   - Visit: https://render.com/
   - Sign up/Login with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `SuhasBS9380/family-grove-connect`
   - Choose the repository

3. **Configure the Web Service:**
   ```
   Name: family-grove-connect
   Environment: Node
   Region: Singapore (closest to you)
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

### 2. Environment Variables Setup

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://avvamane:suhas123@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=family-grove-super-secret-jwt-key-2024
PORT=10000
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

### 3. MongoDB Atlas Configuration

1. **Whitelist Render IPs:**
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (Allow access from anywhere)
   - Or add Render's IP ranges if you prefer more security

### 4. Domain & URLs

After deployment, you'll get:
- **App URL:** `https://family-grove-connect.onrender.com`
- **API Base:** `https://family-grove-connect.onrender.com/api`

## Advantages of Render over Vercel

✅ **No serverless function limits** (Vercel has 12 function limit)
✅ **Easier backend deployment** (traditional server approach)
✅ **Better for full-stack apps** (single service for frontend + backend)
✅ **Persistent file system** (unlike serverless)
✅ **WebSocket support** (for real-time features)
✅ **Database connections** (no cold start issues)

## Next Steps After Deployment

1. Test the deployed app
2. Update frontend API URLs
3. Test all functionality
4. Set up custom domain (optional)

The app will be available at your Render URL once deployed!
