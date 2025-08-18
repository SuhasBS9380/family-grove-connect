// Mock API that simulates MongoDB backend operations using localStorage
import { User, Family, LoginResponse, RegisterRequest } from '@/services/authService';

interface MockDatabase {
  users: User[];
  families: Family[];
  posts: any[];
  messages: any[];
  events: any[];
  memories: any[];
}

// Initialize demo data
const initializeDatabase = (): MockDatabase => {
  const existingData = localStorage.getItem('familyGroveDB');
  if (existingData) {
    return JSON.parse(existingData);
  }

  // Create demo family
  const demoFamily: Family = {
    id: 'family_demo',
    name: 'Demo Family',
    description: 'Welcome to the Demo Family',
    familyCode: 'DEMO123',
    familyPicture: '',
    admin: {} as User, // Will be populated
    members: [],
    createdAt: new Date().toISOString()
  };

  // Create demo users
  const adminUser: User = {
    id: 'user_admin',
    mobile: '9380102924',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    familyId: 'family_demo',
    role: 'admin',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const memberUser: User = {
    id: 'user_member',
    mobile: '9380102925', 
    firstName: 'Family',
    lastName: 'Member',
    email: 'member@demo.com',
    familyId: 'family_demo',
    role: 'member',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  demoFamily.admin = adminUser;
  demoFamily.members = [
    { user: adminUser, joinedAt: new Date().toISOString(), relationship: 'Head' },
    { user: memberUser, joinedAt: new Date().toISOString(), relationship: 'Member' }
  ];

  const database: MockDatabase = {
    users: [adminUser, memberUser],
    families: [demoFamily],
    posts: [],
    messages: [],
    events: [],
    memories: []
  };

  localStorage.setItem('familyGroveDB', JSON.stringify(database));
  return database;
};

// Mock password storage (in real app, this would be hashed)
const passwords: Record<string, string> = {
  '9380102924': '123456',
  '9380102925': '123456'
};

class MockApiService {
  private db: MockDatabase;

  constructor() {
    this.db = initializeDatabase();
  }

  private saveDatabase() {
    localStorage.setItem('familyGroveDB', JSON.stringify(this.db));
  }

  private generateToken(userId: string, familyId: string): string {
    return btoa(JSON.stringify({ userId, familyId, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  }

  async login(mobile: string, password: string): Promise<LoginResponse> {
    const user = this.db.users.find(u => u.mobile === mobile);
    
    if (!user || passwords[mobile] !== password) {
      throw new Error('Invalid credentials');
    }

    const family = this.db.families.find(f => f.id === user.familyId);
    const token = this.generateToken(user.id, user.familyId!);

    return {
      success: true,
      message: 'Login successful',
      token,
      user,
      family
    };
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Check if user already exists
    if (this.db.users.find(u => u.mobile === data.mobile)) {
      throw new Error('User already exists');
    }

    const userId = `user_${Date.now()}`;
    const familyId = data.familyCode ? 
      this.db.families.find(f => f.familyCode === data.familyCode)?.id :
      `family_${Date.now()}`;

    if (!familyId) {
      throw new Error('Invalid family code');
    }

    const newUser: User = {
      id: userId,
      mobile: data.mobile,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      familyId,
      role: 'member',
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.db.users.push(newUser);
    passwords[data.mobile] = data.password;

    // Add to family
    const family = this.db.families.find(f => f.id === familyId);
    if (family) {
      family.members.push({
        user: newUser,
        joinedAt: new Date().toISOString(),
        relationship: 'Member'
      });
    }

    this.saveDatabase();
    const token = this.generateToken(userId, familyId);

    return {
      success: true,
      message: 'Registration successful',
      token,
      user: newUser,
      family
    };
  }

  async getProfile(token: string): Promise<{ success: boolean; user: User; family?: Family }> {
    try {
      const decoded = JSON.parse(atob(token));
      const user = this.db.users.find(u => u.id === decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const family = this.db.families.find(f => f.id === user.familyId);

      return {
        success: true,
        user,
        family
      };
    } catch {
      throw new Error('Invalid token');
    }
  }

  async updateProfile(token: string, data: Partial<User>): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const decoded = JSON.parse(atob(token));
      const userIndex = this.db.users.findIndex(u => u.id === decoded.userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      this.db.users[userIndex] = { ...this.db.users[userIndex], ...data };
      this.saveDatabase();

      return {
        success: true,
        message: 'Profile updated successfully',
        user: this.db.users[userIndex]
      };
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export const mockApiService = new MockApiService();