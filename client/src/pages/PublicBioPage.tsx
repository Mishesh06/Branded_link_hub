import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bioApi } from '@/services/api';
import { BioProfile, LinkItem } from '@/types';
import { getThemeStyles, getSocialIcon } from '@/components/bio/BioPreview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Link2, Loader2 } from 'lucide-react';

export const PublicBioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<BioProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    bioApi
      .getPublicProfile(username)
      .then((res) => {
        setProfile(res.profile);
        setLinks(res.links);
        setError(false);
      })
      .catch((err) => {
        console.error('Failed to load bio profile:', err);
        setError(true);
      })
      .finally(() => setIsLoading(false));
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        <span className="text-xs font-mono">Loading @{username}...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-400">
            <Link2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Profile Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The profile <code className="text-foreground">@{username}</code> does not exist or has
            been archived.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create your own Branded Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const styles = getThemeStyles(profile.theme);
  const activeSocials = (profile.socialLinks || []).filter((s) => s.isEnabled);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8 transition-colors duration-300 ${styles.container}`}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center pt-8 pb-12 flex-1">
        {/* Avatar */}
        <div className="animate-row-enter" style={{ animationDelay: '0ms' }}>
          <Avatar className="h-24 w-24 border-2 border-border/80 shadow-xl mb-4">
            <AvatarImage src={profile.avatarUrl || ''} alt={profile.displayName} />
            <AvatarFallback className="text-xl font-bold">
              {profile.displayName ? profile.displayName.slice(0, 2).toUpperCase() : 'ME'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Display Name & Username */}
        <div className="animate-row-enter space-y-1" style={{ animationDelay: '60ms' }}>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {profile.displayName || `@${profile.username}`}
          </h1>
          <div>
            <span className={`inline-block text-xs font-mono px-3 py-0.5 rounded-full border ${styles.handle}`}>
              @{profile.username}
            </span>
          </div>
        </div>

        {/* Bio description */}
        {profile.bio && (
          <div className="animate-row-enter mt-3" style={{ animationDelay: '120ms' }}>
            <p className={`text-xs sm:text-sm max-w-sm leading-relaxed ${styles.textMuted}`}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Social Link Badges */}
        {activeSocials.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-row-enter"
            style={{ animationDelay: '180ms' }}
          >
            {activeSocials.map((soc, idx) => (
              <a
                key={idx}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2.5 rounded-full border transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-sm ${styles.socialBadge}`}
                title={soc.title}
              >
                {getSocialIcon(soc.platform)}
              </a>
            ))}
          </div>
        )}

        {/* Links List */}
        <div className="w-full space-y-3 mt-8">
          {links.length === 0 ? (
            <div className={`p-6 rounded-2xl border border-dashed text-xs ${styles.textMuted}`}>
              No links currently available on this profile.
            </div>
          ) : (
            links.map((link, idx) => (
              <a
                key={link._id}
                href={`/r/${link.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ animationDelay: `${240 + idx * 50}ms` }}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.99] shadow-sm animate-row-enter ${styles.linkButton}`}
              >
                <span className="truncate pr-3 text-left font-medium">{link.title || link.shortCode}</span>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
              </a>
            ))
          )}
        </div>

        {/* Hub Branding Footer */}
        <div className="mt-auto pt-16">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 opacity-60 hover:opacity-100 transition-opacity text-[11px] font-mono"
          >
            <Link2 className="h-3 w-3" />
            <span>Built with Branded Link Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
