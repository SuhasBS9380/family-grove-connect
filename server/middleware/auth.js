import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    // Attach full user object and familyId from token to request
    req.user = user;
    req.user.familyId = decoded.familyId;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

export const requireFamilyMember = async (req, res, next) => {
  try {
    if (!req.user || !req.user.familyId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You must be part of a family to access this resource' 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error in family verification' 
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error in admin verification' 
    });
  }
};
