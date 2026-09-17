import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  Link2,
  Zap,
  BarChart3,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login('demo@brandedhub.dev', 'DemoPassword123!');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border/40">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center">
            {/* Tag */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bitly + Linktree Hybrid Technical Assessment</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight sm:leading-none">
              High-Speed Short Links &amp; Curated Bio Studio
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create branded vanity URLs with microsecond 302 redirects, asynchronous click
              telemetry, and build customizable Link-in-Bio profile hubs.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-medium text-sm shadow-md">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDemoLogin}
                className="w-full sm:w-auto font-medium text-sm border-zinc-700 hover:bg-zinc-800/60"
              >
                Launch Demo Account
              </Button>
            </div>

            {/* Quick Demo Credentials Info */}
            <p className="mt-3 text-xs text-muted-foreground font-mono">
              Demo credentials: <span className="text-zinc-300">demo@brandedhub.dev</span> / <span className="text-zinc-300">DemoPassword123!</span>
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 sm:py-20 bg-muted/10 border-b border-border/40">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Engineered for Performance &amp; Defensibility
              </h2>
              <p className="text-xs text-muted-foreground mt-2">
                Built from the ground up to address all Project 04 MERN Stack requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="border-border/60 bg-card/80">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Sub-15ms 302 Redirection
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Indexed lookup returns an immediate 302 Found redirect while dispatching click
                    telemetry to an asynchronous background worker.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-border/60 bg-card/80">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Aggregated Telemetry
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    MongoDB aggregation pipelines compute time series clicks, top referrers, device
                    breakdowns, and salted SHA-256 privacy-preserving IP hashes.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-border/60 bg-card/80">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Link-in-Bio Studio
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Split-screen editor with real-time mobile preview. Switch between Minimal Light,
                    Dark Slate, and Gradient themes at /bio/:username.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Architecture Highlights */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-card/60 p-8 sm:p-10 space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <span>Security &amp; Architecture Standards</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pair-Token Auth:</strong> 15-minute access JWT with 7-day refresh tokens
                    stored strictly in httpOnly cookies.
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Token Family Rotation:</strong> Instant session revocation upon reuse
                    detection to protect against theft.
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rate Limiting:</strong> Tiered limits for creation, auth, and redirect routes
                    to prevent DoS and spam.
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Coss UI Standards:</strong> Clean, accessible primitives with zero AI
                    gimmicks, neon glows, or bloated templates.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>Branded Short-Link &amp; Bio-Link Hub — MERN Stack Assessment Submission</p>
      </footer>
    </div>
  );
};
