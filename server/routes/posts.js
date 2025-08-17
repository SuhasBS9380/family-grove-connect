import express from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import { authenticateToken, requireFamilyMember } from '../middleware/auth.js';

const router = express.Router();

// Get all posts for family
router.get('/', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      family: req.user.familyId, 
      isActive: true 
    })
    .populate('user', 'firstName lastName profilePicture')
    .populate('comments.user', 'firstName lastName profilePicture')
    .populate('likes.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      family: req.user.familyId, 
      isActive: true 
    });

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: page < Math.ceil(totalPosts / limit)
      }
    });

  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
});

// Create new post
router.post('/', authenticateToken, requireFamilyMember, [
  body('content.text').optional().trim(),
  body('privacy').optional().isIn(['public', 'family', 'private']).withMessage('Invalid privacy setting')
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

    const { content, privacy = 'family' } = req.body;

    // Validate that post has some content
    if (!content || (!content.text && (!content.images || content.images.length === 0) && (!content.videos || content.videos.length === 0))) {
      return res.status(400).json({
        success: false,
        message: 'Post must have text, images, or videos'
      });
    }

    const post = new Post({
      user: req.user._id,
      family: req.user.familyId,
      content,
      privacy
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
});

// Like/Unlike post
router.post('/:postId/like', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({ 
      _id: postId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !existingLike
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing like'
    });
  }
});

// Add comment to post
router.post('/:postId/comment', authenticateToken, requireFamilyMember, [
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

    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findOne({ 
      _id: postId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.user._id,
      text
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('comments.user', 'firstName lastName profilePicture');

    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

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

// Delete post (only by post author or admin)
router.delete('/:postId', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({ 
      _id: postId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can delete (post owner or admin)
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
});

export default router;
