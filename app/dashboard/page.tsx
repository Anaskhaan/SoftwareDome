"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Store, Users, FileText, Plus, ArrowRight } from "@/lib/fa-icons";
import { Card, CardHeader } from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Badge, { statusToTone } from "@/components/dashboard/ui/Badge";
import Button from "@/components/dashboard/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { getDashboardSoftwares } from "@/app/dashboard/softwares/actions";
import { getUsers } from "@/app/dashboard/users/actions";
import { getBlogs } from "@/app/dashboard/blogs/actions";
import { getDashboardVendors } from "@/app/dashboard/vendors/actions";

interface ActivityRow {
  id: string;
  type: "Software" | "User" | "Blog";
  title: string;
  meta: string;
  status: string;
  createdAt: string;
  href: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "VENDOR">("ADMIN");
  const [counts, setCounts] = useState({ softwares: 0, vendors: 0, users: 0, blogs: 0 });
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        let role: "ADMIN" | "VENDOR" = "ADMIN";
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.user?.role === "VENDOR") role = "VENDOR";
        }
        setUserRole(role);

        const softwaresRes = await getDashboardSoftwares();
        const softwares = softwaresRes.success ? softwaresRes.data ?? [] : [];

        let users: any[] = [];
        let blogs: any[] = [];
        let vendors: any[] = [];

        if (role === "ADMIN") {
          const [usersRes, blogsRes, vendorsRes] = await Promise.all([
            getUsers(),
            getBlogs(),
            getDashboardVendors(),
          ]);
          users = usersRes.success ? usersRes.data ?? [] : [];
          blogs = blogsRes.success ? blogsRes.data ?? [] : [];
          vendors = vendorsRes.success ? vendorsRes.data ?? [] : [];
        } else {
          const vendorsRes = await getDashboardVendors();
          vendors = vendorsRes.success ? vendorsRes.data ?? [] : [];
        }

        setCounts({
          softwares: softwares.length,
          vendors: vendors.length,
          users: users.length,
          blogs: blogs.length,
        });

        const rows: ActivityRow[] = [
          ...softwares.map((s: any) => ({
            id: s.id,
            type: "Software" as const,
            title: s.name,
            meta: s.category || "Uncategorized",
            status: "Active",
            createdAt: s.createdAt,
            href: `/dashboard/softwares/edit/${s.id}`,
          })),
          ...(role === "ADMIN"
            ? [
                ...users.map((u: any) => ({
                  id: u.id,
                  type: "User" as const,
                  title: u.name || u.email,
                  meta: u.role,
                  status: u.status || "Active",
                  createdAt: u.createdAt,
                  href: `/dashboard/users`,
                })),
                ...blogs.map((b: any) => ({
                  id: b.id,
                  type: "Blog" as const,
                  title: b.title,
                  meta: b.status,
                  status: b.status,
                  createdAt: b.createdAt,
                  href: `/dashboard/blogs/edit/${b.id}`,
                })),
              ]
            : []),
        ]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);

        setActivity(rows);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isVendor = userRole === "VENDOR";

  const stats = isVendor
    ? [
        { label: "My Softwares", value: counts.softwares, icon: Box },
        { label: "My Vendor Profile", value: counts.vendors, icon: Store },
      ]
    : [
        { label: "Total Softwares", value: counts.softwares, icon: Box },
        { label: "Total Vendors", value: counts.vendors, icon: Store },
        { label: "Total Users", value: counts.users, icon: Users },
        { label: "Blog Posts", value: counts.blogs, icon: FileText },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-bold text-primary-navy sm:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm font-medium text-text-muted">
            {isVendor
              ? "Your software listings and vendor profile at a glance."
              : "Live counts across softwares, vendors, users, and content."}
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isVendor ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" noPadding>
          <div className="p-5 sm:p-6">
            <CardHeader
              title="Recent activity"
              subtitle={isVendor ? "Your latest software updates" : "Latest softwares, users, and blog posts added"}
            />
          </div>
          {loading ? (
            <div className="space-y-3 px-5 pb-6 sm:px-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-sunken" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="px-5 pb-6 sm:px-6">
              <EmptyState
                icon={Box}
                title="No activity yet"
                description={
                  isVendor
                    ? "Once you add software, it will show up here."
                    : "Once you add softwares, users, or blog posts, they'll show up here."
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border-subtle border-t border-border-subtle">
              {activity.map((row) => (
                <Link
                  key={`${row.type}-${row.id}`}
                  href={row.href}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-muted sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary-navy">{row.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {row.type} · {row.meta}
                    </p>
                  </div>
                  <Badge tone={statusToTone(row.status)}>{row.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Quick actions"
            subtitle={isVendor ? "Manage your listings and profile" : "Jump straight into common tasks"}
          />
          <div className="space-y-2">
            <Link href="/dashboard/softwares/add">
              <Button variant="secondary" size="md" icon={Plus} className="w-full justify-start">
                Add software
              </Button>
            </Link>
            {!isVendor && (
              <>
                <Link href="/dashboard/users/add">
                  <Button variant="secondary" size="md" icon={Plus} className="w-full justify-start">
                    Add user
                  </Button>
                </Link>
                <Link href="/dashboard/blogs/add">
                  <Button variant="secondary" size="md" icon={Plus} className="w-full justify-start">
                    Write a blog post
                  </Button>
                </Link>
              </>
            )}
            <Link href="/dashboard/vendors">
              <Button variant="ghost" size="md" icon={ArrowRight} iconPosition="right" className="w-full justify-between">
                {isVendor ? "View my vendor profile" : "View vendors"}
              </Button>
            </Link>
            {isVendor && (
              <Link href="/dashboard/edit-profile">
                <Button variant="ghost" size="md" icon={ArrowRight} iconPosition="right" className="w-full justify-between">
                  Edit profile
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
