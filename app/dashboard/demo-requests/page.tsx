"use client";

import React from "react";
import { Calendar, Mail, Phone, Building2, Box } from "@/lib/fa-icons";
import { getDashboardDemoRequests } from "./actions";
import { Card } from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";

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
  const [requests, setRequests] = React.useState<DemoRequestRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-brand text-2xl font-bold text-primary-navy">Demo Requests</h2>
        <p className="text-sm text-text-muted">
          Leads submitted through the &quot;Watch a free demo&quot; form on each software page.
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
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No demo requests yet"
            description="Requests submitted from software pages will show up here, along with which software each one is for."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border-subtle bg-surface-muted/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Organization</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Software</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-text-muted">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {requests.map((req) => (
                  <tr key={req.id} className="transition-colors hover:bg-surface-muted/50">
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
      </Card>
    </div>
  );
}
