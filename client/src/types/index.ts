export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LinkItem {
  _id: string;
  userId: string;
  title: string;
  originalUrl: string;
  shortCode: string;
  isCustomSlug: boolean;
  clickCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
}

export interface DeviceMetric {
  device: string;
  count: number;
  percentage: number;
}

export interface ReferrerMetric {
  referrer: string;
  count: number;
}

export interface OverviewAnalytics {
  summary: {
    totalLinks: number;
    totalClicks: number;
    clicksInPeriod: number;
    avgClicksPerLink: number;
  };
  clicksOverTime: TimeSeriesPoint[];
  deviceDistribution: DeviceMetric[];
  topReferrers: ReferrerMetric[];
  topLinks: Array<{
    _id: string;
    title: string;
    shortCode: string;
    originalUrl: string;
    clickCount: number;
  }>;
}

export interface LinkAnalytics {
  link: LinkItem;
  clicksOverTime: TimeSeriesPoint[];
  deviceDistribution: DeviceMetric[];
  topReferrers: ReferrerMetric[];
  recentClicks: Array<{
    timestamp: string;
    referrer: string;
    deviceType: string;
  }>;
}

export interface SocialLink {
  platform: string;
  url: string;
  title: string;
  isEnabled: boolean;
}

export type BioTheme = 'minimal-light' | 'dark-slate' | 'gradient' | 'midnight-aurora' | 'paper-studio';

export interface BioProfile {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  theme: BioTheme;
  socialLinks: SocialLink[];
  showcaseLinkIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type UpdateBioInput = Partial<BioProfile>;
