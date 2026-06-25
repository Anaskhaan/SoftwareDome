"use client";

import React from "react";
import { Store, Globe, Package, Mail, Phone, Building2, Trash2, AlertCircle } from "@/lib/fa-icons";
import { deleteVendors, getDashboardVendors } from "./actions";
import { Card } from "@/components/dashboard/ui/Card";
import Badge, { statusToTone } from "@/components/dashboard/ui/Badge";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { useToast } from "@/components/dashboard/ui/Toast";
import RefreshButton from "@/components/dashboard/ui/RefreshButton";
import Pagination from "@/components/dashboard/ui/Pagination";
import Button from "@/components/dashboard/ui/Button";
import Modal from "@/components/dashboard/ui/Modal";

export default function VendorsPage() {
  const { show } = useToast();
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isVendorView, setIsVendorView] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const me = await meRes.json();
          setIsVendorView(me.user?.role === "VENDOR");
        }

        const result = await getDashboardVendors();
        if (result.success) {
          setVendors(result.data || []);
        } else {
          setError(result.error || "Failed to load vendors");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load vendors");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRefresh() {
    const result = await getDashboardVendors();
    if (result.success) {
      const newData = result.data || [];
      const changed = JSON.stringify(newData) !== JSON.stringify(vendors);
      if (changed) {
        setVendors(newData);
        show("Table refreshed — new data loaded.", "success");
      } else {
        show("You're already up to date.", "info");
      }
      setError(null);
    } else {
      show(result.error || "Failed to refresh vendors.", "danger");
    }
  }

  const totalPages = Math.max(1, Math.ceil(vendors.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = vendors.slice((currentPage - 1) * perPage, currentPage * perPage);

  const selectedIdsInView = new Set(vendors.map((v) => v.id).filter((id) => selectedIds.has(id)));
  const selectedCount = selectedIdsInView.size;
  const allSelected = vendors.length > 0 && vendors.every((v) => selectedIds.has(v.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(vendors.map((v) => v.id)));
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
      const result = await deleteVendors(Array.from(selectedIdsInView));
      if (result.success) {
        show(`Deleted ${result.data?.count} vendor(s).`, "success");
        setSelectedIds(new Set());
        setBulkDeleteOpen(false);
        setVendors((prev) => prev.filter((v) => !selectedIds.has(v.id)));
      } else {
        show(result.error || "Failed to delete vendors.", "danger");
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-brand text-2xl font-bold text-primary-navy">
            {isVendorView ? "My Vendor Profile" : "Vendors"}
          </h2>
          <p className="text-sm text-text-muted">
            {isVendorView
              ? "Your company details and software count in the panel."
              : "Manage vendor profiles and partnership status."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isVendorView && selectedCount > 0 && (
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
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Store}
            title={isVendorView ? "Profile not found" : "No vendors yet"}
            description={
              isVendorView
                ? "Your vendor profile could not be loaded."
                : "Vendors will appear here once they sign up."
            }
          />
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {!isVendorView && (
                    <th className="sticky top-0 z-10 w-10 border-b border-border-subtle bg-surface-muted px-6 py-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                      />
                    </th>
                  )}
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Vendor</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Contact</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Products</th>
                  <th className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted px-6 py-4 text-xs font-bold uppercase text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginated.map((vendor) => (
                  <tr key={vendor.id} className="transition-colors hover:bg-surface-muted/50">
                    {!isVendorView && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(vendor.id)}
                          onChange={() => toggleSelectOne(vendor.id)}
                          className="h-4 w-4 rounded border-border-subtle accent-brand-green"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green-dark">
                          <Store size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-primary-navy">{vendor.name}</p>
                          {vendor.email && (
                            <p className="flex items-center gap-1 text-xs text-text-muted">
                              <Globe size={10} /> {vendor.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-text-muted">
                        {vendor.contactName && <p>{vendor.contactName}</p>}
                        {vendor.phone && (
                          <p className="flex items-center gap-1">
                            <Phone size={10} /> {vendor.phone}
                          </p>
                        )}
                        {vendor.address && (
                          <p className="flex items-center gap-1">
                            <Building2 size={10} /> {vendor.address}
                          </p>
                        )}
                        {!vendor.contactName && !vendor.phone && !vendor.address && (
                          <p className="flex items-center gap-1">
                            <Mail size={10} /> {vendor.email || "—"}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-text-muted">
                        <Package size={14} className="text-brand-green-dark" /> {vendor.products} Softwares
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={statusToTone(vendor.status)}>{vendor.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={currentPage}
          totalItems={vendors.length}
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
        title="Delete selected vendors"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} loading={bulkDeleting}>
              Delete {selectedCount} vendor{selectedCount === 1 ? "" : "s"}
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
              {selectedCount} vendor{selectedCount === 1 ? "" : "s"}
            </span>
            ? This permanently deletes their user account and unlinks any software they listed. This cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
