import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNoteInsights } from "@/lib/claude";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const note = await prisma.note.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.content || note.content.trim().length < 20) {
      return NextResponse.json(
        { error: "Note content is too short to summarize" },
        { status: 400 }
      );
    }

    const insights = await generateNoteInsights(note.content, note.title);

    const updated = await prisma.note.update({
      where: { id },
      data: {
        summary: insights.summary,
        actionItems: insights.action_items,
        title: insights.suggested_title ?? note.title,
        aiUsages: {
          create: {
            userId: session.user.id,
            type: "summary",
          },
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({ note: updated, insights });
  } catch (error) {
    console.error("[GENERATE_SUMMARY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate summary. Check your API key." },
      { status: 500 }
    );
  }
}