import React from 'react';
import { ReferrerMetric } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Compass, ExternalLink } from 'lucide-react';

interface ReferrersListProps {
  data: ReferrerMetric[];
}

export const ReferrersList: React.FC<ReferrersListProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Traffic Referrers</CardTitle>
        <CardDescription className="text-xs">
          Origins where clicks originated from
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 || total === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            No referrer data recorded yet.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {data.map((item, idx) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate max-w-[200px] sm:max-w-none">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-mono text-muted-foreground">
                      {idx + 1}
                    </span>
                    <Compass className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="font-mono text-foreground truncate">{item.referrer}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-muted-foreground shrink-0">
                    <span className="font-medium text-foreground">{item.count}</span>
                    <span className="text-[11px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
