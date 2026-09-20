import mongoose from 'mongoose';
import { Link } from '../models/Link';
import { ClickEvent } from '../models/ClickEvent';
import { AppError } from '../middleware/errorHandler';

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

export class AnalyticsService {
  static async getOverview(userId: string, days = 30): Promise<OverviewAnalytics> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format.', 400);
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Fetch user's links
    const userLinks = await Link.find({ userId: userObjectId, status: 'active' })
      .select('_id title shortCode originalUrl clickCount')
      .lean();

    const linkIds = userLinks.map((l) => l._id);
    const totalLinks = userLinks.length;
    const totalClicks = userLinks.reduce((sum, l) => sum + (l.clickCount || 0), 0);

    if (linkIds.length === 0) {
      return {
        summary: {
          totalLinks: 0,
          totalClicks: 0,
          clicksInPeriod: 0,
          avgClicksPerLink: 0
        },
        clicksOverTime: [],
        deviceDistribution: [],
        topReferrers: [],
        topLinks: []
      };
    }

    // 2. Aggregate clicks over time (group by day: YYYY-MM-DD)
    const clicksOverTimePipeline = [
      {
        $match: {
          linkId: { $in: linkIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 as const } }
    ];

    // 3. Aggregate device distribution
    const devicePipeline = [
      {
        $match: {
          linkId: { $in: linkIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 as const } }
    ];

    // 4. Aggregate top referrers
    const referrerPipeline = [
      {
        $match: {
          linkId: { $in: linkIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 as const } },
      { $limit: 10 }
    ];

    const [clicksOverTimeRaw, devicesRaw, referrersRaw] = await Promise.all([
      ClickEvent.aggregate(clicksOverTimePipeline),
      ClickEvent.aggregate(devicePipeline),
      ClickEvent.aggregate(referrerPipeline)
    ]);

    // Fill missing dates in time range so chart displays clean continuous line
    const dateMap = new Map<string, number>();
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    clicksOverTimeRaw.forEach((item: any) => {
      if (dateMap.has(item._id)) {
        dateMap.set(item._id, item.clicks);
      }
    });

    const clicksOverTime: TimeSeriesPoint[] = Array.from(dateMap.entries()).map(
      ([date, clicks]) => ({ date, clicks })
    );

    const clicksInPeriod = clicksOverTimeRaw.reduce((sum, item) => sum + item.clicks, 0);

    // Format devices with percentages
    const totalDeviceClicks = devicesRaw.reduce((sum, item) => sum + item.count, 0);
    const deviceDistribution: DeviceMetric[] = devicesRaw.map((item) => ({
      device: item._id || 'Unknown',
      count: item.count,
      percentage: totalDeviceClicks > 0 ? Math.round((item.count / totalDeviceClicks) * 100) : 0
    }));

    const topReferrers: ReferrerMetric[] = referrersRaw.map((item) => ({
      referrer: item._id || 'Direct',
      count: item.count
    }));

    // Top 5 links by click count
    const topLinks = [...userLinks]
      .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
      .slice(0, 5)
      .map((l) => ({
        _id: l._id.toString(),
        title: l.title || l.shortCode,
        shortCode: l.shortCode,
        originalUrl: l.originalUrl,
        clickCount: l.clickCount
      }));

    return {
      summary: {
        totalLinks,
        totalClicks,
        clicksInPeriod,
        avgClicksPerLink: totalLinks > 0 ? Math.round((totalClicks / totalLinks) * 10) / 10 : 0
      },
      clicksOverTime,
      deviceDistribution,
      topReferrers,
      topLinks
    };
  }

  static async getLinkAnalytics(
    userId: string,
    linkId: string,
    days = 30
  ): Promise<{
    link: any;
    clicksOverTime: TimeSeriesPoint[];
    deviceDistribution: DeviceMetric[];
    topReferrers: ReferrerMetric[];
    recentClicks: any[];
  }> {
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      throw new AppError('Invalid link ID format.', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format.', 400);
    }

    const linkObjectId = new mongoose.Types.ObjectId(linkId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const link = await Link.findOne({ _id: linkObjectId, userId: userObjectId });
    if (!link) {
      throw new AppError('Link not found or unauthorized access.', 404);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [clicksOverTimeRaw, devicesRaw, referrersRaw, recentClicks] = await Promise.all([
      ClickEvent.aggregate([
        { $match: { linkId: linkObjectId, timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      ClickEvent.aggregate([
        { $match: { linkId: linkObjectId, timestamp: { $gte: startDate } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ClickEvent.aggregate([
        { $match: { linkId: linkObjectId, timestamp: { $gte: startDate } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ClickEvent.find({ linkId: linkObjectId })
        .sort({ timestamp: -1 })
        .limit(20)
        .select('timestamp referrer deviceType')
        .lean()
    ]);

    const dateMap = new Map<string, number>();
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      dateMap.set(d.toISOString().split('T')[0], 0);
    }
    clicksOverTimeRaw.forEach((item: any) => {
      if (dateMap.has(item._id)) dateMap.set(item._id, item.clicks);
    });

    const clicksOverTime: TimeSeriesPoint[] = Array.from(dateMap.entries()).map(
      ([date, clicks]) => ({ date, clicks })
    );

    const totalDeviceClicks = devicesRaw.reduce((sum, item) => sum + item.count, 0);
    const deviceDistribution: DeviceMetric[] = devicesRaw.map((item) => ({
      device: item._id || 'Unknown',
      count: item.count,
      percentage: totalDeviceClicks > 0 ? Math.round((item.count / totalDeviceClicks) * 100) : 0
    }));

    const topReferrers: ReferrerMetric[] = referrersRaw.map((item) => ({
      referrer: item._id || 'Direct',
      count: item.count
    }));

    return {
      link,
      clicksOverTime,
      deviceDistribution,
      topReferrers,
      recentClicks
    };
  }
}
