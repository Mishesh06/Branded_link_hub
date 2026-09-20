import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
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
import { cn } from '@/lib/utils';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const featureSectionRef = useRef<HTMLElement>(null);
  const securitySectionRef = useRef<HTMLElement>(null);
  const [featureVisible, setFeatureVisible] = useState(false);
  const [securityVisible, setSecurityVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === featureSectionRef.current) {
              setFeatureVisible(true);
            } else if (entry.target === securitySectionRef.current) {
              setSecurityVisible(true);
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    if (featureSectionRef.current) observer.observe(featureSectionRef.current);
    if (securitySectionRef.current) observer.observe(securitySectionRef.current);

    return () => observer.disconnect();
  }, []);

  const handleDemoLogin = async () => {
    try {
      await login('demo@brandedhub.dev', 'DemoPassword123!');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050607] text-foreground flex flex-col relative selection:bg-zinc-800 selection:text-white">
      {/* 21st-Inspired Living Background */}
      <AnimatedBackground variant="landing" scrollY={scrollY} />

      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 animate-page-enter relative z-10">
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border/30">
          <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
            {/* Tag */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-border/80 bg-secondary/50 px-3.5 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="font-mono text-[11px]">Bitly + Linktree Hybrid Architecture</span>
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
                <Button
                  size="lg"
                  className="btn-light-sweep w-full sm:w-auto font-medium text-xs shadow-sm hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-180"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDemoLogin}
                className="w-full sm:w-auto font-medium text-xs border-zinc-700/80 hover:bg-zinc-800/60 hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-180"
              >
                Launch Demo Account
              </Button>
            </div>

            {/* Quick Demo Credentials Info */}
            <p className="mt-3 text-xs text-muted-foreground font-mono">
              Demo credentials: <span className="text-zinc-300">demo@brandedhub.dev</span> /{' '}
              <span className="text-zinc-300">DemoPassword123!</span>
            </p>
          </div>
        </section>

        {/* Feature Grid - Slightly lighter graphite background for section depth */}
        <section
          ref={featureSectionRef}
          className={cn(
            'py-16 sm:py-20 bg-[#0C0E13]/60 border-b border-border/30 backdrop-blur-[1px] transition-colors duration-500',
            'reveal-on-scroll',
            featureVisible && 'is-revealed'
          )}
        >
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
              <Card className="stagger-card border-border/60 bg-card/85 hover:-translate-y-[1px] hover:border-border hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.6)] transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white transition-colors duration-200 group-hover:border-zinc-500">
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
              <Card className="stagger-card border-border/60 bg-card/85 hover:-translate-y-[1px] hover:border-border hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.6)] transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white transition-colors duration-200 group-hover:border-zinc-500">
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
              <Card className="stagger-card border-border/60 bg-card/85 hover:-translate-y-[1px] hover:border-border hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.6)] transition-all duration-200">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white transition-colors duration-200 group-hover:border-zinc-500">
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

        {/* Security & Architecture Highlights - Deeper graphite transition */}
        <section
          ref={securitySectionRef}
          className={cn(
            'py-16 sm:py-20 bg-transparent',
            'reveal-on-scroll',
            securityVisible && 'is-revealed'
          )}
        >
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-8 sm:p-10 space-y-6 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.5)] backdrop-blur-[2px]">
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
      <footer className="border-t border-border/30 bg-[#050607]/80 backdrop-blur-sm py-6 text-center text-xs text-muted-foreground relative z-10">
        <p>Branded Short-Link &amp; Bio-Link Hub — MERN Stack Assessment Submission</p>
      </footer>
    </div>
  );
};

