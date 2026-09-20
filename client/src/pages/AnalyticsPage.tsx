import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { analyticsApi, linksApi } from '@/services/api';
import { OverviewAnalytics, LinkAnalytics, LinkItem } from '@/types';
import { ClicksChart } from '@/components/analytics/ClicksChart';
import { DeviceDistributionChart } from '@/components/analytics/DeviceDistributionChart';
import { ReferrersList } from '@/components/analytics/ReferrersList';
import { StatsCards } from '@/components/analytics/StatsCards';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, Monitor, Smartphone, Tablet, HelpCircle } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkId = searchParams.get('linkId');

  const [days, setDays] = useState<number>(30);
  const [overviewData, setOverviewData] = useState<OverviewAnalytics | null>(null);
  const [linkData, setLinkData] = useState<LinkAnalytics | null>(null);
  const [userLinks, setUserLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch available links for selector dropdown
  useEffect(() => {
    linksApi
      .getLinks({ page: 1, limit: 50 })
      .then((res) => setUserLinks(res.links))
      .catch((err) => console.error('Error fetching links list:', err));
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (linkId) {
        const data = await analyticsApi.getLinkAnalytics(linkId, days);
        setLinkData(data);
        setOverviewData(null);
      } else {
        const data = await analyticsApi.getOverview(days);
        setOverviewData(data);
        setLinkData(null);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [linkId, days]);

  const handleLinkSelect = (id: string) => {
    if (id === 'all') {
      searchParams.delete('linkId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ linkId: id });
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'desktop':
        return <Monitor className="h-3.5 w-3.5 text-sky-400" />;
      case 'mobile':
        return <Smartphone className="h-3.5 w-3.5 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="h-3.5 w-3.5 text-indigo-400" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-page-enter">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {linkId && (
            <button
              onClick={() => handleLinkSelect('all')}
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to account overview
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {linkId && linkData ? (
              <span>Analytics for /r/{linkData.link?.shortCode}</span>
            ) : (
              <span>Telemetry &amp; Analytics Hub</span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {linkId && linkData
              ? `Destination: ${linkData.link?.originalUrl}`
              : 'Aggregated click intelligence and visitor distribution'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Link Drill-down Selector */}
          <select
            value={linkId || 'all'}
            onChange={(e) => handleLinkSelect(e.target.value)}
            className="h-8 rounded-md border border-border/70 bg-secondary/50 px-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
          >
            <option value="all">All Links (Account Overview)</option>
            {userLinks.map((l) => (
              <option key={l._id} value={l._id}>
                /r/{l.shortCode} - {l.title || l.originalUrl.slice(0, 25)}
              </option>
            ))}
          </select>

          {/* Time range pills */}
          <div className="flex items-center space-x-1 bg-secondary/60 border border-border/50 p-0.5 rounded-md text-xs">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-150 cursor-pointer ${
                  days === d
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards (when overview) */}
      {!linkId && overviewData && (
        <StatsCards
          totalLinks={overviewData.summary.totalLinks}
          totalClicks={overviewData.summary.totalClicks}
          clicksInPeriod={overviewData.summary.clicksInPeriod}
          avgClicksPerLink={overviewData.summary.avgClicksPerLink}
          days={days}
        />
      )}

      {/* Clicks Time-Series Chart */}
      <ClicksChart
        data={linkData ? linkData.clicksOverTime : overviewData?.clicksOverTime || []}
        title={`Telemetry Clicks (Past ${days} Days)`}
        description={
          linkId
            ? `Daily click telemetry recorded for /r/${linkData?.link?.shortCode}`
            : 'Aggregated daily redirects across your short link library'
        }
      />

      {/* Device & Referrer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DeviceDistributionChart
          data={linkData ? linkData.deviceDistribution : overviewData?.deviceDistribution || []}
        />
        <ReferrersList
          data={linkData ? linkData.topReferrers : overviewData?.topReferrers || []}
        />
      </div>

      {/* Recent Clicks Telemetry Table (When drilling into a single link) */}
      {linkId && linkData && (
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Telemetry Events</CardTitle>
            <CardDescription className="text-xs">
              Last 20 asynchronous click events recorded for this link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linkData.recentClicks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No clicks recorded for this link yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-left">
                      <th className="py-2 px-3 font-medium">Timestamp</th>
                      <th className="py-2 px-3 font-medium">Device</th>
                      <th className="py-2 px-3 font-medium">Referrer Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {linkData.recentClicks.map((click, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="py-2 px-3 font-mono text-muted-foreground">
                          {formatDateTime(click.timestamp)}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-1.5">
                            {getDeviceIcon(click.deviceType)}
                            <span className="font-medium text-foreground">{click.deviceType}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono text-zinc-300">
                          {click.referrer || 'Direct'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
