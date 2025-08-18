@echo off
echo Setting up Vercel environment variables...

echo.
echo Step 1: Install Vercel CLI (if not already installed)
npm install -g vercel

echo.
echo Step 2: Login to Vercel (if not already logged in)
vercel login

echo.
echo Step 3: Link to your Vercel project
vercel link

echo.
echo Step 4: Set environment variables
echo Setting MONGODB_URI...
vercel env add MONGODB_URI production "mongodb+srv://avvamane:suhas123@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0"

echo Setting JWT_SECRET...
vercel env add JWT_SECRET production "family-grove-super-secret-jwt-key-2024"

echo.
echo Step 5: Also set for preview and development
vercel env add MONGODB_URI preview "mongodb+srv://avvamane:suhas123@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0"
vercel env add JWT_SECRET preview "family-grove-super-secret-jwt-key-2024"

echo.
echo Environment variables setup complete!
echo.
echo Next: Run 'vercel --prod' to redeploy with new environment variables
pause
