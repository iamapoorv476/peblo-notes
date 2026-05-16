"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Archive, Sparkles,
  TrendingUp, Plus, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Insights {
  totalNotes: number;
  archivedNotes: number;
  aiUsageCount: number;
  weeklyNotes: number;
  topTags: { name: string; count: number }[];
  weeklyActivity: { day: string; count: number }[];
  recentNotes: {
    id: string;
    title: string;
    updatedAt: string;
    tags: { tag: { name: string } }[];
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((data) => {
        setInsights(data);
        setLoading(false);
      });
  }, []);

  const createNote = async () => {
    const res = await fetch("/api/notes", { method: "POST" });
    const data = await res.json();
    if (data.note) router.push(`/notes/${data.note.id}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-[#E5E5E2] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(...(insights?.weeklyActivity.map((d) => d.count) || [1]), 1);

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#999] mt-0.5">Your productivity at a glance</p>
        </div>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-medium rounded-xl transition-all"
        >
          <Plus size={15} />
          New note
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Notes",
            value: insights?.totalNotes ?? 0,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "This Week",
            value: insights?.weeklyNotes ?? 0,
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "AI Summaries",
            value: insights?.aiUsageCount ?? 0,
            icon: Sparkles,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            label: "Archived",
            value: insights?.archivedNotes ?? 0,
            icon: Archive,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E5E5E2] rounded-2xl p-5"
          >
            <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-semibold text-[#1a1a1a]">{stat.value}</p>
            <p className="text-xs text-[#999] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white border border-[#E5E5E2] rounded-2xl p-5">
          <h2 className="text-sm font-medium text-[#1a1a1a] mb-4">
            Weekly Activity
          </h2>
          <div className="flex items-end gap-2 h-24">
            {insights?.weeklyActivity.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#1a1a1a] rounded-sm transition-all"
                  style={{
                    height: `${Math.max((day.count / maxActivity) * 80, day.count > 0 ? 8 : 2)}px`,
                    opacity: day.count > 0 ? 1 : 0.1,
                  }}
                />
                <span className="text-[10px] text-[#bbb]">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white border border-[#E5E5E2] rounded-2xl p-5">
          <h2 className="text-sm font-medium text-[#1a1a1a] mb-4">
            Most Used Tags
          </h2>
          {insights?.topTags.length === 0 ? (
            <p className="text-xs text-[#bbb]">No tags yet — add tags to your notes!</p>
          ) : (
            <div className="space-y-2">
              {insights?.topTags.map((tag) => (
                <div key={tag.name} className="flex items-center gap-3">
                  <span className="text-xs text-[#666] w-20 truncate">{tag.name}</span>
                  <div className="flex-1 h-1.5 bg-[#F0F0ED] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a1a1a] rounded-full"
                      style={{
                        width: `${(tag.count / (insights?.topTags[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#bbb] w-4 text-right">{tag.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white border border-[#E5E5E2] rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-medium text-[#1a1a1a] mb-4">
            Recently Edited
          </h2>
          {insights?.recentNotes.length === 0 ? (
            <p className="text-xs text-[#bbb]">No notes yet — create your first one!</p>
          ) : (
            <div className="space-y-2">
              {insights?.recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F8F6] cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-[#bbb]" />
                    <span className="text-sm text-[#1a1a1a] font-medium">
                      {note.title}
                    </span>
                    {note.tags.slice(0, 2).map(({ tag }) => (
                      <span
                        key={tag.name}
                        className="px-2 py-0.5 bg-[#F0F0ED] text-[#666] text-xs rounded-md"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#bbb]">
                    <Clock size={11} />
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}