import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const archived = searchParams.get("archived") === "true";

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      isArchived: archived,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tag && {
        tags: { some: { tag: { name: tag } } },
      }),
    },
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: "Untitled",
      content: "",
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}