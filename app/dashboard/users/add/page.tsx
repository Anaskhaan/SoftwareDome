"use client";

import React from "react";
import { UserPlus, Mail, Shield, AlertCircle } from "lucide-react";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";

import { createUser } from "../actions";
import { isBusinessEmail } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "USER",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createUser(formData);
      if (result.success) {
        router.push("/dashboard/users");
      } else {
        setError(result.error || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminOutletHeading heading="Add User" />

      <div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div className="grid grid-cols-12 gap-4">

              <div className="space-y-2 md:col-span-6 col-span-1">
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className="custom_input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute left-3 top-2.5 text-slate-400">
                    <UserPlus size={13} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-6 col-span-1">
                <label className="block text-sm font-semibold text-slate-700">Business Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="custom_input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute left-3 top-2.5 text-slate-400">
                    <Mail size={13} />
                  </div>
                </div>
              </div>

            <div className="space-y-4 md:col-span-6 col-span-12">
              <label className="block text-sm font-semibold text-slate-700">Access Level</label>
              <div className="relative">
                <select
                  className="custom_input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="USER">User</option>
                  <option value="VENDOR">Vendor</option>
                </select>
                <div className="absolute left-3 top-2 text-slate-400">
                  <Shield size={13} />
                </div>
              </div>
            </div>

            {formData.role === "VENDOR" && (
              <div className="col-span-12 space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-[#0a192f]">Company Details</h3>
                
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-2 md:col-span-6 col-span-12">
                    <label className="block text-sm font-semibold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      className="custom_input"
                      placeholder="Acme Corp"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-6 col-span-12">
                    <label className="block text-sm font-semibold text-slate-700">Company Email</label>
                    <input
                      type="email"
                      className="custom_input"
                      placeholder="contact@company.com"
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-6 col-span-12">
                    <label className="block text-sm font-semibold text-slate-700">Company Phone</label>
                    <input
                      type="tel"
                      className="custom_input"
                      placeholder="+1 (555) 000-0000"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-6 col-span-12">
                    <label className="block text-sm font-semibold text-slate-700">Company Address</label>
                    <input
                      type="text"
                      className="custom_input"
                      placeholder="123 Corporate Blvd"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/users")}
                className="btn btn-hero-primary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-navy"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
