"use client";

import React from "react";
import Link from "next/link";
import { Search, Edit2, Trash2, Box, AlertCircle } from "@/lib/fa-icons";
import AdminOutletBtnHeading from "@/components/dashboard/AdminOutletBtnHeading";
import { getSoftwares, deleteSoftware } from "./actions";
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

  return (
    <div className="space-y-6">
      <AdminOutletBtnHeading
        heading="Softwares"
        subtitle="Manage your software listings and reviews."
        btnText="Add New Software"
        btnUrl="/dashboard/softwares/add"
      />

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
          <span className="text-xs font-semibold text-text-muted">
            {filtered.length} of {softwares.length} listings
          </span>
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
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Software</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Rating</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Created At</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((software) => (
                  <tr key={software.id} className="transition-colors hover:bg-surface-muted">
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
                          <span className="text-xs text-text-muted">{software.website || "No website"}</span>
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
    </div>
  );
}
