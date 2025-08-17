import express from 'express';
import { body, validationResult } from 'express-validator';
import Family from '../models/Family.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get family details
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.familyId) {
      return res.status(404).json({
        success: false,
        message: 'You are not part of any family'
      });
    }

    const family = await Family.findById(req.user.familyId)
      .populate('admin', 'firstName lastName mobile profilePicture')
      .populate('members.user', 'firstName lastName mobile profilePicture lastSeen');

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    res.json({
      success: true,
      family: {
        id: family._id,
        name: family.name,
        description: family.description,
        familyCode: family.familyCode,
        familyPicture: family.familyPicture,
        admin: family.admin,
        members: family.members,
        createdAt: family.createdAt
      }
    });

  } catch (error) {
    console.error('Family fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching family details'
    });
  }
});

// Update family details (admin only)
router.put('/', authenticateToken, requireAdmin, [
  body('name').optional().trim().notEmpty().withMessage('Family name cannot be empty'),
  body('description').optional().trim()
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

    const { name, description } = req.body;

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    if (name) family.name = name;
    if (description !== undefined) family.description = description;

    await family.save();

    res.json({
      success: true,
      message: 'Family details updated successfully',
      family: {
        id: family._id,
        name: family.name,
        description: family.description,
        familyCode: family.familyCode
      }
    });

  } catch (error) {
    console.error('Family update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating family details'
    });
  }
});

// Join family with code
router.post('/join', authenticateToken, [
  body('familyCode').trim().notEmpty().withMessage('Family code is required')
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

    const { familyCode } = req.body;

    // Check if user is already in a family
    if (req.user.familyId) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of a family'
      });
    }

    // Find family with the code
    const family = await Family.findOne({ familyCode, isActive: true });
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Invalid family code'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = family.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this family'
      });
    }

    // Add user to family
    family.members.push({
      user: req.user._id,
      relationship: 'member'
    });
    await family.save();

    // Update user's family reference
    await User.findByIdAndUpdate(req.user._id, { familyId: family._id });

    res.json({
      success: true,
      message: 'Successfully joined the family',
      family: {
        id: family._id,
        name: family.name,
        familyCode: family.familyCode
      }
    });

  } catch (error) {
    console.error('Join family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining family'
    });
  }
});

// Remove member from family (admin only)
router.delete('/member/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Cannot remove admin
    if (userId === family.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove family admin'
      });
    }

    // Remove member from family
    family.members = family.members.filter(
      member => member.user.toString() !== userId
    );
    await family.save();

    // Remove family reference from user
    await User.findByIdAndUpdate(userId, { familyId: null, role: 'member' });

    res.json({
      success: true,
      message: 'Member removed from family successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing member'
    });
  }
});

// Leave family
router.post('/leave', authenticateToken, async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Admin cannot leave, must transfer admin rights first
    if (family.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot leave family. Transfer admin rights first.'
      });
    }

    // Remove user from family members
    family.members = family.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );
    await family.save();

    // Remove family reference from user
    await User.findByIdAndUpdate(req.user._id, { familyId: null, role: 'member' });

    res.json({
      success: true,
      message: 'Successfully left the family'
    });

  } catch (error) {
    console.error('Leave family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving family'
    });
  }
});

export default router;
