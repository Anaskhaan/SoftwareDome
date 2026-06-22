"use client";

import { Settings } from "@/lib/fa-icons";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import EmptyState from "@/components/dashboard/ui/EmptyState";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminOutletHeading heading="Settings" subtitle="Account and platform configuration." />
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Platform configuration options for SoftwareDome will appear here."
      />
    </div>
  );
}
