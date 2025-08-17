import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB Atlas connection options
    const options = {
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000
    };

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    
    // If Atlas connection fails, provide helpful instructions
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🚨 IP WHITELIST ISSUE DETECTED:');
      console.log('📋 To fix this issue:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to "Network Access"');
      console.log('3. Click "ADD IP ADDRESS"');
      console.log('4. Add your current IP: 157.50.191.107');
      console.log('5. Or add 0.0.0.0/0 to allow all IPs (development only)');
      console.log('\n⚠️  Running without database - all API calls will fail');
    }
    
    // Don't exit the process, let the app run for demonstration
    console.log('🔄 Server will continue without database connection...');
    return false;
  }
};

export default connectDB;
