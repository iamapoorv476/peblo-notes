import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalNotes,
    archivedNotes,
    recentNotes,
    aiUsageCount,
    weeklyNotes,
    allNotes,
  ] = await Promise.all([
    prisma.note.count({ where: { userId, isArchived: false } }),
    prisma.note.count({ where: { userId, isArchived: true } }),
    prisma.note.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.aIUsage.count({ where: { userId } }),
    prisma.note.count({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.note.findMany({
      where: { userId },
      include: { tags: { include: { tag: true } } },
    }),
  ]);

  // Calculate most used tags
  const tagCounts: Record<string, number> = {};
  allNotes.forEach((note) => {
    note.tags.forEach(({ tag }) => {
      tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Weekly activity (last 7 days)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split("T")[0];
    const count = allNotes.filter((n) => {
      return n.createdAt.toISOString().split("T")[0] === dayStr;
    }).length;
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      count,
    };
  });

  return NextResponse.json({
    totalNotes,
    archivedNotes,
    recentNotes,
    aiUsageCount,
    weeklyNotes,
    topTags,
    weeklyActivity,
  });
}