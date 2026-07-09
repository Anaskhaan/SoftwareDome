"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Box, AlertCircle, Upload } from "@/lib/fa-icons";
import AdminOutletBtnHeading from "@/components/dashboard/AdminOutletBtnHeading";
import { getDashboardSoftwares, deleteSoftware, deleteSoftwares, importSoftwaresFromCsv, getImportJobStatus } from "./actions";
import { Card } from "@/components/dashboard/ui/Card";
import Button from "@/components/dashboard/ui/Button";
import Modal from "@/components/dashboard/ui/Modal";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { useToast } from "@/components/dashboard/ui/Toast";
import RefreshButton from "@/components/dashboard/ui/RefreshButton";
import Pagination from "@/components/dashboard/ui/Pagination";

export default function SoftwaresPage() {
  const { show } = useToast();
  const [softwares, setSoftwares] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{ created: number; skipped: number; failed: number; errors: string[] } | null>(null);
  const [importProgress, setImportProgress] = React.useState<{ total: number; processed: number; created: number; skipped: number; failed: number } | null>(null);
  const importPollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  async function fetchData() {
    setIsLoading(true);
    const result = await getDashboardSoftwares();
    if (result.success) {
      setSoftwares(result.data || []);
      setError(null);
    } else {
      setError(result.error || "Failed to load softwares");
    }
    setIsLoading(false);
  }

  async function handleRefresh() {
    const result = await getDashboardSoftwares();
    if (result.success) {
      const newData = result.data || [];
      const changed = JSON.stringify(newData) !== JSON.stringify(softwares);
      if (changed) {
        setSoftwares(newData);
        show("Table refreshed — new data loaded.", "success");
      } else {
        show("You're already up to date.", "info");
      }
      setError(null);
    } else {
      show(result.error || "Failed to refresh softwares.", "danger");
    }
  }

  React.useEffect(() => {
    async function loadRole() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.user?.role === "ADMIN");
        }
      } catch {
        setIsAdmin(false);
      }
    }
    loadRole();
    fetchData();
  }, []);

  const filtered = softwares.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase().trim())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  React.useEffect(() => {
    setSelectedIds((prev) => {
      const filteredIds = new Set(filtered.map((s) => s.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (filteredIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [search, softwares.length]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteSoftware(deleteTarget.id);
      if (result.success) {
        show("Software deleted.", "success");
        setDeleteTarget(null);
        fetchData();
      } else {
        show(result.error || "Failed to delete software.", "danger");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    setImportProgress(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const result = await importSoftwaresFromCsv(formData);

      if (!result.success) {
        show(result.error || "Failed to import CSV.", "danger");
        setImporting(false);
        return;
      }

      const { jobId, total } = result.data as { jobId: string; total: number };
      setImportProgress({ total, processed: 0, created: 0, skipped: 0, failed: 0 });

      importPollRef.current = setInterval(async () => {
        try {
          const statusRes = await getImportJobStatus(jobId);
          if (!statusRes.success) {
            if (importPollRef.current) clearInterval(importPollRef.current);
            importPollRef.current = null;
            setImporting(false);
            show(statusRes.error || "Lost track of the import job.", "danger");
            return;
          }

          const state = statusRes.data as { total: number; processed: number; created: number; skipped: number; failed: number; errors: string[]; done: boolean };
          setImportProgress(state);

          if (state.done) {
            if (importPollRef.current) clearInterval(importPollRef.current);
            importPollRef.current = null;
            setImporting(false);
            setImportResult({ created: state.created, skipped: state.skipped, failed: state.failed, errors: state.errors });
            show(`Import finished: ${state.created} created, ${state.skipped} skipped.`, "success");
            fetchData();
          }
        } catch (err) {
          console.error("Import status poll failed:", err);
          if (importPollRef.current) clearInterval(importPollRef.current);
          importPollRef.current = null;
          setImporting(false);
          show("Lost connection while tracking the import. It may still be running in the background — refresh to check.", "danger");
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to start CSV import:", err);
      setImporting(false);
      show("Failed to start the import. The file may be too large for the server, or the connection was interrupted.", "danger");
    }
  };

  React.useEffect(() => {
    return () => {
      if (importPollRef.current) clearInterval(importPollRef.current);
    };
  }, []);

  const closeImportModal = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const result = await deleteSoftwares(Array.from(selectedIds));
      if (result.success) {
        show(`Deleted ${result.data?.count} software(s).`, "success");
        setSelectedIds(new Set());
        setBulkDeleteOpen(false);
        fetchData();
      } else {
        show(result.error || "Failed to delete softwares.", "danger");
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminOutletBtnHeading
        heading="Softwares"
        subtitle={isAdmin ? "Manage your software listings and reviews." : "Manage software listings you have added."}
      />

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search softwares…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border-subtle bg-surface-muted py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/15"
            />
          </div>
          <RefreshButton onRefresh={handleRefresh} />
          {isAdmin && (
            <>
              <Link
                href="/dashboard/softwares/add"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-green px-3 text-xs font-bold text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] transition-all hover:bg-brand-green-dark"
              >
                <Plus size={14} />
                Add New Software
              </Link>
              <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)} className="h-9 shrink-0">
                <Upload size={14} className="mr-1.5" />
                Import CSV
              </Button>
            </>
          )}
          {isAdmin && selectedIds.size > 0 ? (
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className="text-xs font-semibold text-text-muted">
                {selectedIds.size} selected
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 size={14} className="mr-1.5" />
                Delete selected
              </Button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-text-muted sm:ml-auto">
              {filtered.length} of {softwares.length} listings
            </span>
          )}
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-sunken" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="mb-3 inline-flex rounded-2xl bg-status-danger-bg p-3 text-status-danger">
                <AlertCircle size={24} />
              </div>
              <p className="font-semibold text-primary-navy">{error}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={fetchData}>
                Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Box}
                title={search ? "No softwares match your search" : "No softwares found"}
                description={
                  search
                    ? "Try a different search term."
                    : "Get started by adding your first software listing."
                }
              />
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {isAdmin && (
                    <th className="sticky top-0 z-10 w-10 border-b border-border-subtle bg-surface-muted px-6 py-3.5">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                      />
                    </th>
                  )}
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Software</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Rating</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Created At</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginated.map((software) => (
                  <tr
                    key={software.id}
                    className={`transition-colors hover:bg-surface-muted ${
                      selectedIds.has(software.id) ? "bg-brand-green/5" : ""
                    }`}
                  >
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(software.id)}
                          onChange={() => toggleSelectOne(software.id)}
                          className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-brand-green/10 text-brand-green-dark">
                          {software.logo ? (
                            <img src={software.logo} alt={software.name} className="h-full w-full object-contain p-1.5" />
                          ) : (
                            <Box size={18} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary-navy">{software.name}</span>
                          <span className="text-xs text-text-muted">{software.subcategory?.name || "Uncategorized"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-primary-navy">
                        ⭐ {software.rating?.toFixed(1) || "0.0"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-muted">
                        {new Date(software.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/softwares/edit/${software.id}`}
                          className="rounded-lg p-2 text-status-info transition-colors hover:bg-status-info-bg"
                          title="Edit software"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(software)}
                          className="rounded-lg p-2 text-status-danger transition-colors hover:bg-status-danger-bg"
                          title="Delete software"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          page={currentPage}
          totalItems={filtered.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
        />
      </Card>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete software"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              Delete software
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-danger-bg text-status-danger">
            <AlertCircle size={16} />
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to delete{" "}
            <span className="font-bold text-primary-navy">{deleteTarget?.name}</span>? This will also
            remove its logo and gallery images, and the public listing page will go offline immediately.
          </p>
        </div>
      </Modal>

      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete selected softwares"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} loading={bulkDeleting}>
              Delete {selectedIds.size} software{selectedIds.size === 1 ? "" : "s"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-danger-bg text-status-danger">
            <AlertCircle size={16} />
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to delete{" "}
            <span className="font-bold text-primary-navy">
              {selectedIds.size} software{selectedIds.size === 1 ? "" : "s"}
            </span>
            ? This will also remove their logos and gallery images, and the public listing pages will
            go offline immediately. This cannot be undone.
          </p>
        </div>
      </Modal>

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Import softwares from CSV"
        footer={
          <>
            <Button variant="secondary" onClick={closeImportModal} disabled={importing}>
              Close
            </Button>
            <Button onClick={handleImport} loading={importing} disabled={!importFile}>
              Import
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Upload a CSV file with software listings. Rows with a slug that already exists will be
            skipped. Logos and gallery images will be re-hosted automatically — large files import in
            the background, so you can track progress below without the page timing out.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setImportFile(e.target.files?.[0] || null);
              setImportResult(null);
              setImportProgress(null);
            }}
            disabled={importing}
            className="block w-full rounded-xl border border-border-subtle bg-surface-muted p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          {importProgress && !importResult && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-3 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-primary-navy">
                  Importing… {importProgress.processed} / {importProgress.total} added
                </p>
                <span className="font-bold text-brand-green-dark">
                  {importProgress.total ? Math.round((importProgress.processed / importProgress.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-brand-green transition-all"
                  style={{
                    width: `${importProgress.total ? Math.round((importProgress.processed / importProgress.total) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-text-muted">
                Created {importProgress.created} · Skipped {importProgress.skipped} · Failed{" "}
                {importProgress.failed}
              </p>
            </div>
          )}
          {importResult && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-3 text-sm">
              <p className="font-semibold text-primary-navy">
                Created {importResult.created} · Skipped {importResult.skipped} · Failed{" "}
                {importResult.failed}
                {(importResult as any).uncategorized ? ` · ${(importResult as any).uncategorized} uncategorized (review category/subcategory columns)` : ""}
              </p>
              {importResult.errors.length > 0 && (
                <p className="mt-1 text-xs text-text-muted">
                  Failed slugs: {importResult.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
