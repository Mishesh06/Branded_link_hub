import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { bioApi } from '@/services/api';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Sparkles,
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
  { label: 'Bio Builder', href: '/dashboard/bio', icon: Sparkles },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [bioUsername, setBioUsername] = useState<string>('');

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

  return (
    <aside className="w-64 border-r border-border/40 bg-card/60 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand logo */}
        <div className="h-16 flex items-center px-6 border-b border-border/30">
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 border border-zinc-700 text-white">
              <Link2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Branded<span className="text-zinc-500">Hub</span>
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors select-none',
                  isActive
                    ? 'bg-zinc-800/70 text-white font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Public Bio Quick Link */}
        {bioUsername && (
          <div className="px-4 py-2">
            <a
              href={`/bio/${bioUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs text-muted-foreground hover:text-foreground"
            >
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block">Public Page</span>
                <span className="font-mono text-zinc-300">/bio/{bioUsername}</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-2" />
            </a>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>{user?.name?.slice(0, 2) || 'US'}</AvatarFallback>
            </Avatar>
            <div className="truncate text-left">
              <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
