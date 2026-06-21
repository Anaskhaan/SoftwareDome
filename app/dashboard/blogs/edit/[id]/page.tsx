"use client";

import React from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import { getBlogById, updateBlog } from "../../actions";
import { useRouter, useParams } from "next/navigation";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "DRAFT",
    metaTitle: "",
    metaDescription: "",
    tags: "",
  });

  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [existingCover, setExistingCover] = React.useState<string | null>(null);
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function loadBlog() {
      if (!id) return;
      const result = await getBlogById(id);
      if (result.success && result.data) {
        const blog = result.data;
        setForm({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || "",
          content: blog.content,
          status: blog.status,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          tags: blog.tags.join(", "),
        });
        setExistingCover(blog.coverImage);
        setExistingImages(blog.images || []);
      } else {
        setError(result.error || "Blog not found");
      }
      setIsLoading(false);
    }
    loadBlog();
  }, [id]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewGalleryItem = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("slug", form.slug);
    formData.append("excerpt", form.excerpt);
    formData.append("content", form.content);
    formData.append("status", form.status);
    formData.append("metaTitle", form.metaTitle);
    formData.append("metaDescription", form.metaDescription);
    formData.append(
      "tags",
      JSON.stringify(
        form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    formData.append("existingCoverImage", coverPreview ? "" : existingCover || "");
    formData.append("existingImages", JSON.stringify(existingImages));

    if (coverFile) formData.append("coverImage", coverFile);
    galleryFiles.forEach((file) => formData.append("images", file));

    try {
      const result = await updateBlog(id, formData);
      if (result.success) {
        router.push("/dashboard/blogs");
      } else {
        setError(result.error || "Failed to update blog");
        window.scrollTo(0, 0);
      }
    } catch {
      setError("An unexpected error occurred.");
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0a192f] rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading blog...</p>
      </div>
    );
  }

  const displayCover = coverPreview || existingCover;

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminOutletHeading heading="Edit Blog Post" />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Basic info</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Excerpt</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="saas, productivity, ai"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Content</h3>
          <textarea
            required
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
          />
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Media</h3>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover image</label>
            <div className="flex flex-wrap items-start gap-4">
              {displayCover && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={displayCover} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                      setExistingCover(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gallery images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((src, idx) => (
                <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {galleryPreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryItem(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Plus size={18} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryChange}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">SEO</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Meta title</label>
              <input
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Meta description</label>
              <textarea
                rows={3}
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[#0a192f] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/blogs")}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
