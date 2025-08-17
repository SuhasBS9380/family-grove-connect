import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Family from '../models/Family.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate family code
const generateFamilyCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Register
router.post('/register', [
  body('mobile').custom((value) => {
    // Clean the mobile number by removing all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Remove leading zeros and country code
    let normalized = cleaned.replace(/^0+/, '').replace(/^91/, '');
    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    if (!/^[6-9][0-9]{9}$/.test(normalized)) {
      throw new Error('Please enter a valid Indian mobile number');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    console.log('📥 Registration request received:', { ...req.body, password: '***' });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { mobile, password, firstName, lastName, email, dateOfBirth, gender, createFamily, familyCode } = req.body;

    // Normalize mobile number
    let normalizedMobile = mobile.replace(/\D/g, '');
    if (normalizedMobile.startsWith('91') && normalizedMobile.length === 12) {
      normalizedMobile = normalizedMobile.substring(2);
    }
    if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
      normalizedMobile = normalizedMobile.substring(1);
    }

    console.log('🔍 Checking for existing user with mobile:', normalizedMobile);

    // Check if user already exists
    const existingUser = await User.findOne({ mobile: normalizedMobile });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this mobile number already exists. Please try logging in instead.'
      });
    }

    console.log('✅ Mobile number available, creating new user...');

    // Create user with default role as 'member'
    const user = new User({
      mobile: normalizedMobile,
      password,
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      role: 'member' // Set default role as member
    });
    await user.save();
    console.log('👤 User created successfully');

    // All users join the single private family
    const FAMILY_NAME = "Family Grove Connect";
    let family = await Family.findOne({ name: FAMILY_NAME });

    if (!family) {
      // Create the family if it doesn't exist (only for the first user)
      const newFamilyCode = generateFamilyCode();
      family = new Family({
        name: FAMILY_NAME,
        familyCode: newFamilyCode,
        admin: user._id,
        members: [{ user: user._id, relationship: 'admin' }]
      });
      user.role = 'admin'; // The first user is the admin
      console.log(`🏠 New family "${FAMILY_NAME}" created.`);
    } else {
      // Add new user to the existing family
      const alreadyMember = family.members.some(m => m.user.toString() === user._id.toString());
      if (!alreadyMember) {
        family.members.push({ user: user._id, relationship: 'member' });
        console.log(`👥 User joined existing family "${FAMILY_NAME}".`);
      }
    }
    
    await family.save();
    user.familyId = family._id;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, familyId: user.familyId ? user.familyId._id : null },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        familyId: user.familyId,
        role: user.role
      },
      family: family ? {
        id: family._id,
        name: family.name,
        familyCode: family.familyCode
      } : null
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login
router.post('/login', [
  body('mobile').custom((value) => {
    // Clean the mobile number
    const cleaned = value.replace(/\D/g, '');
    // Check if it's a valid Indian mobile number
    if (!/^[6-9][0-9]{9}$/.test(cleaned) && !/^91[6-9][0-9]{9}$/.test(cleaned)) {
      throw new Error('Please enter a valid Indian mobile number');
    }
    return true;
  }),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('📥 Login request received:', { mobile: req.body.mobile, password: '***' });
    
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

    // Normalize mobile number
    let normalizedMobile = mobile.replace(/\D/g, '');
    if (normalizedMobile.startsWith('91') && normalizedMobile.length === 12) {
      normalizedMobile = normalizedMobile.substring(2);
    }
    if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
      normalizedMobile = normalizedMobile.substring(1);
    }

    console.log('🔍 Looking for user with normalized mobile:', normalizedMobile);

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please check MongoDB Atlas IP whitelist.',
        details: 'Your IP address (157.50.191.107) needs to be whitelisted in MongoDB Atlas.'
      });
    }

    // Find user
    const user = await User.findOne({ mobile: normalizedMobile, isActive: true }).populate('familyId');
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    console.log('👤 User found:', user.firstName, user.lastName);

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    console.log('✅ Password valid, generating token...');

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, familyId: user.familyId ? user.familyId._id : null },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        familyId: user.familyId,
        role: user.role,
        lastSeen: user.lastSeen
      },
      family: user.familyId ? {
        id: user.familyId._id,
        name: user.familyId.name,
        familyCode: user.familyId.familyCode
      } : null
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('familyId');

    res.json({
      success: true,
      user: {
        id: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profilePicture: user.profilePicture,
        familyId: user.familyId,
        role: user.role,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      },
      family: user.familyId ? {
        id: user.familyId._id,
        name: user.familyId.name,
        familyCode: user.familyId.familyCode
      } : null
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, dateOfBirth, gender } = req.body;

    const user = await User.findById(req.user._id);
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

export default router;
