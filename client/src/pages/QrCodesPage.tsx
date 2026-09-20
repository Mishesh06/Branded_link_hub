import React, { useState, useEffect } from 'react';
import { linksApi } from '@/services/api';
import { LinkItem } from '@/types';
import QRCode from 'qrcode';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode as QrIcon, Download, Copy, Check, Search, ExternalLink, RefreshCw } from 'lucide-react';

export const QrCodesPage: React.FC = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await linksApi.getLinks({ page: 1, limit: 50 });
      setLinks(res.links);
      if (res.links.length > 0 && !selectedLink) {
        setSelectedLink(res.links[0]);
      }
    } catch (err) {
      console.error('Failed to load links for QR studio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const activeLink = selectedLink || links[0] || null;
  const activeShortUrl = activeLink
    ? `${window.location.origin}/r/${activeLink.shortCode}`
    : '';

  useEffect(() => {
    if (activeShortUrl) {
      QRCode.toDataURL(activeShortUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [activeShortUrl]);

  const handleDownload = () => {
    if (!qrDataUrl || !activeLink) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${activeLink.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = links.filter(
    (l) =>
      l.shortCode.toLowerCase().includes(search.toLowerCase()) ||
      (l.title && l.title.toLowerCase().includes(search.toLowerCase())) ||
      l.originalUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <QrIcon className="h-5 w-5 text-zinc-300" />
            <span>QR Code Studio</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate and export crisp, high-resolution QR codes mapped to your branded 302 short links.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLinks}
          disabled={isLoading}
          className="text-xs h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Grid: Left = Link Selector, Right = Dedicated QR Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Links Selector Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search links by code, title, or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Card className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Available Links ({filteredLinks.length})</CardTitle>
              <CardDescription className="text-xs">
                Select a link below to inspect and export its dedicated QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Loading short link library...
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No short links match your query.
                </div>
              ) : (
                filteredLinks.map((link) => {
                  const isSelected = activeLink?._id === link._id;
                  return (
                    <div
                      key={link._id}
                      onClick={() => setSelectedLink(link)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-zinc-500/60 bg-zinc-800/40 text-foreground'
                          : 'border-border/40 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="truncate max-w-[240px] sm:max-w-md pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {link.title || link.shortCode}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-400">
                            /r/{link.shortCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate block font-mono mt-0.5">
                          {link.originalUrl}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {link.clickCount} clicks
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Inspector Preview Column (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-border/60 bg-card/90 sticky top-6">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm">Scannable QR Target</CardTitle>
              <CardDescription className="text-xs">
                Scan with any mobile camera or QR reader to test immediate 302 redirection.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 pt-2">
              {/* Clean high-contrast QR Container (QR itself stays stable and scannable) */}
              <div className="p-4 bg-white rounded-xl shadow-inner border border-zinc-200 transition-all duration-200 hover:shadow-lg">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for /r/${activeLink?.shortCode}`}
                    className="w-52 h-52 rounded"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-zinc-500">
                    Select a link to render QR
                  </div>
                )}
              </div>

              {activeLink && (
                <div className="w-full text-center space-y-1">
                  <p className="font-mono text-xs font-semibold text-foreground truncate">
                    /r/{activeLink.shortCode}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate max-w-xs mx-auto">
                    {activeLink.originalUrl}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!activeLink}
                  onClick={() => activeLink && handleCopy(activeLink.shortCode, activeLink._id)}
                  className="text-xs h-9 w-full"
                >
                  {copiedId === activeLink?._id ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  disabled={!qrDataUrl || !activeLink}
                  onClick={handleDownload}
                  className="text-xs h-9 w-full"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download PNG
                </Button>
              </div>

              {activeLink && (
                <a
                  href={`/r/${activeLink.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center space-x-1 pt-1"
                >
                  <span>Test 302 Redirection in New Tab</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
