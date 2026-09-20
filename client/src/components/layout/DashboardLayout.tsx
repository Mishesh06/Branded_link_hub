import React, { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Plus, AlertCircle, CheckCircle2, Menu, X } from 'lucide-react';
import { CreateLinkModal } from '@/components/links/CreateLinkModal';

export const DashboardLayout: React.FC = () => {
  const { user, refreshUser, simulatedVerificationToken, clearSimulatedToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mainScrollY, setMainScrollY] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  const handleSimulateVerify = async () => {
    if (!simulatedVerificationToken) return;
    setIsVerifying(true);
    try {
      await authApi.verifyEmail(simulatedVerificationToken);
      setVerifySuccess(true);
      clearSimulatedToken();
      await refreshUser();
      setTimeout(() => setVerifySuccess(false), 4000);
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    setMainScrollY(e.currentTarget.scrollTop);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050607]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden transition-opacity duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-64 max-w-xs bg-[#0B0D11] border-r border-border/50 shadow-2xl transition-transform duration-200 ease-out">
            <div className="absolute top-3 right-3 z-30">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Subtle Dashboard Living Background (30–40% Intensity) */}
        <AnimatedBackground variant="dashboard" scrollY={mainScrollY} />

        {/* Top Navbar */}
        <header className="h-14 border-b border-border/40 bg-[#080A0D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-xs font-medium text-foreground tracking-tight">Production Hub</span>
              <span className="text-[10px] text-muted-foreground font-mono bg-secondary/80 px-1.5 py-0.5 rounded border border-border/40">
                v1.0
              </span>
            </div>
          </div>

          {/* Center search / quick jump */}
          <div className="hidden md:flex items-center w-72 lg:w-96">
            <div className="relative w-full">
              <Input
                placeholder="Search links, slugs, or destinations..."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val.trim()) {
                      navigate(`/dashboard/links?search=${encodeURIComponent(val.trim())}`);
                    }
                  }
                }}
                className="h-8 text-xs bg-secondary/35 border-border/60 pl-8 pr-12 focus-visible:bg-secondary/60 focus-visible:border-zinc-400/60 focus-visible:ring-1 focus-visible:ring-zinc-400/20 placeholder:text-muted-foreground/60 transition-all duration-180"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none text-xs">
                ⌕
              </span>
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-muted/40 px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground pointer-events-none">
                ↵
              </kbd>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              className="text-xs h-8 shadow-sm font-medium hover:-translate-y-px active:scale-[0.98] transition-all duration-180 hover:shadow-[0_2px_10px_rgba(255,255,255,0.08)]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Link
            </Button>
          </div>
        </header>

        {/* Email Verification Simulation Banner */}
        {user && !user.isEmailVerified && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 relative z-20">
            <div className="flex items-center space-x-2 truncate">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Email verification required.</strong> Your account is currently in unverified status.
              </span>
            </div>
            {simulatedVerificationToken ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateVerify}
                isLoading={isVerifying}
                className="text-xs h-7 border-amber-500/40 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300"
              >
                Simulate Verify Now
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground italic">Check inbox/logs</span>
            )}
          </div>
        )}

        {verifySuccess && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 relative z-20">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Email successfully verified! Your account is now fully active.</span>
          </div>
        )}

        {/* Dynamic Route Content with Smooth Route Page Transition */}
        <main
          ref={mainRef}
          onScroll={handleMainScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10"
        >
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Create Link Modal */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onLinkCreated={() => {
          // Trigger refresh event for child views
          window.dispatchEvent(new CustomEvent('linkCreated'));
        }}
      />
    </div>
  );
};
