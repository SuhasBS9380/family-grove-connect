import express from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from './models/User.js';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = "mongodb+srv://avvamane:suhas123%40@cluster0.liudbrx.mongodb.net/family-grove-connect?retryWrites=true&w=majority&appName=Cluster0";

await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB Atlas');

// Test login endpoint
app.post('/test-login', [
  body('mobile').isMobilePhone('en-IN').withMessage('Please enter a valid mobile number'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('📥 Login request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { mobile, password } = req.body;
    console.log('🔍 Looking for user with mobile:', mobile);

    // Find user
    const user = await User.findOne({ mobile, isActive: true });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found or inactive');
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    console.log('🔐 Checking password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    console.log('✅ Login successful');
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.listen(3001, () => {
  console.log('🧪 Test server running on http://localhost:3001');
  console.log('📝 Test endpoint: POST http://localhost:3001/test-login');
});
