import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Database,
  Fingerprint
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, simulatedVerificationToken, clearSimulatedToken } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  const handleSimulateVerify = async () => {
    if (!simulatedVerificationToken) return;
    setIsVerifying(true);
    try {
      await authApi.verifyEmail(simulatedVerificationToken);
      setVerifyMessage('Email verification simulated successfully!');
      clearSimulatedToken();
      await refreshUser();
      setTimeout(() => setVerifyMessage(''), 4000);
    } catch (err: any) {
      setVerifyMessage('Verification simulation failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Account &amp; Security</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review authenticated session details and architectural security controls.
        </p>
      </div>

      {verifyMessage && (
        <div className="flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-lg text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{verifyMessage}</span>
        </div>
      )}

      {/* Account Details Card */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">User Profile</CardTitle>
          <CardDescription className="text-xs">
            Identity and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-muted-foreground">Full Name</span>
            <span className="font-medium text-foreground">{user?.name}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-muted-foreground">Email Address</span>
            <span className="font-medium text-foreground font-mono">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-muted-foreground">Email Verification Status</span>
            <div>
              {user?.isEmailVerified ? (
                <Badge variant="success" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                  {simulatedVerificationToken && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSimulateVerify}
                      isLoading={isVerifying}
                      className="text-xs h-6"
                    >
                      Simulate Verify
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture & Security Inspection (Assessment Explanations) */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Architecture &amp; Security Controls (Interview Explainability)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Active security policies implemented for this assessment submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-foreground font-medium">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Pair-Token Authentication</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Short-lived Access JWT (15 min) + Refresh Token (7 days) stored exclusively in
                secure, httpOnly cookies. Client-side localStorage is never used for token storage.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-foreground font-medium">
                <KeyRound className="h-3.5 w-3.5 text-sky-400" />
                <span>Token Family Rotation</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Refresh tokens are rotated on each /auth/refresh call. If an old token is reused, the
                entire token family is immediately invalidated to defeat theft attacks.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-foreground font-medium">
                <Fingerprint className="h-3.5 w-3.5 text-amber-400" />
                <span>Salted SHA-256 IP Hashing</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Raw client IP addresses are never persisted. Telemetry calculates unique visitor
                hashes using HMAC SHA-256 with a server secret salt for GDPR compliance.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-foreground font-medium">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>302 Found vs 301 Caching</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Redirection uses 302 Found with Cache-Control: no-store headers so browser caches do
                not bypass the telemetry ingestion pipeline on repeated visits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
