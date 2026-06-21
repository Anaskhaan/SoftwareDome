"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminOutletBtnHeading from "@/components/dashboard/AdminOutletBtnHeading";
import { deleteBlog, getBlogs } from "./actions";

type BlogRecord = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null; email: string };
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-100",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function BlogsPage() {
  const [blogs, setBlogs] = React.useState<BlogRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchBlogs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getBlogs(search || undefined, statusFilter || undefined);
    if (result.success) {
      setBlogs((result.data as unknown as BlogRecord[]) || []);
    } else {
      setError(result.error || "Failed to load blogs");
    }
    setIsLoading(false);
  }, [search, statusFilter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBlogs]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const result = await deleteBlog(id);
    if (result.success) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert(result.error || "Failed to delete blog");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <AdminOutletBtnHeading heading="Blogs List" btnText="Add New Blog" btnUrl="/dashboard/blogs/add" />

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0a192f] rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading blogs...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-2xl mb-3">
                <AlertCircle size={24} />
              </div>
              <p className="text-slate-900 font-semibold">{error}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3">
                <FileText size={24} />
              </div>
              <p className="text-slate-900 font-semibold">No blogs found</p>
              <p className="text-sm text-slate-500 mt-1">Get started by writing your first blog post.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Blog</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Tags</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Updated</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                          {blog.coverImage ? (
                            <img src={blog.coverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <FileText size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 truncate">{blog.title}</span>
                          <span className="text-xs text-slate-500 truncate">/{blog.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${statusStyles[blog.status]}`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {blog.tags.length > 0 ? (
                          blog.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium">
                        {new Date(blog.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/blogs/edit/${blog.id}`}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog.id, blog.title)}
                          disabled={deletingId === blog.id}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
                        >
                          {deletingId === blog.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
