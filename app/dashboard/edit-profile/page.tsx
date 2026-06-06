"use client";

import React from "react";
import { User, Mail, Shield, Building2, Activity } from "lucide-react";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import { isBusinessEmail } from "@/lib/auth-utils";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  organization?: { name: string } | null;
  image?: string | null;
  companyName?: string | null;
  companyEmail?: string | null;
  companyAddress?: string | null;
  companyPhone?: string | null;
};

export default function EditProfilePage() {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    image: "",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyPhone: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          image: data.user.image || "",
          companyName: data.user.companyName || "",
          companyEmail: data.user.companyEmail || "",
          companyAddress: data.user.companyAddress || "",
          companyPhone: data.user.companyPhone || "",
        });
      } catch {
        setError("Failed to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: localPreview }));
    setUploading(true);
    setError(null);
    setSuccess(null);

    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({ ...prev, image: result.url }));
        setSuccess('Image uploaded successfully. Save changes to save to profile.');
      } else {
        setError('Failed to upload image.');
      }
    } catch (err) {
      setError('Network error during image upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (isAdmin && formData.email && !isBusinessEmail(formData.email)) {
      setError("Personal email addresses are not allowed. Please use a business email.");
      setIsSubmitting(false);
      return;
    }

    if (formData.image.startsWith('blob:')) {
      setError('Please wait for the image upload to complete.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
          ...(isAdmin ? { email: formData.email } : {}),
          ...(user?.role === "VENDOR" ? {
            companyName: formData.companyName,
            companyEmail: formData.companyEmail,
            companyAddress: formData.companyAddress,
            companyPhone: formData.companyPhone,
          } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
      setSuccess("Profile updated successfully.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminOutletHeading heading="Edit Profile" />
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <AdminOutletHeading heading="Edit Profile" />
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
          {error || "Unable to load profile."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminOutletHeading heading="Edit Profile" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
          <img
            src={formData.image || "/logo.png"}
            alt="profile-image"
            className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200"
          />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Profile Picture</h4>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a192f] text-white hover:bg-blue-600 rounded-lg text-xs font-bold transition-all">
                {uploading ? "Uploading..." : "Upload Photo"}
              </span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || isSubmitting}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="space-y-2 md:col-span-6 col-span-12">
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
                <User size={13} />
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-6 col-span-12">
            <label className="block text-sm font-semibold text-slate-700">Business Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                className="custom_input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isSubmitting || !isAdmin}
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <Mail size={13} />
              </div>
            </div>
            {!isAdmin && (
              <p className="text-xs text-slate-500">Only admins can change their email address.</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-6 col-span-12">
            <label className="block text-sm font-semibold text-slate-700">Role</label>
            <div className="relative">
              <input
                type="text"
                className="custom_input"
                value={user.role}
                disabled
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <Shield size={13} />
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-6 col-span-12">
            <label className="block text-sm font-semibold text-slate-700">Organization</label>
            <div className="relative">
              <input
                type="text"
                className="custom_input"
                value={user.organization?.name || "—"}
                disabled
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <Building2 size={13} />
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-6 col-span-12">
            <label className="block text-sm font-semibold text-slate-700">Status</label>
            <div className="relative">
              <input
                type="text"
                className="custom_input"
                value={user.status}
                disabled
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <Activity size={13} />
              </div>
            </div>
          </div>
        </div>

        {user.role === "VENDOR" && (
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-[#0a192f]">Company Details</h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="space-y-2 md:col-span-6 col-span-12">
                <label className="block text-sm font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  className="custom_input"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-6 col-span-12">
                <label className="block text-sm font-semibold text-slate-700">Company Email</label>
                <input
                  type="email"
                  className="custom_input"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-6 col-span-12">
                <label className="block text-sm font-semibold text-slate-700">Company Phone</label>
                <input
                  type="tel"
                  className="custom_input"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-6 col-span-12">
                <label className="block text-sm font-semibold text-slate-700">Company Address</label>
                <input
                  type="text"
                  className="custom_input"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="btn btn-navy"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
