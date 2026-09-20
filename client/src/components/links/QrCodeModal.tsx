import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LinkItem } from '@/types';
import { Download, QrCode, Copy, Check } from 'lucide-react';

interface QrCodeModalProps {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ link, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fullShortUrl = link ? `${window.location.origin}/r/${link.shortCode}` : '';

  useEffect(() => {
    if (link && fullShortUrl) {
      QRCode.toDataURL(fullShortUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [link, fullShortUrl]);

  const handleDownload = () => {
    if (!qrDataUrl || !link) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${link.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center space-x-2">
            <QrCode className="h-5 w-5 text-foreground" />
            <span>QR Code</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Scan with any mobile camera to test the 302 redirection engine.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="p-3.5 bg-white rounded-xl shadow-inner border border-zinc-200 transition-all duration-200 hover:shadow-md">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${link?.shortCode}`}
                className="w-48 h-48 rounded"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-muted-foreground">
                Generating QR...
              </div>
            )}
          </div>

          <div className="w-full text-center">
            <p className="font-mono text-xs text-zinc-200 font-semibold truncate">
              /r/{link?.shortCode}
            </p>
            <p className="text-[11px] text-muted-foreground truncate max-w-xs mx-auto mt-0.5 font-mono">
              {link?.originalUrl}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs w-full sm:w-auto">
            {copied ? (
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
          <Button size="sm" onClick={handleDownload} className="text-xs w-full sm:w-auto">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
