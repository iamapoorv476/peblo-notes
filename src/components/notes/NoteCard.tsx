"use client";

import { useState } from "react";
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
  const [deleted, setDeleted] = useState(false);
  const [archiving, setArchiving] = useState(false);

  if (deleted) return null;

  const archive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setArchiving(true);
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !note.isArchived }),
    });
    toast.success(note.isArchived ? "Note restored!" : "Note archived!");
    onUpdate();
    setArchiving(false);
  };

  const deleteNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this note permanently?")) return;
    // Optimistic update — hide immediately
    setDeleted(true);
    toast.success("Note deleted!");
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
  };

  return (
    <div
      onClick={() => router.push(`/notes/${note.id}`)}
      className={`group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/60 transition-all ${archiving ? "opacity-50" : ""}`}
    
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-zinc-100 text-sm leading-snug line-clamp-1">
          {note.title || "Untitled"}
        </h3>
        {note.isPublic && (
          <Globe size={12} className="text-zinc-500 shrink-0 mt-0.5" />
        )}
      </div>

      <p className="text-xs text-zinc-400 line-clamp-3 mb-3 leading-relaxed">
        {note.summary || note.content || "No content yet..."}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-xs rounded-md border border-zinc-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={archive}
            className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-600 hover:text-zinc-200 transition-all"
          >
            {note.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          </button>
          <button
            onClick={deleteNote}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}