"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, Sparkles, Globe, GlobeLock,
  Archive, ArchiveRestore, Trash2, Copy, Loader2
} from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  actionItems: string[];
  isArchived: boolean;
  isPublic: boolean;
  shareId: string | null;
  tags: { tag: { id: string; name: string } }[];
  updatedAt: string;
}

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [generating, setGenerating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch note
  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.note) {
          setNote(data.note);
          setTitle(data.note.title === "Untitled" ? "" : data.note.title);
          setContent(data.note.content);
          setTags(data.note.tags.map((t: { tag: { name: string } }) => t.tag.name));
        }
      });
  }, [id]);

  // Auto-save with debounce
  const saveNote = useCallback(
    async (newTitle: string, newContent: string, newTags: string[]) => {
      setSaving(true);
      setSaved(false);
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle || "Untitled",
          content: newContent,
          tags: newTags,
        }),
      });
      setSaving(false);
      setSaved(true);
    },
    [id]
  );

  const scheduleAutoSave = useCallback(
    (newTitle: string, newContent: string, newTags: string[]) => {
      setSaved(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveNote(newTitle, newContent, newTags);
      }, 1500);
    },
    [saveNote]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    scheduleAutoSave(e.target.value, content, tags);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    scheduleAutoSave(title, e.target.value, tags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        scheduleAutoSave(title, content, newTags);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      scheduleAutoSave(title, content, newTags);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    scheduleAutoSave(title, content, newTags);
  };

  const generateSummary = async () => {
    if (!content || content.trim().length < 20) {
      toast.error("Write more content before generating a summary");
      return;
    }
    setGenerating(true);
    const res = await fetch(`/api/notes/${id}/generate-summary`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to generate summary");
    } else {
      setNote(data.note);
      setTitle(data.note.title);
      toast.success("AI summary generated!");
    }
    setGenerating(false);
  };

  const togglePublic = async () => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !note?.isPublic }),
    });
    const data = await res.json();
    setNote(data.note);
    toast.success(data.note.isPublic ? "Note is now public!" : "Note is now private");
  };

  const toggleArchive = async () => {
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !note?.isArchived }),
    });
    toast.success(note?.isArchived ? "Note restored!" : "Note archived!");
    router.push("/notes");
  };

  const deleteNote = async () => {
    if (!confirm("Delete this note permanently?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    toast.success("Note deleted!");
    router.push("/notes");
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/shared/${note?.shareId}`;
    navigator.clipboard.writeText(link);
    toast.success("Share link copied!");
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#999]" size={20} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto px-6 py-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/notes"
          className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <div className="flex items-center gap-1.5">
          {/* Save status */}
          <span className="text-xs text-[#bbb] mr-2">
            {saving ? "Saving..." : saved ? "Saved" : "Unsaved"}
          </span>

          {/* Generate AI Summary */}
          <button
            onClick={generateSummary}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F0ED] hover:bg-[#E5E5E2] text-[#1a1a1a] text-xs font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {generating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {generating ? "Generating..." : "AI Summary"}
          </button>

          {/* Share toggle */}
          {note.isPublic && (
            <button
              onClick={copyShareLink}
              className="p-1.5 rounded-lg hover:bg-[#F0F0ED] text-[#999] hover:text-[#1a1a1a] transition-all"
              title="Copy share link"
            >
              <Copy size={14} />
            </button>
          )}
          <button
            onClick={togglePublic}
            className="p-1.5 rounded-lg hover:bg-[#F0F0ED] text-[#999] hover:text-[#1a1a1a] transition-all"
            title={note.isPublic ? "Make private" : "Make public"}
          >
            {note.isPublic ? <Globe size={14} /> : <GlobeLock size={14} />}
          </button>

          {/* Archive */}
          <button
            onClick={toggleArchive}
            className="p-1.5 rounded-lg hover:bg-[#F0F0ED] text-[#999] hover:text-[#1a1a1a] transition-all"
            title={note.isArchived ? "Restore" : "Archive"}
          >
            {note.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>

          {/* Delete */}
          <button
            onClick={deleteNote}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#999] hover:text-red-500 transition-all"
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="text-3xl font-semibold text-[#1a1a1a] bg-transparent border-none outline-none placeholder:text-[#ddd] mb-4 w-full"
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#F0F0ED] text-[#666] text-xs rounded-lg"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-[#999] hover:text-[#1a1a1a] ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
          className="text-xs text-[#999] bg-transparent outline-none placeholder:text-[#ccc] min-w-[120px]"
        />
      </div>

      <div className="w-full h-px bg-[#F0F0ED] mb-4" />

      {/* Content */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
        className="flex-1 text-sm text-[#1a1a1a] bg-transparent border-none outline-none resize-none placeholder:text-[#ccc] leading-relaxed"
      />

      {/* AI Summary Panel */}
      {note.summary && (
        <div className="mt-4 p-4 bg-[#F8F8F6] border border-[#E5E5E2] rounded-2xl">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={13} className="text-[#999]" />
            <span className="text-xs font-medium text-[#666]">AI Summary</span>
          </div>
          <p className="text-sm text-[#444] leading-relaxed mb-3">{note.summary}</p>
          {note.actionItems.length > 0 && (
            <>
              <p className="text-xs font-medium text-[#666] mb-1.5">Action Items</p>
              <ul className="space-y-1">
                {note.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#666]">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#999] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}