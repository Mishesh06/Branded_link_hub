import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, MousePointerClick, TrendingUp, Activity } from 'lucide-react';

interface StatsCardsProps {
  totalLinks: number;
  totalClicks: number;
  clicksInPeriod: number;
  avgClicksPerLink: number;
  days: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalLinks,
  totalClicks,
  clicksInPeriod,
  avgClicksPerLink,
  days
}) => {
  const stats = [
    {
      label: 'Total Links',
      value: totalLinks.toLocaleString(),
      subtext: 'Active short links in hub',
      icon: Link2
    },
    {
      label: 'Lifetime Clicks',
      value: totalClicks.toLocaleString(),
      subtext: 'Across all active links',
      icon: MousePointerClick
    },
    {
      label: `Clicks (Past ${days}d)`,
      value: clicksInPeriod.toLocaleString(),
      subtext: 'Recorded telemetry events',
      icon: TrendingUp
    },
    {
      label: 'Avg. Clicks / Link',
      value: avgClicksPerLink.toFixed(1),
      subtext: 'Engagement metric',
      icon: Activity
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-border/60 bg-card/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1 font-mono">
                {stat.value}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.subtext}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50 text-muted-foreground border border-border/40">
              <stat.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
