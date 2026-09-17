import React from 'react';
import { DeviceMetric } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet, HelpCircle } from 'lucide-react';

interface DeviceDistributionChartProps {
  data: DeviceMetric[];
}

export const DeviceDistributionChart: React.FC<DeviceDistributionChartProps> = ({ data }) => {
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <Monitor className="h-4 w-4 text-sky-400" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-indigo-400" />;
      default:
        return <HelpCircle className="h-4 w-4 text-zinc-400" />;
    }
  };

  const totalClicks = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Device Breakdown</CardTitle>
        <CardDescription className="text-xs">
          Client classification parsed from User-Agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 || totalClicks === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            No device telemetry data available.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {data.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(item.device)}
                    <span className="font-medium text-foreground">{item.device}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-muted-foreground">
                    <span>{item.count} clicks</span>
                    <span className="font-semibold text-foreground">({item.percentage}%)</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.device === 'Desktop'
                        ? 'bg-sky-500'
                        : item.device === 'Mobile'
                        ? 'bg-emerald-500'
                        : item.device === 'Tablet'
                        ? 'bg-indigo-500'
                        : 'bg-zinc-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
