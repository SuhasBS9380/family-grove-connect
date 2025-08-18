import connectDB from './db.js';
import User from '../server/models/User.js';
import Post from '../server/models/Post.js';
import Message from '../server/models/Message.js';
import Event from '../server/models/Event.js';
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

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.method === 'POST') {
      // Create demo data
      
      // Sample posts
      const samplePosts = [
        {
          content: "Welcome to Avva Mane! 🏠 This is our family's digital home where we can share memories, chat, and plan events together.",
          author: user._id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          content: "Just had an amazing family dinner! The kids loved the homemade pizza 🍕",
          author: user._id,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          content: "Planning a family picnic for this weekend. Who's excited? 🧺",
          author: user._id,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ];

      // Check if posts already exist to avoid duplicates
      const existingPosts = await Post.countDocuments({ author: user._id });
      if (existingPosts === 0) {
        await Post.insertMany(samplePosts);
      }

      // Sample messages
      const sampleMessages = [
        {
          content: "Hello everyone! 👋",
          sender: user._id,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          content: "Hope everyone is having a great day!",
          sender: user._id,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          content: "Don't forget about the family meeting this weekend!",
          sender: user._id,
          createdAt: new Date(Date.now() - 60 * 60 * 1000)
        }
      ];

      // Check if messages already exist
      const existingMessages = await Message.countDocuments({ sender: user._id });
      if (existingMessages === 0) {
        await Message.insertMany(sampleMessages);
      }

      // Sample events
      const sampleEvents = [
        {
          title: "Family Game Night",
          description: "Let's play some board games and have fun together!",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          time: "19:00",
          location: "Living Room",
          createdBy: user._id,
          attendees: []
        },
        {
          title: "Weekend Picnic",
          description: "A fun outdoor picnic in the park with delicious food!",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: "12:00",
          location: "Central Park",
          createdBy: user._id,
          attendees: []
        }
      ];

      // Check if events already exist
      const existingEvents = await Event.countDocuments({ createdBy: user._id });
      if (existingEvents === 0) {
        await Event.insertMany(sampleEvents);
      }

      res.status(200).json({
        success: true,
        message: 'Demo data created successfully! Refresh your dashboard to see the content.'
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Create demo data error:', error);
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
