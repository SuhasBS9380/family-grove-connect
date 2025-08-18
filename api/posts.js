import connectDB from './db.js';
import Post from '../server/models/Post.js';
import jwt from 'jsonwebtoken';

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

  await connectDB();

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (req.method === 'GET') {
      // Get posts with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const posts = await Post.find()
        .populate('author', 'firstName lastName')
        .populate('likes', 'firstName lastName')
        .populate('comments.author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPosts = await Post.countDocuments();

      res.status(200).json({
        success: true,
        posts: posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts: totalPosts,
          hasMore: page * limit < totalPosts
        }
      });
    } else if (req.method === 'POST') {
      // Create new post
      const { content, imageUrl } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Post content is required'
        });
      }

      const post = new Post({
        content: content.trim(),
        imageUrl,
        author: decoded.userId
      });

      await post.save();
      await post.populate('author', 'firstName lastName');

      res.status(201).json({
        success: true,
        post: post,
        message: 'Post created successfully'
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Posts API error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
