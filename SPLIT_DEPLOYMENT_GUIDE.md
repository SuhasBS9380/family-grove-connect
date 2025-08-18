# FREE DEPLOYMENT GUIDE - Split Setup

## 🎯 Total Cost: $0 (Completely Free!)

### Frontend: Netlify (Free)
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ Automatic deployments

### Backend: Railway (Free)
- ✅ $5 credit every month
- ✅ ~$3-4/month usage for small apps
- ✅ PostgreSQL/MongoDB included
- ✅ No sleeping (unlike other free tiers)

---

## Deployment Steps

### 1. Deploy Backend to Railway

1. **Go to Railway:**
   - Visit: https://railway.app/
   - Sign up with GitHub (free)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `SuhasBS9380/family-grove-connect`

3. **Configure Service:**
   - Root Directory: `server`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://avvamane:suhas123@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=family-grove-super-secret-jwt-key-2024
     PORT=3000
     ```

4. **Get Backend URL:**
   - After deployment, copy the Railway URL
   - Example: `https://family-grove-connect-backend.up.railway.app`

### 2. Deploy Frontend to Netlify

1. **Go to Netlify:**
   - Visit: https://netlify.com/
   - Sign up with GitHub (free)

2. **Create New Site:**
   - Click "New site from Git"
   - Choose GitHub
   - Select: `SuhasBS9380/family-grove-connect`

3. **Configure Build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     ```
     VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
     ```

4. **Deploy:**
   - Click "Deploy site"
   - Get your Netlify URL: `https://your-app-name.netlify.app`

---

## Alternative: Use Render Free Tier (Easier)

**Good News: Render IS Free!**

Just go to render.com and use their free tier:
- 750 hours/month (enough for hobby projects)
- Apps sleep after 15 minutes (normal for free tiers)
- No credit card required

---

## Which option do you prefer?

1. **Split Deployment** - Best performance, 100% free
2. **Render Free Tier** - Easier setup, slight cold starts
3. **Show me other free options**
