import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Tag } from "lucide-react";

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const note = await prisma.note.findUnique({
    where: { shareId },
    include: {
      tags: { include: { tag: true } },
      user: { select: { name: true } },
    },
  });

  if (!note || !note.isPublic) notFound();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="border-b border-[#E5E5E2] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L4 7V12C4 16.4 7.4 20.5 12 21C16.6 20.5 20 16.4 20 12V7L12 3Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a]">Peblo Notes</span>
          </div>
          <span className="text-xs text-[#999]">Shared note</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Meta */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-3">
            {note.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#999]">
            <span>By {note.user.name}</span>
            <span>·</span>
            <span>
              Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Tag size={12} className="text-[#bbb]" />
              {note.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 bg-[#F0F0ED] text-[#666] text-xs rounded-lg"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary */}
        {note.summary && (
          <div className="mb-8 p-5 bg-white border border-[#E5E5E2] rounded-2xl">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-[#999]" />
              <span className="text-xs font-medium text-[#666]">AI Summary</span>
            </div>
            <p className="text-sm text-[#444] leading-relaxed mb-3">
              {note.summary}
            </p>
            {note.actionItems.length > 0 && (
              <>
                <p className="text-xs font-medium text-[#666] mb-2">Action Items</p>
                <ul className="space-y-1.5">
                  {note.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#666]">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#999] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Note content */}
        <div className="prose prose-sm max-w-none">
          <div className="text-sm text-[#333] leading-relaxed whitespace-pre-wrap">
            {note.content || "No content."}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E2] mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-[#bbb]">
            Created with{" "}
            <span className="font-medium text-[#999]">Peblo Notes</span>
          </p>
        </div>
      </footer>
    </div>
  );
}