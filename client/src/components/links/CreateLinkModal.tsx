import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { linksApi } from '@/services/api';
import { LinkItem } from '@/types';
import { Copy, Check, Link2, Sparkles } from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: (link: LinkItem) => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onLinkCreated
}) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setOriginalUrl('');
    setTitle('');
    setIsCustom(false);
    setCustomSlug('');
    setError('');
    setCreatedLink(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!originalUrl.trim()) {
      setError('Destination URL is required');
      return;
    }

    // Ensure protocol
    let formattedUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setIsLoading(true);

    try {
      const payload: { originalUrl: string; customSlug?: string; title?: string } = {
        originalUrl: formattedUrl,
        title: title.trim() || undefined
      };

      if (isCustom && customSlug.trim()) {
        payload.customSlug = customSlug.trim();
      }

      const res = await linksApi.createLink(payload);
      setCreatedLink(res.link);
      onLinkCreated(res.link);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to create short link';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fullShortUrl = createdLink
    ? `${window.location.origin}/r/${createdLink.shortCode}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 text-foreground" />
            <span>Create Short Link</span>
          </DialogTitle>
          <DialogDescription>
            Shorten a long URL, configure a vanity slug, and track click telemetry.
          </DialogDescription>
        </DialogHeader>

        {createdLink ? (
          <div className="space-y-4 py-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                <Check className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-emerald-400">Short Link Ready!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your link has been generated and is ready to share.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Short Link</label>
              <div className="flex items-center space-x-2">
                <input
                  readOnly
                  value={fullShortUrl}
                  className="flex h-9 w-full rounded-md border border-border bg-muted/40 px-3 py-1 font-mono text-xs text-foreground focus:outline-none"
                />
                <Button size="sm" onClick={handleCopy} className="shrink-0 text-xs">
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-1 border-t border-border/40">
              <span className="font-medium text-foreground">Destination:</span>{' '}
              <span className="truncate block font-mono text-[11px] text-zinc-400">
                {createdLink.originalUrl}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Destination URL <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="https://example.com/long-target-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Title (Optional)</label>
              <Input
                placeholder="e.g. Documentation Portal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="pt-2 border-t border-border/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Short Code Mode</span>
                <div className="flex items-center space-x-1 bg-muted p-0.5 rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCustom(false)}
                    className={`px-2.5 py-1 rounded-sm transition-colors ${
                      !isCustom
                        ? 'bg-background text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Auto 6-Char
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`px-2.5 py-1 rounded-sm transition-colors ${
                      isCustom
                        ? 'bg-background text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Custom Slug
                  </button>
                </div>
              </div>

              {isCustom ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Custom Vanity Slug
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-border bg-muted/50 px-3 text-xs text-muted-foreground font-mono">
                      /r/
                    </span>
                    <input
                      type="text"
                      placeholder="summer-launch"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="flex h-9 w-full rounded-r-md border border-border bg-transparent px-3 py-1 text-xs font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    3-30 characters, letters, numbers, hyphens, underscores.
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-md border border-border/40">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Will generate a unique, cryptographically random 6-character short code.</span>
                </div>
              )}
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isLoading}>
                Create Short Link
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
