import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  LinkItem,
  Pagination,
  OverviewAnalytics,
  LinkAnalytics,
  BioProfile,
  UpdateBioInput
} from '@/types';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Auto refresh token interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/signup')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
  verifyEmail: async (token: string) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  }
};

export const linksApi = {
  getLinks: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ links: LinkItem[]; pagination: Pagination }> => {
    const res = await api.get('/links', { params });
    return res.data.data;
  },
  createLink: async (data: { originalUrl: string; customSlug?: string; title?: string }): Promise<{ link: LinkItem }> => {
    const res = await api.post('/links', data);
    return res.data.data;
  },
  getLinkById: async (id: string): Promise<{ link: LinkItem }> => {
    const res = await api.get(`/links/${id}`);
    return res.data.data;
  },
  deleteLink: async (id: string) => {
    const res = await api.delete(`/links/${id}`);
    return res.data;
  }
};

export const analyticsApi = {
  getOverview: async (days = 30): Promise<OverviewAnalytics> => {
    const res = await api.get('/analytics/overview', { params: { days } });
    return res.data.data;
  },
  getLinkAnalytics: async (id: string, days = 30): Promise<LinkAnalytics> => {
    const res = await api.get(`/analytics/link/${id}`, { params: { days } });
    return res.data.data;
  }
};

export const bioApi = {
  getMyProfile: async (): Promise<{ profile: BioProfile }> => {
    const res = await api.get('/bio/me');
    return res.data.data;
  },
  updateMyProfile: async (data: Partial<BioProfile>): Promise<{ profile: BioProfile }> => {
    const res = await api.put('/bio/me', data);
    return res.data.data;
  },
  getPublicProfile: async (username: string): Promise<{ profile: BioProfile; links: LinkItem[] }> => {
    const res = await api.get(`/bio/public/${username}`);
    return res.data.data;
  }
};
