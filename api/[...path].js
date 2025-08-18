import connectDB from './db.js';
import User from '../server/models/User.js';
import Post from '../server/models/Post.js';
import Message from '../server/models/Message.js';
import Event from '../server/models/Event.js';
import Family from '../server/models/Family.js';
import bcrypt from 'bcryptjs';
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

  // Extract path from URL
  const path = req.url.split('?')[0];
  console.log('API Request path:', path); // Debug log
  
  // Remove /api prefix if present
  const cleanPath = path.startsWith('/api/') ? path.substring(5) : path.substring(1);
  const pathParts = cleanPath.split('/');
  
  console.log('Clean path:', cleanPath, 'Path parts:', pathParts); // Debug log

  try {
    // Route based on path
    if (cleanPath.startsWith('auth/')) {
      return await handleAuth(req, res, pathParts);
    } else if (cleanPath.startsWith('posts')) {
      return await handlePosts(req, res, pathParts);
    } else if (cleanPath.startsWith('messages')) {
      return await handleMessages(req, res, pathParts);
    } else if (cleanPath.startsWith('events')) {
      return await handleEvents(req, res, pathParts);
    } else if (cleanPath.startsWith('family')) {
      return await handleFamily(req, res, pathParts);
    } else if (cleanPath === 'health') {
      return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    } else {
      console.log('No route matched for path:', cleanPath); // Debug log
      return res.status(404).json({ success: false, message: 'Endpoint not found', path: cleanPath });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Auth handlers
async function handleAuth(req, res, pathParts) {
  const endpoint = pathParts[1]; // auth/login -> 'login'
  console.log('Auth endpoint:', endpoint, 'Method:', req.method); // Debug log

  if (endpoint === 'login' && req.method === 'POST') {
    try {
      const { mobile, password } = req.body;
      console.log('Login attempt for mobile:', mobile); // Debug log

      if (!mobile || !password) {
        return res.status(400).json({ success: false, message: 'Mobile and password are required' });
      }

      const user = await User.findOne({ mobile }).select('+password');
      if (!user) {
        console.log('User not found for mobile:', mobile); // Debug log
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Password mismatch for mobile:', mobile); // Debug log
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const userResponse = user.toObject();
      delete userResponse.password;

      console.log('Login successful for mobile:', mobile); // Debug log
      return res.status(200).json({ success: true, message: 'Login successful', token, user: userResponse });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Login failed due to server error' });
    }
  }

  if (endpoint === 'register' && req.method === 'POST') {
    const { mobile, password, firstName, lastName, email, dateOfBirth, gender } = req.body;

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      mobile, password: hashedPassword, firstName, lastName, email, dateOfBirth, gender
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({ success: true, message: 'User registered successfully', token, user: userResponse });
  }

  if (endpoint === 'profile') {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (req.method === 'GET') {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, data: user });
    }

    if (req.method === 'PUT') {
      const updateData = req.body;
      const user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true, runValidators: true }).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, data: user, message: 'Profile updated successfully' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Posts handlers
async function handlePosts(req, res, pathParts) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (req.method === 'GET') {
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

    return res.status(200).json({
      success: true,
      posts: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts: totalPosts,
        hasMore: page * limit < totalPosts
      }
    });
  }

  if (req.method === 'POST') {
    const { content, imageUrl } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const post = new Post({ content: content.trim(), imageUrl, author: decoded.userId });
    await post.save();
    await post.populate('author', 'firstName lastName');

    return res.status(201).json({ success: true, post: post, message: 'Post created successfully' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Messages handlers
async function handleMessages(req, res, pathParts) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments();

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages: totalMessages,
        hasMore: page * limit < totalMessages
      }
    });
  }

  if (req.method === 'POST') {
    const { content, type = 'text' } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const message = new Message({ content: content.trim(), type, sender: decoded.userId });
    await message.save();
    await message.populate('sender', 'firstName lastName');

    return res.status(201).json({ success: true, message: message, message_text: 'Message sent successfully' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Events handlers
async function handleEvents(req, res, pathParts) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (pathParts.length === 3 && pathParts[2] === 'rsvp') {
    // Handle /events/{eventId}/rsvp
    const eventId = pathParts[1];
    if (req.method === 'POST') {
      const { status } = req.body;
      
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      event.attendees = event.attendees.filter(attendee => attendee.user.toString() !== decoded.userId);

      if (status && status !== 'none') {
        event.attendees.push({ user: decoded.userId, status: status });
      }

      await event.save();
      await event.populate('attendees.user', 'name');

      return res.status(200).json({
        success: true,
        data: event,
        message: 'RSVP updated successfully',
        status: status
      });
    }
  }

  if (req.method === 'GET') {
    const { upcoming } = req.query;
    let query = {};
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    return res.status(200).json({ success: true, data: events });
  }

  if (req.method === 'POST') {
    const eventData = { ...req.body, createdBy: decoded.userId };
    const event = new Event(eventData);
    await event.save();
    await event.populate('createdBy', 'name');

    return res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Family handlers
async function handleFamily(req, res, pathParts) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (req.method === 'GET') {
    let family = null;
    if (user.family) {
      family = await Family.findById(user.family).populate('members', 'firstName lastName email');
    }
    return res.status(200).json({ success: true, family: family });
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Family name is required' });
    }

    const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const family = new Family({
      name: name.trim(),
      description: description?.trim(),
      familyCode,
      admin: decoded.userId,
      members: [decoded.userId]
    });

    await family.save();
    user.family = family._id;
    await user.save();
    await family.populate('members', 'firstName lastName email');

    return res.status(201).json({ success: true, family: family, message: 'Family created successfully' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Helper function
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}
