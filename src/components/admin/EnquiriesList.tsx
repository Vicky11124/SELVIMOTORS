'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setLeadStatus, setBulkLeadStatus, deleteBulkLeads, deleteLead } from '@/app/admin/actions';
import { LEAD_STATUSES, type Enquiry, type LeadStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Props {
  initialList: Enquiry[];
}

export default function EnquiriesList({ initialList }: Props) {
  const router = useRouter();
  const [list, setList] = useState<Enquiry[]>(initialList);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<LeadStatus>('CONTACTED');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ open: boolean; ids: string[]; count: number }>({
    open: false,
    ids: [],
    count: 0,
  });

  // Sync if initialList changes from SSR refresh
  useMemo(() => {
    setList(initialList);
  }, [initialList]);

  // Filtered enquiries
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      if (filterStatus !== 'ALL' && item.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = item.customer_name?.toLowerCase().includes(query);
        const phoneMatch = item.phone?.toLowerCase().includes(query);
        const emailMatch = item.email?.toLowerCase().includes(query);
        const bikeMatch = item.bikes
          ? `${item.bikes.brand} ${item.bikes.model}`.toLowerCase().includes(query)
          : false;
        const msgMatch = item.message?.toLowerCase().includes(query);
        return nameMatch || phoneMatch || emailMatch || bikeMatch || msgMatch;
      }
      return true;
    });
  }, [list, filterStatus, searchQuery]);

  // Selection handlers
  const allFilteredSelected =
    filteredList.length > 0 && filteredList.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all in filtered view
      const next = new Set(selectedIds);
      filteredList.forEach((item) => next.delete(item.id));
      setSelectedIds(next);
    } else {
      // Select all in filtered view
      const next = new Set(selectedIds);
      filteredList.forEach((item) => next.add(item.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk Status Change
  const handleBulkStatusChange = () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await setBulkLeadStatus('enquiries', ids, bulkStatus);
      if (!res.ok) {
        setFeedback({ type: 'error', message: res.error || 'Failed to update status' });
      } else {
        setFeedback({ type: 'success', message: `Updated status to "${bulkStatus}" for ${ids.length} item(s)` });
        setList((prev) =>
          prev.map((item) => (selectedIds.has(item.id) ? { ...item, status: bulkStatus } : item))
        );
        clearSelection();
        router.refresh();
      }
    });
  };

  // Single Status Change
  const handleSingleStatusChange = (id: string, nextStatus: LeadStatus) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await setLeadStatus('enquiries', id, nextStatus);
      if (!res.ok) {
        setFeedback({ type: 'error', message: res.error || 'Failed to update status' });
      } else {
        setList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
        );
        router.refresh();
      }
    });
  };

  // Bulk / Single Delete trigger
  const requestDelete = (ids: string[]) => {
    if (!ids.length) return;
    setConfirmDeleteModal({
      open: true,
      ids,
      count: ids.length,
    });
  };

  const executeDelete = () => {
    const ids = confirmDeleteModal.ids;
    setConfirmDeleteModal({ open: false, ids: [], count: 0 });
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteBulkLeads('enquiries', ids);
      if (!res.ok) {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete items' });
      } else {
        setFeedback({ type: 'success', message: `Deleted ${ids.length} enquiry/enquiries` });
        const idSet = new Set(ids);
        setList((prev) => prev.filter((item) => !idSet.has(item.id)));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        router.refresh();
      }
    });
  };

  const statusBadgeColor = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CONTACTED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CLOSED':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-strong">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            Manage customer bike enquiries, update lead statuses, or delete entries.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-brand text-white'
                : 'bg-card border border-line text-muted hover:text-white'
            }`}
          >
            All ({list.length})
          </button>
          {LEAD_STATUSES.map((status) => {
            const count = list.filter((e) => e.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-brand text-white'
                    : 'bg-card border border-line text-muted hover:text-white'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field !py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between border ${
            feedback.type === 'error'
              ? 'bg-red-950/40 border-red-900/50 text-red-300'
              : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/40 bg-bg-card/95 p-3.5 backdrop-blur-md shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              {selectedIds.size} Selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              disabled={isPending}
              className="text-xs text-muted hover:text-white transition-colors underline underline-offset-4"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status changer */}
            <div className="flex items-center gap-1.5">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as LeadStatus)}
                disabled={isPending}
                className="field !w-auto !py-1.5 text-xs"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Mark {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkStatusChange}
                disabled={isPending}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors border border-line disabled:opacity-50"
              >
                {isPending ? 'Updating...' : 'Apply Status'}
              </button>
            </div>

            <div className="h-4 w-px bg-line" />

            {/* Bulk Delete */}
            <button
              type="button"
              onClick={() => requestDelete(Array.from(selectedIds))}
              disabled={isPending}
              className="rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {/* List Header with Select All */}
      {filteredList.length > 0 && (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-text/70 border-b border-border pb-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <span className="font-bold text-text-strong">Select All in view ({filteredList.length})</span>
          </label>
          <span>Showing {filteredList.length} of {list.length} enquiries</span>
        </div>
      )}

      {/* Enquiry Cards */}
      <ul className="space-y-3">
        {filteredList.map((e) => {
          const isSelected = selectedIds.has(e.id);
          return (
            <li
              key={e.id}
              className={`relative rounded-xl border transition-all duration-200 bg-surface p-4 shadow-sm ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Select Checkbox */}
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectItem(e.id)}
                    className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-base text-text-strong">{e.customer_name}</p>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${statusBadgeColor(
                            e.status
                          )}`}
                        >
                          {e.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text/80">
                        <a href={`tel:${e.phone}`} className="text-text-strong hover:text-primary font-bold">
                          {e.phone}
                        </a>
                        {e.email && (
                          <>
                            {' '}
                            ·{' '}
                            <a href={`mailto:${e.email}`} className="hover:text-primary">
                              {e.email}
                            </a>
                          </>
                        )}
                      </p>
                      {e.bikes && (
                        <p className="mt-1 text-sm text-text/70">
                          Bike:{' '}
                          <Link
                            href={`/buy/${e.bikes.slug}`}
                            target="_blank"
                            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                          >
                            {e.bikes.brand} {e.bikes.model}
                            <span className="text-xs">↗</span>
                          </Link>
                        </p>
                      )}
                    </div>

                    {/* Actions on Card */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          aria-label="Status"
                          disabled={isPending}
                          value={e.status}
                          onChange={(ev) => handleSingleStatusChange(e.id, ev.target.value as LeadStatus)}
                          className="field !w-auto !py-1 text-xs"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => requestDelete([e.id])}
                          title="Delete enquiry"
                          disabled={isPending}
                          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-red-50 hover:border-red-300 text-text/60 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-text/60 font-medium">{formatDate(e.created_at)}</p>
                    </div>
                  </div>

                  {e.message && (
                    <p className="mt-3 whitespace-pre-line border-t border-border pt-3 text-sm text-text-strong bg-surface-muted p-2.5 rounded-lg border">
                      {e.message}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}

        {!filteredList.length && (
          <li className="rounded-xl border border-dashed border-line p-12 text-center text-muted">
            {list.length === 0 ? 'No enquiries yet.' : 'No enquiries match your search/filter.'}
          </li>
        )}
      </ul>

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/10 p-3 text-red-500 border border-red-500/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
                <p className="text-xs text-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-white/80">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-white">
                {confirmDeleteModal.count} {confirmDeleteModal.count === 1 ? 'enquiry' : 'enquiries'}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal({ open: false, ids: [], count: 0 })}
                disabled={isPending}
                className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
