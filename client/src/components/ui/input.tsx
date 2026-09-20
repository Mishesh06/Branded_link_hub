import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-border/70 bg-secondary/30 px-3 py-1 text-xs text-foreground shadow-sm transition-all duration-180 file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-zinc-400/70 focus-visible:bg-secondary/60 focus-visible:ring-1 focus-visible:ring-zinc-400/25 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive/80 focus-visible:ring-destructive/30',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
