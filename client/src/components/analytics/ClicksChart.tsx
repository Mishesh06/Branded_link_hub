import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TimeSeriesPoint } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface ClicksChartProps {
  data: TimeSeriesPoint[];
  title?: string;
  description?: string;
}

export const ClicksChart: React.FC<ClicksChartProps> = ({
  data,
  title = 'Clicks Over Time',
  description = 'Daily redirection telemetry activity'
}) => {
  const formattedData = data.map((d) => {
    const parts = d.date.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return {
      rawDate: d.date,
      displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: d.clicks
    };
  });

  const total = data.reduce((acc, curr) => acc + curr.clicks, 0);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Period Total</span>
          <span className="font-mono text-base font-semibold text-foreground">{total} clicks</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
            No click data recorded for this time window.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-md backdrop-blur-sm text-xs">
                          <p className="font-medium text-foreground">{item.rawDate}</p>
                          <p className="font-mono text-indigo-400 font-semibold mt-0.5">
                            {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#clicksGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
