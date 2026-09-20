import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { LinkItem, Pagination } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Copy,
  Check,
  QrCode,
  BarChart2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { QrCodeModal } from './QrCodeModal';

interface LinkTableProps {
  links: LinkItem[];
  pagination: Pagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => Promise<void>;
}

export const LinkTable: React.FC<LinkTableProps> = ({
  links,
  pagination,
  isLoading,
  onPageChange,
  onDelete
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQrLink, setSelectedQrLink] = useState<LinkItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<LinkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteCandidate._id);
      setDeleteCandidate(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px]">Link & Destination</TableHead>
              <TableHead>Short Code</TableHead>
              <TableHead className="text-center">Clicks</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="py-4 px-4">
                    <div className="skeleton-shimmer h-5 w-full rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-muted-foreground">
                  <div className="h-10 w-10 rounded-full bg-secondary/50 border border-border/60 mx-auto mb-2 flex items-center justify-center text-muted-foreground/60">
                    <Globe className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">No short links found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Create your first short link to start tracking real-time click telemetry.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              links.map((link, idx) => (
                <TableRow
                  key={link._id}
                  style={{ animationDelay: `${Math.min(idx * 45, 300)}ms` }}
                  className="group animate-row-enter transition-colors duration-150"
                >
                  {/* Destination & Title */}
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-foreground truncate">
                        {link.title || link.shortCode}
                      </span>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-muted-foreground truncate hover:text-foreground flex items-center mt-0.5 group-hover:text-zinc-300 transition-colors font-mono"
                      >
                        <span className="truncate">{link.originalUrl}</span>
                        <ExternalLink className="h-2.5 w-2.5 ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </TableCell>

                  {/* Short Code */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/r/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-semibold text-zinc-200 hover:text-white hover:underline underline-offset-2"
                      >
                        /r/{link.shortCode}
                      </a>
                      {link.isCustomSlug && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary border border-border/50 text-zinc-400 font-mono">
                          custom
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Click count */}
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono text-xs bg-secondary/80 border border-border/50">
                      {link.clickCount.toLocaleString()}
                    </Badge>
                  </TableCell>

                  {/* Created */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                    {formatDate(link.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Copy with smooth transition */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(link.shortCode, link._id)}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground transition-all duration-150"
                        title="Copy short link"
                      >
                        {copiedId === link._id ? (
                          <span className="inline-flex items-center text-emerald-400 font-medium animate-in fade-in duration-150 text-[11px]">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Copied
                          </span>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {/* QR */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedQrLink(link)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="QR Code"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </Button>

                      {/* Analytics */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/analytics?linkId=${link._id}`)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="View analytics"
                      >
                        <BarChart2 className="h-3.5 w-3.5" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCandidate(link)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <div>
            Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.total} total links)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="text-xs h-8"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="text-xs h-8"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        link={selectedQrLink}
        isOpen={!!selectedQrLink}
        onClose={() => setSelectedQrLink(null)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Short Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the short link{' '}
              <strong className="text-foreground">/r/{deleteCandidate?.shortCode}</strong>? This
              action cannot be undone and will remove all associated click telemetry data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
