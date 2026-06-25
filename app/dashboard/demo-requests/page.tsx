"use client";

import React from "react";
import { Calendar, Mail, Phone, Building2, Box, Trash2, AlertCircle } from "@/lib/fa-icons";
import { deleteDemoRequests, getDashboardDemoRequests } from "./actions";
import { Card } from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { useToast } from "@/components/dashboard/ui/Toast";
import RefreshButton from "@/components/dashboard/ui/RefreshButton";
import Pagination from "@/components/dashboard/ui/Pagination";
import Button from "@/components/dashboard/ui/Button";
import Modal from "@/components/dashboard/ui/Modal";

type DemoRequestRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  createdAt: string | Date;
  software: { name: string; slug: string } | null;
};

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DemoRequestsPage() {
  const { show } = useToast();
  const [requests, setRequests] = React.useState<DemoRequestRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const result = await getDashboardDemoRequests();
        if (result.success) {
          setRequests(result.data || []);
        } else {
          setError(result.error || "Failed to load demo requests");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load demo requests");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRefresh() {
    const result = await getDashboardDemoRequests();
    if (result.success) {
      const newData = result.data || [];
      const changed = JSON.stringify(newData) !== JSON.stringify(requests);
      if (changed) {
        setRequests(newData);
        show("Table refreshed — new data loaded.", "success");
      } else {
        show("You're already up to date.", "info");
      }
      setError(null);
    } else {
      show(result.error || "Failed to refresh demo requests.", "danger");
    }
  }

  const totalPages = Math.max(1, Math.ceil(requests.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = requests.slice((currentPage - 1) * perPage, currentPage * perPage);

  const selectedIdsInView = new Set(requests.map((r) => r.id).filter((id) => selectedIds.has(id)));
  const selectedCount = selectedIdsInView.size;
  const allSelected = requests.length > 0 && requests.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map((r) => r.id)));
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

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    setBulkDeleting(true);
    try {
      const result = await deleteDemoRequests(Array.from(selectedIdsInView));
      if (result.success) {
        show(`Deleted ${result.data?.count} demo request(s).`, "success");
        setSelectedIds(new Set());
        setBulkDeleteOpen(false);
        setRequests((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      } else {
        show(result.error || "Failed to delete demo requests.", "danger");
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-brand text-2xl font-bold text-primary-navy">Demo Requests</h2>
          <p className="text-sm text-text-muted">
            Leads submitted through the &quot;Watch a free demo&quot; form on each software page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
                {selectedCount} selected
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 size={14} className="mr-1.5" />
                Delete selected
              </Button>
            </>
          )}
          <RefreshButton onRefresh={handleRefresh} className="shrink-0" />
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-sunken" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm font-medium text-status-danger">{error}</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No demo requests yet"
            description="Requests submitted from software pages will show up here, along with which software each one is for."
          />
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 w-10 border-b border-border-subtle bg-surface-muted px-6 py-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                    />
                  </th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Contact</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Organization</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Software</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginated.map((req) => (
                  <tr key={req.id} className="transition-colors hover:bg-surface-muted/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(req.id)}
                        onChange={() => toggleSelectOne(req.id)}
                        className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-primary-navy">{req.name}</p>
                      <div className="mt-1 space-y-1 text-xs text-text-muted">
                        <p className="flex items-center gap-1">
                          <Mail size={10} /> {req.email}
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone size={10} /> {req.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-text-muted">
                        <Building2 size={14} className="text-brand-green-dark" /> {req.organization}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm font-semibold text-primary-navy">
                        <Box size={14} className="text-brand-green-dark" /> {req.software?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={currentPage}
          totalItems={requests.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
        />
      </Card>

      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete selected demo requests"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} loading={bulkDeleting}>
              Delete {selectedCount} request{selectedCount === 1 ? "" : "s"}
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
              {selectedCount} demo request{selectedCount === 1 ? "" : "s"}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
