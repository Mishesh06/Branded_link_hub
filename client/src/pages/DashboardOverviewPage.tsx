import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsApi, linksApi } from '@/services/api';
import { OverviewAnalytics, LinkItem } from '@/types';
import { StatsCards } from '@/components/analytics/StatsCards';
import { ClicksChart } from '@/components/analytics/ClicksChart';
import { DeviceDistributionChart } from '@/components/analytics/DeviceDistributionChart';
import { ReferrersList } from '@/components/analytics/ReferrersList';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Copy, Check, ExternalLink, ArrowRight, Plus } from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<OverviewAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.getOverview(30);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();

    const handleCreated = () => fetchOverview();
    window.addEventListener('linkCreated', handleCreated);
    return () => window.removeEventListener('linkCreated', handleCreated);
  }, []);

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time link activity and 30-day performance telemetry.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            disabled={isLoading}
            className="text-xs h-8"
          >
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalLinks={analytics?.summary.totalLinks || 0}
        totalClicks={analytics?.summary.totalClicks || 0}
        clicksInPeriod={analytics?.summary.clicksInPeriod || 0}
        avgClicksPerLink={analytics?.summary.avgClicksPerLink || 0}
        days={30}
      />

      {/* Clicks Over Time Chart */}
      <ClicksChart
        data={analytics?.clicksOverTime || []}
        title="Telemetry Activity (Past 30 Days)"
        description="Daily 302 redirection click events across all active short links"
      />

      {/* Grid: Top Links + Device/Referrer Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Links */}
        <Card className="lg:col-span-2 border-border/60 bg-card/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Performing Links</CardTitle>
              <CardDescription className="text-xs">
                Links generating the highest engagement
              </CardDescription>
            </div>
            <Link to="/dashboard/links">
              <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground">
                View All Links
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!analytics?.topLinks || analytics.topLinks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <p>No short links found.</p>
                <p className="text-[11px] mt-1">
                  Create your first link to start tracking performance metrics.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {analytics.topLinks.map((link) => (
                  <div
                    key={link._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="truncate max-w-[220px] sm:max-w-md pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {link.title || link.shortCode}
                        </span>
                        <a
                          href={`/r/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-zinc-400 hover:text-white"
                        >
                          /r/{link.shortCode}
                        </a>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block font-mono">
                        {link.originalUrl}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {link.clickCount} clicks
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(link.shortCode, link._id)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Copy short URL"
                      >
                        {copiedId === link._id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Snapshot */}
        <div className="space-y-6">
          <DeviceDistributionChart data={analytics?.deviceDistribution || []} />
          <ReferrersList data={analytics?.topReferrers || []} />
        </div>
      </div>
    </div>
  );
};
