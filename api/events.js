import connectDB from './db.js';
import Event from '../server/models/Event.js';
import jwt from 'jsonwebtoken';

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  console.log('Events endpoint called with method:', req.method, 'URL:', req.url);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is an RSVP request (/events/{eventId}/rsvp)
    const urlParts = req.url.split('/');
    const isRSVP = urlParts.length > 3 && urlParts[urlParts.length - 1] === 'rsvp';
    
    if (isRSVP && req.method === 'POST') {
      // Handle RSVP
      const eventId = urlParts[urlParts.length - 2]; // Get eventId from URL
      const { status } = req.body;
      
      console.log('RSVP request for event:', eventId, 'status:', status);

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Remove existing RSVP from user
      event.attendees = event.attendees.filter(
        attendee => attendee.user.toString() !== decoded.userId
      );

      // Add new RSVP
      if (status && status !== 'none') {
        event.attendees.push({
          user: decoded.userId,
          status: status
        });
      }

      await event.save();
      await event.populate('attendees.user', 'firstName lastName');
      await event.populate('createdBy', 'firstName lastName');

      console.log('RSVP updated successfully');

      return res.status(200).json({
        success: true,
        data: event,
        message: 'RSVP updated successfully',
        status: status
      });
    }

    if (req.method === 'GET') {
      // Get events
      const { upcoming } = req.query;
      let query = {};
      
      if (upcoming === 'true') {
        query.date = { $gte: new Date() };
      }

      const events = await Event.find(query)
        .populate('createdBy', 'firstName lastName')
        .populate('attendees.user', 'firstName lastName')
        .sort({ date: 1 });

      console.log(`Found ${events.length} events`);

      return res.status(200).json({
        success: true,
        data: events
      });
    }

    if (req.method === 'POST') {
      // Create event
      const eventData = {
        ...req.body,
        createdBy: decoded.userId
      };

      const event = new Event(eventData);
      await event.save();
      
      await event.populate('createdBy', 'firstName lastName');

      console.log('Event created successfully');

      return res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

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
