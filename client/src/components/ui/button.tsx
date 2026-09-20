import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const buttonVariants = {
  variant: {
    default:
      'bg-zinc-100 text-zinc-900 border border-white/20 shadow-sm hover:bg-white hover:-translate-y-px active:scale-[0.98] transition-all duration-180',
    destructive:
      'bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm hover:bg-red-500/25 hover:-translate-y-px active:scale-[0.98] transition-all duration-180',
    outline:
      'border border-border/80 bg-card/60 text-foreground shadow-sm hover:bg-muted/80 hover:border-border hover:text-foreground hover:-translate-y-px active:scale-[0.98] transition-all duration-180',
    secondary:
      'bg-secondary/90 text-secondary-foreground border border-border/40 shadow-sm hover:bg-secondary hover:border-border/80 hover:-translate-y-px active:scale-[0.98] transition-all duration-180',
    ghost:
      'hover:bg-muted/60 text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all duration-180',
    link: 'text-foreground underline-offset-4 hover:underline'
  },
  size: {
    default: 'h-9 px-4 py-2 text-xs font-medium',
    sm: 'h-8 rounded-md px-3 text-xs font-medium',
    lg: 'h-10 rounded-md px-6 text-sm font-medium',
    icon: 'h-8 w-8 p-0 flex items-center justify-center'
  }
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const classes = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      className
    );

    return (
      <Comp
        className={classes}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
