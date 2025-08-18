import connectDB from './db.js';
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

    if (req.method === 'GET') {
      // Get events
      const { upcoming } = req.query;
      let query = {};
      
      if (upcoming === 'true') {
        query.date = { $gte: new Date() };
      }

      const events = await Event.find(query)
        .populate('createdBy', 'name')
        .sort({ date: 1 });

      res.status(200).json({
        success: true,
        data: events
      });
    } else if (req.method === 'POST') {
      // Create event
      const eventData = {
        ...req.body,
        createdBy: decoded.userId
      };

      const event = new Event(eventData);
      await event.save();
      
      await event.populate('createdBy', 'name');

      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Events API error:', error);
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
