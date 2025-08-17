import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import { authenticateToken, requireFamilyMember } from '../middleware/auth.js';

const router = express.Router();

// Get all messages for family
router.get('/', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ 
      family: req.user.familyId, 
      isDeleted: false 
    })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('readBy.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Mark messages as read by current user
    const unreadMessageIds = messages
      .filter(msg => !msg.readBy.some(read => read.user._id.toString() === req.user._id.toString()))
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $push: { readBy: { user: req.user._id } } }
      );
    }

    res.json({
      success: true,
      messages: messages.reverse() // Reverse to show oldest first
    });

  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
});

// Send new message
router.post('/', authenticateToken, requireFamilyMember, [
  body('content.text').optional().trim(),
  body('messageType').isIn(['text', 'image', 'video', 'audio', 'file']).withMessage('Invalid message type')
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

    const { content, messageType = 'text' } = req.body;

    // Validate that message has content
    if (!content || (!content.text && !content.image && !content.video && !content.audio)) {
      return res.status(400).json({
        success: false,
        message: 'Message must have content'
      });
    }

    const message = new Message({
      sender: req.user._id,
      family: req.user.familyId,
      content,
      messageType,
      readBy: [{ user: req.user._id }] // Mark as read by sender
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName profilePicture')
      .populate('readBy.user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// Delete message (only by sender)
router.delete('/:messageId', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({ 
      _id: messageId, 
      family: req.user.familyId,
      sender: req.user._id,
      isDeleted: false 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you cannot delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      family: req.user.familyId,
      isDeleted: false,
      'readBy.user': { $ne: req.user._id }
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting unread count'
    });
  }
});

export default router;
