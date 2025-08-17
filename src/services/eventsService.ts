import api from '../lib/api';
import { User } from './authService';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventTime: string;
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdBy: User;
  family: string;
  attendees: Array<{
    user: User;
    status: 'going' | 'maybe' | 'not_going' | 'pending';
    respondedAt?: string;
  }>;
  eventType: 'birthday' | 'anniversary' | 'reunion' | 'celebration' | 'meeting' | 'other';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  eventTime: string;
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  eventType?: 'birthday' | 'anniversary' | 'reunion' | 'celebration' | 'meeting' | 'other';
  images?: string[];
}

export const eventsService = {
  async getEvents(upcoming = true): Promise<{
    success: boolean;
    events: Event[];
  }> {
    const response = await api.get(`/events?upcoming=${upcoming}`);
    return response.data;
  },

  async createEvent(data: CreateEventRequest): Promise<{
    success: boolean;
    message: string;
    event: Event;
  }> {
    const response = await api.post('/events', data);
    return response.data;
  },

  async rsvpEvent(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<{
    success: boolean;
    message: string;
    status: string;
  }> {
    const response = await api.post(`/events/${eventId}/rsvp`, { status });
    return response.data;
  },

  async getEvent(eventId: string): Promise<{
    success: boolean;
    event: Event;
  }> {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  async updateEvent(eventId: string, data: Partial<CreateEventRequest>): Promise<{
    success: boolean;
    message: string;
    event: Event;
  }> {
    const response = await api.put(`/events/${eventId}`, data);
    return response.data;
  },

  async deleteEvent(eventId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  }
};
