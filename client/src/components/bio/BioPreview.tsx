import React from 'react';
import { BioProfile, LinkItem, BioTheme } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Globe,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ExternalLink
} from 'lucide-react';

interface BioPreviewProps {
  profile: Partial<BioProfile>;
  links: LinkItem[];
}

export const getThemeStyles = (theme?: BioTheme) => {
  switch (theme) {
    case 'minimal-light':
      return {
        container: 'bg-white text-zinc-900',
        textMuted: 'text-zinc-500',
        linkButton: 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm',
        socialBadge: 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 border-zinc-200',
        handle: 'text-zinc-500 bg-zinc-100'
      };
    case 'gradient':
      return {
        container: 'bg-gradient-to-b from-zinc-900 via-indigo-950 to-zinc-950 text-white',
        textMuted: 'text-indigo-200/70',
        linkButton:
          'bg-white/10 hover:bg-white/15 text-white border-white/15 backdrop-blur-md shadow-md',
        socialBadge: 'bg-white/10 text-white hover:bg-white/20 border-white/15',
        handle: 'text-indigo-300 bg-indigo-950/60 border border-indigo-500/30'
      };
    case 'dark-slate':
    default:
      return {
        container: 'bg-zinc-950 text-zinc-100',
        textMuted: 'text-zinc-400',
        linkButton: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-800 shadow-sm',
        socialBadge: 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800',
        handle: 'text-zinc-400 bg-zinc-900 border border-zinc-800'
      };
  }
};

export const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return <Github className="h-4 w-4" />;
  if (p.includes('twitter') || p.includes('x')) return <Twitter className="h-4 w-4" />;
  if (p.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
  if (p.includes('youtube')) return <Youtube className="h-4 w-4" />;
  if (p.includes('instagram')) return <Instagram className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

export const BioPreview: React.FC<BioPreviewProps> = ({ profile, links }) => {
  const styles = getThemeStyles(profile.theme);
  const activeSocials = (profile.socialLinks || []).filter((s) => s.isEnabled);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Mobile Device Mockup Frame */}
      <div className="w-[310px] sm:w-[330px] rounded-[2.5rem] border-[6px] border-zinc-800 bg-zinc-950 shadow-2xl p-3 relative overflow-hidden">
        {/* Device camera notch */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 h-4 w-24 bg-zinc-800 rounded-full z-20 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-zinc-900 mr-2" />
          <div className="h-1.5 w-1.5 rounded-full bg-blue-900/60" />
        </div>

        {/* Screen container */}
        <div
          className={`w-full min-h-[540px] max-h-[580px] overflow-y-auto rounded-[2rem] p-5 pt-8 flex flex-col items-center text-center transition-all duration-300 ${styles.container}`}
        >
          {/* Avatar */}
          <Avatar className="h-20 w-20 border-2 border-border/80 shadow-md mb-3">
            <AvatarImage src={profile.avatarUrl || ''} alt={profile.displayName} />
            <AvatarFallback className="text-base font-bold">
              {profile.displayName ? profile.displayName.slice(0, 2).toUpperCase() : 'ME'}
            </AvatarFallback>
          </Avatar>

          {/* Display Name */}
          <h2 className="text-base font-bold tracking-tight">
            {profile.displayName || 'Your Name'}
          </h2>

          {/* Username tag */}
          {profile.username && (
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full mt-1 ${styles.handle}`}>
              @{profile.username}
            </span>
          )}

          {/* Bio text */}
          <p className={`text-xs mt-2.5 max-w-[240px] leading-relaxed ${styles.textMuted}`}>
            {profile.bio || 'Your bio will appear here. Add a short bio to introduce yourself.'}
          </p>

          {/* Social Links Icons Bar */}
          {activeSocials.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
              {activeSocials.map((soc, i) => (
                <a
                  key={i}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border transition-all hover:scale-110 ${styles.socialBadge}`}
                  title={soc.title}
                >
                  {getSocialIcon(soc.platform)}
                </a>
              ))}
            </div>
          )}

          {/* Links List */}
          <div className="w-full space-y-2 mt-5">
            {links.length === 0 ? (
              <div className={`p-4 rounded-xl border border-dashed text-xs ${styles.textMuted}`}>
                No showcase links selected yet.
              </div>
            ) : (
              links.map((link) => (
                <a
                  key={link._id}
                  href={`/r/${link.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${styles.linkButton}`}
                >
                  <span className="truncate pr-2 font-medium">{link.title || link.shortCode}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </a>
              ))
            )}
          </div>

          {/* Powered by footer */}
          <div className="mt-auto pt-6">
            <span className={`text-[10px] uppercase tracking-widest font-mono opacity-50 block`}>
              Branded Link Hub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
