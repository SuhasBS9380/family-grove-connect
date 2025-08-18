# Vercel Environment Variables Setup Guide

## Problem:
Your login API is failing because the environment variables (MONGODB_URI and JWT_SECRET) are not configured in Vercel.

## Solution:
Set up environment variables in Vercel Dashboard

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Login with your account

2. **Find Your Project:**
   - Look for "family-grove-connect" project
   - Click on it

3. **Go to Settings:**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

4. **Add Environment Variables:**
   
   **Variable 1:**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://avvamane:suhas123@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0`
   - Environments: Check "Production", "Preview", and "Development"
   - Click "Save"
   
   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: `family-grove-super-secret-jwt-key-2024`
   - Environments: Check "Production", "Preview", and "Development"
   - Click "Save"

5. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"
   - OR trigger a new deployment by pushing to GitHub

### Method 2: Using Vercel CLI (Alternative)

If you prefer CLI, run these commands:

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set environment variables
vercel env add MONGODB_URI production
# When prompted, enter: mongodb+srv://avvamane:suhas123@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0

vercel env add JWT_SECRET production
# When prompted, enter: family-grove-super-secret-jwt-key-2024

# Set for preview environment too
vercel env add MONGODB_URI preview
vercel env add JWT_SECRET preview

# Redeploy
vercel --prod
```

### MongoDB Atlas IP Whitelist Configuration

**Important:** Vercel serverless functions use dynamic IPs, so you need to:

1. **Go to MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com/
   - Login with your account

2. **Navigate to Network Access:**
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address"

3. **Whitelist All IPs (for Vercel):**
   - Click "Allow Access from Anywhere"
   - Or manually add: `0.0.0.0/0`
   - Add description: "Vercel Serverless Functions"
   - Click "Confirm"

### After Setup:

1. **Test Database Connection:**
   ```
   https://family-grove-connect.vercel.app/api/test-db
   ```

2. **Test Login:**
   ```
   POST https://family-grove-connect.vercel.app/api/auth/login
   Body: {"mobile": "your_mobile", "password": "your_password"}
   ```

The environment variables should resolve the "No exports found in module" error and enable proper authentication.
