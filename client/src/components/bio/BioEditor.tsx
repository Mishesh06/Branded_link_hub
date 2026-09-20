import React, { useState } from 'react';
import { BioProfile, LinkItem, SocialLink, BioTheme } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ThemePicker } from './ThemePicker';
import { Plus, Trash2, Check, Copy, ExternalLink, Link2 } from 'lucide-react';

interface BioEditorProps {
  profile: BioProfile;
  availableLinks: LinkItem[];
  onChange: (updated: Partial<BioProfile>) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const PLATFORMS = ['GitHub', 'Twitter', 'LinkedIn', 'YouTube', 'Instagram', 'Website'];

export const BioEditor: React.FC<BioEditorProps> = ({
  profile,
  availableLinks,
  onChange,
  onSave,
  isSaving
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [newPlatform, setNewPlatform] = useState('GitHub');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showAddSocial, setShowAddSocial] = useState(false);

  const publicUrl = `${window.location.origin}/bio/${profile.username}`;

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddSocial = () => {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    const newLink: SocialLink = {
      platform: newPlatform.toLowerCase(),
      title: newTitle.trim() || newPlatform,
      url,
      isEnabled: true
    };

    onChange({
      socialLinks: [...(profile.socialLinks || []), newLink]
    });

    setNewUrl('');
    setNewTitle('');
    setShowAddSocial(false);
  };

  const handleRemoveSocial = (index: number) => {
    const updated = [...(profile.socialLinks || [])];
    updated.splice(index, 1);
    onChange({ socialLinks: updated });
  };

  const handleToggleShowcase = (linkId: string) => {
    const current = profile.showcaseLinkIds || [];
    let updated: string[];
    if (current.includes(linkId)) {
      updated = current.filter((id) => id !== linkId);
    } else {
      updated = [...current, linkId];
    }
    onChange({ showcaseLinkIds: updated });
  };

  return (
    <div className="space-y-6">
      {/* Public Profile Header Card */}
      <Card className="border-border/60 bg-card/80">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Public Bio Link
            </span>
            <p className="font-mono text-xs font-semibold text-foreground mt-0.5">{publicUrl}</p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPublicUrl}
              className="text-xs h-8"
            >
              {copiedLink ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy URL
                </>
              )}
            </Button>
            <a href={`/bio/${profile.username}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary" className="text-xs h-8">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View Page
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile Basics</CardTitle>
          <CardDescription className="text-xs">
            Personalize how your public bio card introduces you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Display Name</label>
            <Input
              value={profile.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              placeholder="e.g. Sarah Chen"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Avatar Image URL</label>
            <Input
              value={profile.avatarUrl}
              onChange={(e) => onChange({ avatarUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Provide a direct link to a hosted profile avatar image.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-foreground">Bio Description</label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {(profile.bio || '').length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={profile.bio}
              onChange={(e) => onChange({ bio: e.target.value })}
              placeholder="Tell visitors what you build, share, or create..."
              className="w-full rounded-md border border-border bg-transparent p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Selector */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Theme Styling</CardTitle>
          <CardDescription className="text-xs">
            Choose a visual style for your public bio page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePicker
            currentTheme={profile.theme}
            onThemeChange={(theme: BioTheme) => onChange({ theme })}
          />
        </CardContent>
      </Card>

      {/* Social Links Manager */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Social Profiles</CardTitle>
            <CardDescription className="text-xs">
              Direct visitors to your platforms and handles.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddSocial(!showAddSocial)}
            className="text-xs h-8"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Social Link
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddSocial && (
            <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Title</label>
                  <Input
                    placeholder="e.g. GitHub @username"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">URL</label>
                  <Input
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddSocial(false)}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSocial}
                  disabled={!newUrl.trim()}
                  className="text-xs h-7"
                >
                  Save Link
                </Button>
              </div>
            </div>
          )}

          {(profile.socialLinks || []).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No social links added yet. Click &quot;Add Social Link&quot; above.
            </p>
          ) : (
            <div className="space-y-2">
              {profile.socialLinks.map((soc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-md border border-border/40 bg-muted/20 text-xs"
                >
                  <div className="truncate max-w-[260px] sm:max-w-none">
                    <span className="font-semibold text-foreground mr-2 capitalize">
                      {soc.platform}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">{soc.url}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSocial(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Showcase Links Selection */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Featured Short Links</CardTitle>
          <CardDescription className="text-xs">
            Select links from your library to showcase on your bio hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableLinks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No links available in your library. Create a short link first.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableLinks.map((link) => {
                const isSelected = (profile.showcaseLinkIds || []).includes(link._id);
                return (
                  <label
                    key={link._id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-zinc-500/60 bg-zinc-800/40 text-foreground'
                        : 'border-border/40 bg-secondary/20 hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate mr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleShowcase(link._id)}
                        className="rounded border-border text-zinc-300 focus:ring-zinc-400 accent-zinc-200 h-3.5 w-3.5 cursor-pointer"
                      />
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="font-medium text-foreground truncate">
                        {link.title || link.shortCode}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">/r/{link.shortCode}</span>
                    </div>
                    <span className="text-[11px] font-mono shrink-0">
                      {link.clickCount} clicks
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-2 sticky bottom-4 z-10">
        <Button
          type="button"
          onClick={onSave}
          isLoading={isSaving}
          className="w-full shadow-lg h-10 text-sm font-medium"
        >
          Save Bio Profile Changes
        </Button>
      </div>
    </div>
  );
};
