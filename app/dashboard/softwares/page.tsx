"use client";

import React from "react";
import Link from "next/link";
import { Search, Edit2, Trash2, Box, AlertCircle, Upload } from "@/lib/fa-icons";
import AdminOutletBtnHeading from "@/components/dashboard/AdminOutletBtnHeading";
import { getSoftwares, deleteSoftware, deleteSoftwares, importSoftwaresFromCsv } from "./actions";
import { Card } from "@/components/dashboard/ui/Card";
import Button from "@/components/dashboard/ui/Button";
import Modal from "@/components/dashboard/ui/Modal";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { useToast } from "@/components/dashboard/ui/Toast";

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
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  async function fetchData() {
    setIsLoading(true);
    const result = await getSoftwares();
    if (result.success) {
      setSoftwares(result.data || []);
      setError(null);
    } else {
      setError(result.error || "Failed to load softwares");
    }
    setIsLoading(false);
  }

  React.useEffect(() => {
    fetchData();
  }, []);

  const filtered = softwares.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase().trim())
  );

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
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const result = await importSoftwaresFromCsv(formData);
      if (result.success) {
        setImportResult(result.data as any);
        show(`Import finished: ${result.data?.created} created, ${result.data?.skipped} skipped.`, "success");
        fetchData();
      } else {
        show(result.error || "Failed to import CSV.", "danger");
      }
    } finally {
      setImporting(false);
    }
  };

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AdminOutletBtnHeading
          heading="Softwares"
          subtitle="Manage your software listings and reviews."
          btnText="Add New Software"
          btnUrl="/dashboard/softwares/add"
        />
        <Button variant="secondary" onClick={() => setImportOpen(true)} className="shrink-0">
          <Upload size={15} className="mr-1.5" />
          Import CSV
        </Button>
      </div>

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search softwares…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-surface-muted py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/15"
            />
          </div>
          {selectedIds.size > 0 ? (
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

        <div className="overflow-x-auto">
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
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-muted">
                  <th className="w-10 px-6 py-3.5">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                    />
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Software</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Rating</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Created At</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((software) => (
                  <tr
                    key={software.id}
                    className={`transition-colors hover:bg-surface-muted ${
                      selectedIds.has(software.id) ? "bg-brand-green/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(software.id)}
                        onChange={() => toggleSelectOne(software.id)}
                        className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                      />
                    </td>
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
                          <span className="text-xs text-text-muted">{software.category || "Uncategorized"}</span>
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
            skipped. Logos and gallery images will be re-hosted automatically — large files may take
            a while to import.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setImportFile(e.target.files?.[0] || null);
              setImportResult(null);
            }}
            disabled={importing}
            className="block w-full rounded-xl border border-border-subtle bg-surface-muted p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          {importResult && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-3 text-sm">
              <p className="font-semibold text-primary-navy">
                Created {importResult.created} · Skipped {importResult.skipped} · Failed{" "}
                {importResult.failed}
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
