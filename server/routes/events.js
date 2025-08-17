import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import { authenticateToken, requireFamilyMember } from '../middleware/auth.js';

const router = express.Router();

// Get all events for family
router.get('/', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { upcoming = true } = req.query;
    
    let query = { 
      family: req.user.familyId, 
      isActive: true 
    };

    if (upcoming === 'true') {
      query.eventDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('attendees.user', 'firstName lastName profilePicture')
      .sort({ eventDate: 1 });

    res.json({
      success: true,
      events
    });

  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching events'
    });
  }
});

// Create new event
router.post('/', authenticateToken, requireFamilyMember, [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('eventTime').trim().notEmpty().withMessage('Event time is required'),
  body('eventType').optional().isIn(['birthday', 'anniversary', 'reunion', 'celebration', 'meeting', 'other'])
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

    const { title, description, eventDate, eventTime, location, eventType = 'other', images } = req.body;

    const event = new Event({
      title,
      description,
      eventDate,
      eventTime,
      location,
      createdBy: req.user._id,
      family: req.user.familyId,
      eventType,
      images: images || [],
      attendees: [{ user: req.user._id, status: 'going' }] // Creator is automatically going
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('attendees.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating event'
    });
  }
});

// RSVP to event
router.post('/:eventId/rsvp', authenticateToken, requireFamilyMember, [
  body('status').isIn(['going', 'maybe', 'not_going']).withMessage('Invalid RSVP status')
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

    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findOne({ 
      _id: eventId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find existing RSVP
    const existingRsvp = event.attendees.find(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (existingRsvp) {
      // Update existing RSVP
      existingRsvp.status = status;
      existingRsvp.respondedAt = new Date();
    } else {
      // Add new RSVP
      event.attendees.push({
        user: req.user._id,
        status,
        respondedAt: new Date()
      });
    }

    await event.save();

    res.json({
      success: true,
      message: 'RSVP updated successfully',
      status
    });

  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating RSVP'
    });
  }
});

// Get event details
router.get('/:eventId', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ 
      _id: eventId, 
      family: req.user.familyId, 
      isActive: true 
    })
    .populate('createdBy', 'firstName lastName profilePicture')
    .populate('attendees.user', 'firstName lastName profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Fetch event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event'
    });
  }
});

// Update event (only by creator or admin)
router.put('/:eventId', authenticateToken, requireFamilyMember, [
  body('title').optional().trim().notEmpty().withMessage('Event title cannot be empty'),
  body('eventDate').optional().isISO8601().withMessage('Valid event date is required'),
  body('eventTime').optional().trim().notEmpty().withMessage('Event time cannot be empty')
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

    const { eventId } = req.params;
    const { title, description, eventDate, eventTime, location, eventType, images } = req.body;

    const event = await Event.findOne({ 
      _id: eventId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can update (creator or admin)
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update events you created'
      });
    }

    // Update fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventDate) event.eventDate = eventDate;
    if (eventTime) event.eventTime = eventTime;
    if (location) event.location = location;
    if (eventType) event.eventType = eventType;
    if (images) event.images = images;

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});

// Delete event (only by creator or admin)
router.delete('/:eventId', authenticateToken, requireFamilyMember, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ 
      _id: eventId, 
      family: req.user.familyId, 
      isActive: true 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can delete (creator or admin)
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete events you created'
      });
    }

    event.isActive = false;
    await event.save();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
});

export default router;
