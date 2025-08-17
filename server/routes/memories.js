import express from 'express';
import { body, validationResult } from 'express-validator';
import Memory from '../models/Memory.js';
import { authenticateToken, requireFamilyMember } from '../middleware/auth.js';

const router = express.Router();

// Get all memories for family
router.get('/', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const memories = await Memory.find({ 
      family: req.user.familyId, 
      isActive: true 
    })
    .populate('createdBy', 'firstName lastName profilePicture')
    .populate('tags.user', 'firstName lastName profilePicture')
    .populate('likes.user', 'firstName lastName')
    .populate('comments.user', 'firstName lastName profilePicture')
    .sort({ memoryDate: -1 })
    .skip(skip)
    .limit(limit);

    const totalMemories = await Memory.countDocuments({ 
      family: req.user.familyId, 
      isActive: true 
    });

    res.json({
      success: true,
      memories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMemories / limit),
        totalMemories,
        hasMore: page < Math.ceil(totalMemories / limit)
      }
    });

  } catch (error) {
    console.error('Fetch memories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching memories'
    });
  }
});

// Create new memory
router.post('/', authenticateToken, requireFamilyMember, [
  body('title').trim().notEmpty().withMessage('Memory title is required'),
  body('memoryDate').isISO8601().withMessage('Valid memory date is required'),
  body('media').isArray({ min: 1 }).withMessage('At least one media item is required')
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

    const { title, description, memoryDate, media, tags, location, privacy = 'family' } = req.body;

    const memory = new Memory({
      title,
      description,
      memoryDate,
      createdBy: req.user._id,
      family: req.user.familyId,
      media,
      tags: tags || [],
      location,
      privacy
    });

    await memory.save();

    const populatedMemory = await Memory.findById(memory._id)
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('tags.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Memory created successfully',
      memory: populatedMemory
    });

  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating memory'
    });
  }
});

// Like/Unlike memory
router.post('/:memoryId/like', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { memoryId } = req.params;

    const memory = await Memory.findOne({ 
      _id: memoryId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    const existingLike = memory.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      memory.likes = memory.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      memory.likes.push({ user: req.user._id });
    }

    await memory.save();

    res.json({
      success: true,
      message: existingLike ? 'Memory unliked' : 'Memory liked',
      likesCount: memory.likes.length,
      isLiked: !existingLike
    });

  } catch (error) {
    console.error('Like memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing like'
    });
  }
});

// Add comment to memory
router.post('/:memoryId/comment', authenticateToken, requireFamilyMember, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
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

    const { memoryId } = req.params;
    const { text } = req.body;

    const memory = await Memory.findOne({ 
      _id: memoryId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    memory.comments.push({
      user: req.user._id,
      text
    });

    await memory.save();

    const updatedMemory = await Memory.findById(memoryId)
      .populate('comments.user', 'firstName lastName profilePicture');

    const newComment = updatedMemory.comments[updatedMemory.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// Get memory details
router.get('/:memoryId', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { memoryId } = req.params;

    const memory = await Memory.findOne({ 
      _id: memoryId, 
      family: req.user.familyId, 
      isActive: true 
    })
    .populate('createdBy', 'firstName lastName profilePicture')
    .populate('tags.user', 'firstName lastName profilePicture')
    .populate('likes.user', 'firstName lastName')
    .populate('comments.user', 'firstName lastName profilePicture');

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    res.json({
      success: true,
      memory
    });

  } catch (error) {
    console.error('Fetch memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching memory'
    });
  }
});

// Delete memory (only by creator or admin)
router.delete('/:memoryId', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { memoryId } = req.params;

    const memory = await Memory.findOne({ 
      _id: memoryId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    // Check if user can delete (creator or admin)
    if (memory.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own memories'
      });
    }

    memory.isActive = false;
    await memory.save();

    res.json({
      success: true,
      message: 'Memory deleted successfully'
    });

  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting memory'
    });
  }
});

export default router;
