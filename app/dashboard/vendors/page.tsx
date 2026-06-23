"use client";

import React from "react";
import { Store, Globe, Package, Mail, Phone, Building2 } from "@/lib/fa-icons";
import { getDashboardVendors } from "./actions";
import { Card } from "@/components/dashboard/ui/Card";
import Badge, { statusToTone } from "@/components/dashboard/ui/Badge";
import EmptyState from "@/components/dashboard/ui/EmptyState";

export default function VendorsPage() {
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isVendorView, setIsVendorView] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="space-y-6">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border-subtle bg-surface-muted/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Vendor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Products</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="transition-colors hover:bg-surface-muted/50">
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
      </Card>
    </div>
  );
}
