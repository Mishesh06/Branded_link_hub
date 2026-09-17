import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, CheckCircle2, Menu, X } from 'lucide-react';
import { CreateLinkModal } from '@/components/links/CreateLinkModal';

export const DashboardLayout: React.FC = () => {
  const { user, refreshUser, simulatedVerificationToken, clearSimulatedToken } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-64 max-w-xs bg-card border-r border-border">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/40 bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-muted-foreground font-mono">WORKSPACE</span>
              <p className="text-sm font-semibold text-foreground">Production Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              className="text-xs shadow-sm"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Short Link
            </Button>
          </div>
        </header>

        {/* Email Verification Simulation Banner */}
        {user && !user.isEmailVerified && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
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
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Email successfully verified! Your account is now fully active.</span>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
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
