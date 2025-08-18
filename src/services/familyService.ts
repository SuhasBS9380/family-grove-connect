import api from '../lib/api';
import { User, Family } from './authService';

export const familyService = {
  async getFamily(): Promise<{
    success: boolean;
    family: Family;
  }> {
    const response = await api.get('/family');
    return response.data;
  },

  async updateFamily(data: { name?: string; description?: string }): Promise<{
    success: boolean;
    message: string;
    family: Family;
  }> {
    const response = await api.put('/family', data);
    return response.data;
  },

  async joinFamily(familyCode: string): Promise<{
    success: boolean;
    message: string;
    family: Family;
  }> {
    const response = await api.post('/family/join', { familyCode });
    return response.data;
  },

  async removeMember(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/family/member/${userId}`);
    return response.data;
  },

  async leaveFamily(): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.post('/family/leave', {});
    return response.data;
  }
};
