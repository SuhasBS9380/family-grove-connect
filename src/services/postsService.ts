import api from '../lib/api';
import { User } from './authService';

export interface Post {
  _id: string;
  user: User;
  family: string;
  content: {
    text?: string;
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; caption?: string }>;
  };
  likes: Array<{ user: User; likedAt: string }>;
  comments: Array<{
    _id: string;
    user: User;
    text: string;
    createdAt: string;
  }>;
  privacy: 'public' | 'family' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: {
    text?: string;
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; caption?: string }>;
  };
  privacy?: 'public' | 'family' | 'private';
}

export const postsService = {
  async getPosts(page = 1, limit = 10): Promise<{
    success: boolean;
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasMore: boolean;
    };
  }> {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createPost(data: CreatePostRequest): Promise<{
    success: boolean;
    message: string;
    post: Post;
  }> {
    const response = await api.post('/posts', data);
    return response.data;
  },

  async likePost(postId: string): Promise<{
    success: boolean;
    message: string;
    likesCount: number;
    isLiked: boolean;
  }> {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  async addComment(postId: string, text: string): Promise<{
    success: boolean;
    message: string;
    comment: {
      _id: string;
      user: User;
      text: string;
      createdAt: string;
    };
  }> {
    const response = await api.post(`/posts/${postId}/comment`, { text });
    return response.data;
  },

  async deletePost(postId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  }
};
