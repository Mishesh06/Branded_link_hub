import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  variant?: 'landing' | 'dashboard';
  scrollY?: number;
  className?: string;
  enableSpotlight?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'landing',
  scrollY = 0,
  className,
  enableSpotlight = true
}) => {
  const isDashboard = variant === 'dashboard';
  const intensity = isDashboard ? 0.35 : 1.0;

  // Desktop smooth cursor spotlight
  const [isDesktop, setIsDesktop] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000 });
  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Check if device has fine pointer (desktop mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsDesktop(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    if (!enableSpotlight || isDashboard) {
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth lerp loop for cursor spotlight
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08);

      setSpotlightPos({
        x: Math.round(currentPos.current.x),
        y: Math.round(currentPos.current.y)
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enableSpotlight, isDashboard]);

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden select-none z-0',
        className
      )}
      aria-hidden="true"
      data-living-bg={variant}
    >
      {/* Base Layer: Obsidian Deep Graphite */}
      <div className="absolute inset-0 bg-[#050607]" />

      {/* Layer 1: Flowing Organic Light Fields (Asynchronous Slow Drifts) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary soft graphite/silver field with subtle muted emerald hint */}
        <div
          className="living-bg-drift-a absolute top-[-5%] left-1/2 -translate-x-1/2 w-[850px] sm:w-[1100px] h-[480px] sm:h-[600px]"
          style={{
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
            background: isDashboard
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.016) 0%, rgba(161, 161, 170, 0.005) 50%, transparent 72%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(200, 205, 215, 0.015) 38%, rgba(16, 185, 129, 0.006) 55%, transparent 72%)',
            filter: 'blur(90px)',
            transform: `translate3d(calc(-50% + ${Math.min(scrollY * 0.06, 35)}px), ${Math.min(scrollY * 0.12, 60)}px, 0)`,
            transition: 'transform 0.15s ease-out'
          }}
        />

        {/* Secondary cross-flowing dark slate field */}
        <div
          className="living-bg-drift-b absolute top-[30%] left-1/2 -translate-x-1/2 w-[750px] sm:w-[950px] h-[420px] sm:h-[520px]"
          style={{
            borderRadius: '40% 60% 30% 70% / 60% 40% 70% 30%',
            background: isDashboard
              ? 'radial-gradient(circle, rgba(212, 212, 216, 0.012) 0%, rgba(113, 113, 122, 0.004) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(161, 161, 170, 0.024) 0%, rgba(113, 113, 122, 0.008) 45%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: isDashboard ? 0.5 : Math.min(0.7 + scrollY * 0.0006, 1),
            transform: `translate3d(calc(-50% - ${Math.min(scrollY * 0.08, 45)}px), ${Math.min(scrollY * 0.18, 80)}px, 0)`,
            transition: 'transform 0.15s ease-out, opacity 0.2s ease-out'
          }}
        />

        {/* Third deep wave field for continuous shader-like motion */}
        <div
          className="living-bg-drift-c absolute top-[60%] left-1/2 -translate-x-1/2 w-[900px] sm:w-[1150px] h-[380px] sm:h-[480px]"
          style={{
            borderRadius: '50% 50% 40% 60% / 40% 50% 60% 50%',
            background: isDashboard
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.01) 0%, transparent 65%)'
              : 'radial-gradient(circle, rgba(212, 212, 216, 0.018) 0%, rgba(82, 82, 91, 0.007) 48%, transparent 70%)',
            filter: 'blur(110px)',
            transform: `translate3d(calc(-50% + ${Math.min(scrollY * 0.04, 25)}px), ${Math.min(scrollY * 0.22, 95)}px, 0)`,
            transition: 'transform 0.15s ease-out'
          }}
        />
      </div>

      {/* Layer 2: Organic Flowing Curved Paths / Waves */}
      <div
        className="living-bg-wave-a absolute inset-0 opacity-[0.55]"
        style={{
          opacity: isDashboard ? 0.2 : 0.55,
          transform: `translate3d(0, ${Math.min(scrollY * 0.05, 30)}px, 0)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="wave-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          {/* Wave 1: Soft top sweeping curve */}
          <path
            d="M-100 180 C 300 240, 700 80, 1100 200 C 1300 260, 1500 160, 1600 180"
            stroke="rgba(255, 255, 255, 0.022)"
            strokeWidth="1.5"
            filter="url(#wave-soft-blur)"
          />
          {/* Wave 2: Organic hero mid-undulation */}
          <path
            d="M-50 360 C 250 280, 600 420, 950 320 C 1250 240, 1450 380, 1550 340"
            stroke="rgba(200, 205, 215, 0.02)"
            strokeWidth="1.25"
            filter="url(#wave-soft-blur)"
          />
          {/* Wave 3: Subtle diagonal depth wave */}
          <path
            d="M-100 560 C 350 620, 800 480, 1200 580 C 1400 630, 1550 540, 1600 560"
            stroke="rgba(161, 161, 170, 0.018)"
            strokeWidth="1.2"
            filter="url(#wave-soft-blur)"
          />
          {/* Wave 4: Subtle lower transition path */}
          <path
            d="M0 760 C 400 700, 850 820, 1300 720 C 1450 690, 1550 740, 1600 730"
            stroke="rgba(255, 255, 255, 0.015)"
            strokeWidth="1"
            filter="url(#wave-soft-blur)"
          />
        </svg>
      </div>

      {/* Layer 2.5: Optional Faint Micro-Grid with Radial Fade Mask */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDashboard ? 0.015 : 0.025,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)'
        }}
      />

      {/* Desktop Cursor Spotlight: Very Soft, High-Radius Interactive Light */}
      {isDesktop && enableSpotlight && !isDashboard && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '550px',
            height: '550px',
            left: `${spotlightPos.x - 275}px`,
            top: `${spotlightPos.y - 275}px`,
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.035) 0%, rgba(200, 205, 215, 0.012) 40%, transparent 70%)',
            filter: 'blur(120px)',
            willChange: 'left, top',
            opacity: spotlightPos.x < 0 ? 0 : 1,
            transition: 'opacity 0.4s ease-out'
          }}
        />
      )}

      {/* Layer 3: Subtle Noise / Film Grain (Inline SVG feTurbulence) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: 0.02,
          mixBlendMode: 'overlay'
        }}
        aria-hidden="true"
      >
        <filter id="living-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#living-grain-filter)" />
      </svg>

      {/* Layer 4: Vignette Layer (Darkening Edges to Frame Content) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDashboard
            ? 'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 45%, rgba(5, 6, 7, 0.4) 85%, rgba(5, 6, 7, 0.9) 100%)'
            : 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 35%, rgba(5, 6, 7, 0.5) 80%, rgba(5, 6, 7, 0.95) 100%)'
        }}
      />
    </div>
  );
};
