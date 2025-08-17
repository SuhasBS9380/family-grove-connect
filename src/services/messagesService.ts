import api from '../lib/api';
import { User } from './authService';

export interface Message {
  _id: string;
  sender: User;
  family: string;
  content: {
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
  };
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
  readBy: Array<{
    user: User;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: {
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
  };
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'file';
}

export const messagesService = {
  async getMessages(page = 1, limit = 50): Promise<{
    success: boolean;
    messages: Message[];
  }> {
    const response = await api.get(`/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  async sendMessage(data: SendMessageRequest): Promise<{
    success: boolean;
    message: string;
    data: Message;
  }> {
    const response = await api.post('/messages', data);
    return response.data;
  },

  async deleteMessage(messageId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  async getUnreadCount(): Promise<{
    success: boolean;
    unreadCount: number;
  }> {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
};
