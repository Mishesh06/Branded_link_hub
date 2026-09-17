import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4">
        <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-400">
          <Link2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">404 — Page Not Found</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The route you are trying to visit does not exist.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button size="sm" className="text-xs">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
