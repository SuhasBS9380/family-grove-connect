import { mockApiService } from './mockApi';

// Mock API client that simulates axios requests using localStorage
const api = {
  async post(url: string, data: any) {
    try {
      let result;
      
      if (url === '/auth/login') {
        result = await mockApiService.login(data.mobile, data.password);
      } else if (url === '/auth/register') {
        result = await mockApiService.register(data);
      } else {
        throw new Error(`Endpoint ${url} not implemented`);
      }

      return { data: result };
    } catch (error: any) {
      throw {
        response: {
          data: {
            success: false,
            message: error.message
          }
        }
      };
    }
  },

  async get(url: string) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      let result;
      
      if (url === '/auth/profile') {
        result = await mockApiService.getProfile(token);
      } else {
        throw new Error(`Endpoint ${url} not implemented`);
      }

      return { data: result };
    } catch (error: any) {
      throw {
        response: {
          data: {
            success: false,
            message: error.message
          },
          status: 401
        }
      };
    }
  },

  async put(url: string, data?: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      let result;
      
      if (url === '/auth/profile') {
        result = await mockApiService.updateProfile(token, data);
      } else {
        throw new Error(`Endpoint ${url} not implemented`);
      }

      return { data: result };
    } catch (error: any) {
      throw {
        response: {
          data: {
            success: false,
            message: error.message
          },
          status: 401
        }
      };
    }
  },

  async delete(url: string) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      // Mock delete operations
      return { 
        data: { 
          success: true, 
          message: 'Delete operation successful' 
        } 
      };
    } catch (error: any) {
      throw {
        response: {
          data: {
            success: false,
            message: error.message
          },
          status: 401
        }
      };
    }
  }
};

export default api;
