import mongoose from 'mongoose';
import User from './models/User.js';

// MongoDB Atlas connection string with your credentials
const MONGODB_URI = "mongodb+srv://avvamane:suhas123%40@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0";

const checkUsers = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find all users
    const users = await User.find({});
    console.log(`\n📋 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   Mobile: ${user.mobile}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email || 'Not set'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Family ID: ${user.familyId || 'Not set'}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Test password verification for admin user
    const adminUser = await User.findOne({ mobile: '9380102924' });
    if (adminUser) {
      console.log(`\n🔐 Testing password for admin user...`);
      const isPasswordValid = await adminUser.comparePassword('123456');
      console.log(`   Password '123456' is valid: ${isPasswordValid}`);
      
      // Also test wrong password
      const isWrongPasswordValid = await adminUser.comparePassword('wrong');
      console.log(`   Password 'wrong' is valid: ${isWrongPasswordValid}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
