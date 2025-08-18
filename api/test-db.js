import connectDB from './db.js';
import User from '../server/models/User.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('Database connected successfully');

    // Check if there are any users
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);

    // Get first user (without password) for testing
    const firstUser = await User.findOne().select('-password');
    console.log('First user:', firstUser);

    res.status(200).json({
      success: true,
      message: 'Database test successful',
      userCount: userCount,
      firstUser: firstUser,
      mongodbConnected: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });
  }
}
