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

const statCards = (insights: Insights) => [
  {
    label: "Total Notes",
    value: insights.totalNotes,
    icon: FileText,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
    trend: null,
  },
  {
    label: "This Week",
    value: insights.weeklyNotes,
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    trend: "notes created",
  },
  {
    label: "AI Summaries",
    value: insights.aiUsageCount,
    icon: Sparkles,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10",
    trend: null,
  },
  {
    label: "Archived",
    value: insights.archivedNotes,
    icon: Archive,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    trend: null,
  },
];

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const maxActivity = Math.max(
    ...insights.weeklyActivity.map((d) => d.count),
    1
  );

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Your productivity at a glance
          </p>
        </div>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-medium rounded-xl transition-all"
        >
          <Plus size={14} />
          New note
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards(insights).map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
          >
            {/* Icon + Label row */}
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                <stat.icon size={13} className={stat.iconColor} />
              </div>
              <span className="text-xs font-medium text-zinc-500">
                {stat.label}
              </span>
            </div>
            {/* Value */}
            <p className="text-3xl font-semibold text-zinc-100 leading-none">
              {stat.value}
            </p>
            {/* Trend */}
            {stat.trend && (
              <p className="text-xs text-zinc-500">{stat.trend}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Weekly Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs font-medium text-zinc-400 mb-5 uppercase tracking-widest">
            Weekly Activity
          </p>
          <div className="flex items-end gap-2 h-20">
            {insights.weeklyActivity.map((day) => {
  const heightPct = day.count > 0
    ? Math.max((day.count / maxActivity) * 100, 15)
    : 0;
  return (
    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
      <div className="w-full flex-1 relative flex items-end rounded-sm overflow-hidden">
        {/* Empty track — always visible */}
        <div className="absolute inset-0 bg-zinc-800/50 rounded-sm" />
        {/* Active bar — only renders if count > 0 */}
        {day.count > 0 && (
          <div
            className="relative w-full bg-zinc-400 rounded-sm transition-all duration-500"
            style={{ height: `${heightPct}%` }}
          />
        )}
      </div>
      <span className="text-[10px] text-zinc-500 font-medium">
        {day.day}
      </span>
    </div>
  );
})}
          </div>
        </div>

        {/* Most Used Tags */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs font-medium text-zinc-400 mb-5 uppercase tracking-widest">
            Most Used Tags
          </p>
          {insights.topTags.length === 0 ? (
            <p className="text-xs text-zinc-600">
              No tags yet — add tags to your notes!
            </p>
          ) : (
            <div className="space-y-3.5">
              {insights.topTags.map((tag) => {
                const maxCount = Math.max(...insights.topTags.map((t) => t.count), 1);
                const pct = Math.round((tag.count / maxCount) * 100);
                return (
                  <div key={tag.name} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-16 truncate shrink-0">
                      {tag.name}
                    </span>
                    {/* Track */}
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-zinc-600 w-4 text-right shrink-0">
                      {tag.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recently Edited */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-widest">
          Recently Edited
        </p>
        {insights.recentNotes.length === 0 ? (
          <p className="text-xs text-zinc-600">
            No notes yet — create your first one!
          </p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {insights.recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="flex items-center justify-between py-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText
                    size={13}
                    className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors"
                  />
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors truncate">
                    {note.title}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    {note.tags.slice(0, 2).map(({ tag }) => (
                      <span
                        key={tag.name}
                        className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[11px] rounded-md"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 shrink-0 ml-4">
                  <Clock size={11} />
                  {formatDistanceToNow(new Date(note.updatedAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}