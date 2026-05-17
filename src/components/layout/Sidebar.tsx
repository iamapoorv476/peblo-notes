"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText,
  Archive, LogOut, PenSquare,
} from "lucide-react";


interface SidebarProps {
  user: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/notes?archived=true", label: "Archived", icon: Archive },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
              <PenSquare size={13} className="text-zinc-900" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">
              Peblo Notes
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href.split("?")[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 mx-1 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 pt-5 pb-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3 px-1">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-zinc-300">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          {/* Name + Email */}
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">
              {user.name}
            </p>
           <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}