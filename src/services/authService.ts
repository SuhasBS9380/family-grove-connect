import api from '../lib/api';

export interface User {
  id: string;
  mobile: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profilePicture?: string;
  familyId?: string;
  role: 'admin' | 'member';
  lastSeen: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  familyCode: string;
  familyPicture?: string;
  admin: User;
  members: Array<{
    user: User;
    joinedAt: string;
    relationship?: string;
  }>;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  family?: Family;
}

export interface RegisterRequest {
  mobile: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  createFamily?: boolean;
  familyCode?: string;
}

export const authService = {
  async login(mobile: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { mobile, password });
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userMobile', mobile);
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userMobile', data.mobile);
    }
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; user: User; family?: Family }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; user: User }> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userMobile');
  }
};
