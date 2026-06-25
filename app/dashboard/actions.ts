"use server";

import prisma from "@/lib/prisma";
import { getDashboardSession, isAdmin } from "@/lib/require-dashboard";

const MONTHS_BACK = 6;

type MonthBucket = { date: Date; key: string; label: string };

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildMonthBuckets(): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ date, key: monthKey(date), label: date.toLocaleDateString("en-US", { month: "short" }) });
  }
  return buckets;
}

function countByMonth(dates: Date[], buckets: MonthBucket[]): number[] {
  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const date of dates) {
    const key = monthKey(date);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((b) => counts.get(b.key) ?? 0);
}

export async function getDashboardAnalytics() {
  try {
    const session = await getDashboardSession();
    if (!session) {
      return { success: false, error: "Not authenticated." };
    }

    const admin = isAdmin(session);
    const buckets = buildMonthBuckets();
    const since = buckets[0].date;

    const softwareWhere = admin
      ? { createdAt: { gte: since } }
      : { vendorId: session.userId, createdAt: { gte: since } };
    const demoRequestWhere = admin
      ? { createdAt: { gte: since } }
      : { createdAt: { gte: since }, software: { vendorId: session.userId } };

    const [softwareDates, demoRequestDates, userDates] = await Promise.all([
      prisma.software.findMany({ where: softwareWhere, select: { createdAt: true } }),
      prisma.demoRequest.findMany({ where: demoRequestWhere, select: { createdAt: true } }),
      admin
        ? prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } })
        : Promise.resolve([]),
    ]);

    const softwareCounts = countByMonth(softwareDates.map((s) => s.createdAt), buckets);
    const demoCounts = countByMonth(demoRequestDates.map((d) => d.createdAt), buckets);
    const userCounts = admin ? countByMonth(userDates.map((u) => u.createdAt), buckets) : null;

    const trend = buckets.map((b, i) => ({
      label: b.label,
      softwares: softwareCounts[i],
      demoRequests: demoCounts[i],
      ...(userCounts ? { users: userCounts[i] } : {}),
    }));

    const categoryGroups = await prisma.software.groupBy({
      by: ["category"],
      where: admin ? undefined : { vendorId: session.userId },
      _count: true,
    });
    const categoryBreakdown = categoryGroups
      .map((g) => ({ category: g.category || "Uncategorized", count: g._count as unknown as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    let blogStatusBreakdown: { status: string; count: number }[] | null = null;
    let topVendors: { name: string; count: number }[] | null = null;

    if (admin) {
      const blogGroups = await prisma.blog.groupBy({ by: ["status"], _count: true });
      blogStatusBreakdown = blogGroups.map((g) => ({
        status: g.status,
        count: g._count as unknown as number,
      }));

      const vendorGroups = await prisma.software.groupBy({ by: ["vendorId"], _count: true });
      const rankedVendorGroups = vendorGroups
        .filter((v) => v.vendorId)
        .sort((a, b) => (b._count as unknown as number) - (a._count as unknown as number))
        .slice(0, 5);
      const vendors = rankedVendorGroups.length
        ? await prisma.user.findMany({
            where: { id: { in: rankedVendorGroups.map((v) => v.vendorId as string) } },
            select: { id: true, name: true, companyName: true, email: true },
          })
        : [];
      const vendorNameById = new Map(vendors.map((v) => [v.id, v.companyName || v.name || v.email]));
      topVendors = rankedVendorGroups.map((v) => ({
        name: vendorNameById.get(v.vendorId as string) || "Unknown",
        count: v._count as unknown as number,
      }));
    }

    return {
      success: true,
      data: { trend, categoryBreakdown, blogStatusBreakdown, topVendors, isAdmin: admin },
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return { success: false, error: "Failed to fetch dashboard analytics." };
  }
}
