"use client";

import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  isArchived: boolean;
  isPublic: boolean;
  tags: { tag: { id: string; name: string } }[];
  updatedAt: string;
}

export default function NoteCard({
  note,
  onUpdate,
}: {
  note: Note;
  onUpdate: () => void;
}) {
  const router = useRouter();

  const archive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !note.isArchived }),
    });
    toast.success(note.isArchived ? "Note restored!" : "Note archived!");
    onUpdate();
  };

  const deleteNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this note permanently?")) return;
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    toast.success("Note deleted!");
    onUpdate();
  };

  return (
    <div
      onClick={() => router.push(`/notes/${note.id}`)}
      className="group bg-white border border-[#E5E5E2] rounded-2xl p-5 cursor-pointer hover:border-[#ccc] hover:shadow-sm transition-all"
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-[#1a1a1a] text-sm leading-snug line-clamp-1">
          {note.title || "Untitled"}
        </h3>
        {note.isPublic && (
          <Globe size={12} className="text-[#999] shrink-0 mt-0.5" />
        )}
      </div>

      {/* Content preview */}
      <p className="text-xs text-[#999] line-clamp-3 mb-3 leading-relaxed">
        {note.summary || note.content || "No content yet..."}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 bg-[#F0F0ED] text-[#666] text-xs rounded-md"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#bbb]">
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={archive}
            className="p-1.5 rounded-lg hover:bg-[#F0F0ED] text-[#999] hover:text-[#1a1a1a] transition-all"
          >
            {note.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          </button>
          <button
            onClick={deleteNote}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#999] hover:text-red-500 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}