"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Tag, X } from "lucide-react";
import { toast } from "sonner";
import NoteCard from "@/components/notes/NoteCard";

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  isArchived: boolean;
  isPublic: boolean;
  shareId: string | null;
  actionItems: string[];
  tags: { tag: { id: string; name: string } }[];
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const archived = searchParams.get("archived") === "true";

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeTag) params.set("tag", activeTag);
    if (archived) params.set("archived", "true");

    const res = await fetch(`/api/notes?${params.toString()}`);
    const data = await res.json();
    setNotes(data.notes || []);
    setLoading(false);
  }, [search, activeTag, archived]);

  useEffect(() => {
    const debounce = setTimeout(fetchNotes, 300);
    return () => clearTimeout(debounce);
  }, [fetchNotes]);

  const createNote = async () => {
    setCreating(true);
    const res = await fetch("/api/notes", { method: "POST" });
    const data = await res.json();
    if (data.note) {
      toast.success("Note created!");
      router.push(`/notes/${data.note.id}`);
    }
    setCreating(false);
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags.map((t) => t.tag.name)))
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
         <h1 className="text-xl font-semibold text-zinc-100">
            {archived ? "Archived Notes" : "My Notes"}
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <button
          onClick={createNote}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
        >
          <Plus size={15} />
          {creating ? "Creating..." : "New note"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
         className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
        />
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Tag size={13} className="text-[#999]" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTag === tag
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              {activeTag === tag && <X size={10} className="inline mr-1" />}
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-white border border-[#E5E5E2] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#999] text-sm">
            {search || activeTag ? "No notes match your search" : "No notes yet — create your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onUpdate={fetchNotes} />
          ))}
        </div>
      )}
      {/* Keyboard shortcuts hint */}
<div className="fixed bottom-6 right-6 text-xs text-[#ccc] dark:text-[#444] space-y-1 hidden md:block">
  <p>⌘S · Save &nbsp; ⌘⇧N · New note &nbsp; ⌘⇧P · Preview</p>
</div>
    </div>
  );
}