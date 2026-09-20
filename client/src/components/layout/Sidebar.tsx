import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { bioApi } from '@/services/api';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Sparkles,
  QrCode,
  Settings,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Links', href: '/dashboard/links', icon: Link2 },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Bio Page', href: '/dashboard/bio', icon: Sparkles },
  { label: 'QR Codes', href: '/dashboard/qr', icon: QrCode },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [bioUsername, setBioUsername] = useState<string>('');
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 0,
    opacity: 0
  });

  useEffect(() => {
    bioApi
      .getMyProfile()
      .then((res) => {
        if (res.profile?.username) {
          setBioUsername(res.profile.username);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => {
      if (item.exact) {
        return location.pathname === item.href;
      }
      return location.pathname.startsWith(item.href);
    });

    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const el = itemRefs.current[activeIndex];
      if (el) {
        setIndicatorStyle({
          top: el.offsetTop + 7,
          height: el.offsetHeight - 14,
          opacity: 1
        });
      }
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [location.pathname]);

  return (
    <aside className="w-64 border-r border-border/40 bg-[#0B0D11]/95 flex flex-col justify-between shrink-0 min-h-screen select-none relative z-20">
      <div>
        {/* Brand logo */}
        <div className="h-16 flex items-center px-6 border-b border-border/35">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 border border-zinc-700/80 text-white shadow-sm group-hover:border-zinc-500 transition-colors">
              <Link2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Branded<span className="text-zinc-500 font-normal">Hub</span>
            </span>
          </Link>
        </div>

        {/* Navigation list with shared vertical active indicator */}
        <div className="px-3 py-4 space-y-1 relative">
          {/* Shared Animated Active Vertical Indicator */}
          <div
            className="absolute left-[15px] w-[2px] rounded-full bg-zinc-300 shadow-[0_0_6px_rgba(255,255,255,0.35)] pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
            style={{
              top: `${indicatorStyle.top}px`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity
            }}
            aria-hidden="true"
          />

          {navItems.map((item, idx) => (
            <NavLink
              key={item.href}
              ref={(el) => (itemRefs.current[idx] = el)}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'nav-light-sweep group flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-180 relative border',
                  isActive
                    ? 'bg-white/[0.055] text-white font-semibold border-white/[0.07] shadow-[0_1px_8px_rgba(0,0,0,0.3)]'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.025] hover:border-white/[0.05]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-all duration-180 group-hover:translate-x-[1px]',
                      isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-zinc-300 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Public Bio Quick Link */}
        {bioUsername && (
          <div className="px-3 pt-2">
            <a
              href={`/bio/${bioUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-border/80 transition-colors text-xs text-muted-foreground hover:text-foreground group"
            >
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block font-mono">
                  Public Page
                </span>
                <span className="font-mono text-zinc-300 text-[11px]">/bio/{bioUsername}</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-2 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </a>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-border/35">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <Avatar className="h-8 w-8 border border-border/60">
              <AvatarImage src="" />
              <AvatarFallback className="text-[11px] font-semibold bg-zinc-800 text-zinc-200">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="truncate text-left">
              <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
