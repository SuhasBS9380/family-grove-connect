# Family Grove Connect - Deployment Guide

## 🚀 Production Deployment Instructions

### Backend Deployment (Railway/Render)

1. **Create a separate repository for backend:**
   ```bash
   # Copy server folder to new repo
   cp -r server/ ../family-grove-backend/
   cd ../family-grove-backend/
   git init
   git add .
   git commit -m "Initial backend commit"
   ```

2. **Deploy on Railway:**
   - Go to https://railway.app/
   - Connect your GitHub account
   - Create new project from GitHub repo
   - Add environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     NODE_ENV=production
     PORT=8000
     ```

3. **Or Deploy on Render:**
   - Go to https://render.com/
   - Create new Web Service
   - Connect GitHub repo
   - Add environment variables (same as above)

### Frontend Deployment (Vercel)

1. **Update API URL for production**
2. **Deploy to Vercel:**
   - Connect GitHub repo
   - Vercel auto-detects Vite project
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app/api
     ```

### Environment Variables Needed:

**Backend (.env):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/familygrove
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=8000
```

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.railway.app/api
```
