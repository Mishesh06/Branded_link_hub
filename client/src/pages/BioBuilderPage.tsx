import React, { useState, useEffect } from 'react';
import { bioApi, linksApi } from '@/services/api';
import { BioProfile, LinkItem } from '@/types';
import { BioEditor } from '@/components/bio/BioEditor';
import { BioPreview } from '@/components/bio/BioPreview';
import { CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export const BioBuilderPage: React.FC = () => {
  const [profile, setProfile] = useState<BioProfile | null>(null);
  const [availableLinks, setAvailableLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [profileRes, linksRes] = await Promise.all([
          bioApi.getMyProfile(),
          linksApi.getLinks({ page: 1, limit: 50 })
        ]);
        setProfile(profileRes.profile);
        setAvailableLinks(linksRes.links);
      } catch (err) {
        console.error('Error loading bio builder data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileChange = (updated: Partial<BioProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updated });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const res = await bioApi.updateMyProfile({
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        theme: profile.theme,
        socialLinks: profile.socialLinks,
        showcaseLinkIds: profile.showcaseLinkIds
      });
      setProfile(res.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save bio profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute links to render in the live preview
  const showcaseLinks = availableLinks.filter((l) =>
    (profile?.showcaseLinkIds || []).includes(l._id)
  );

  if (isLoading || !profile) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-muted-foreground space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        <span className="text-xs">Loading Bio Builder studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-zinc-300" />
            <span>Link-in-Bio Hub Studio</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your public creator profile and preview changes live across themes.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Profile changes saved successfully!</span>
          </div>
        )}
      </div>

      {/* Split Builder Studio: Left = Editor, Right = Live Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Column (7 cols) */}
        <div className="lg:col-span-7">
          <BioEditor
            profile={profile}
            availableLinks={availableLinks}
            onChange={handleProfileChange}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>

        {/* Live Preview Column (5 cols, sticky on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-4 pb-3">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Live Preview
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Theme: {profile.theme}
            </span>
          </div>
          <BioPreview profile={profile} links={showcaseLinks} />
        </div>
      </div>
    </div>
  );
};
