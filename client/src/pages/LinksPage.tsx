import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { linksApi } from '@/services/api';
import { LinkItem, Pagination } from '@/types';
import { LinkTable } from '@/components/links/LinkTable';
import { CreateLinkModal } from '@/components/links/CreateLinkModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RefreshCw } from 'lucide-react';

export const LinksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchLinks = useCallback(
    async (page = 1, searchQuery = search) => {
      setIsLoading(true);
      try {
        const res = await linksApi.getLinks({
          page,
          limit: 10,
          search: searchQuery.trim() || undefined
        });
        setLinks(res.links);
        setPagination(res.pagination);
      } catch (err) {
        console.error('Error fetching links:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchLinks(1, search);

    const handleCreated = () => fetchLinks(1, search);
    window.addEventListener('linkCreated', handleCreated);
    return () => window.removeEventListener('linkCreated', handleCreated);
  }, [fetchLinks, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id: string) => {
    await linksApi.deleteLink(id);
    await fetchLinks(pagination.page, search);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Link Library Studio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your branded vanity links, inspect QR codes, and monitor click performance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLinks(pagination.page, search)}
            disabled={isLoading}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="text-xs h-8">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Link
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by title, vanity slug, or destination..."
          value={search}
          onChange={handleSearchChange}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Link Table */}
      <LinkTable
        links={links}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(p) => fetchLinks(p, search)}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onLinkCreated={() => fetchLinks(1, search)}
      />
    </div>
  );
};
