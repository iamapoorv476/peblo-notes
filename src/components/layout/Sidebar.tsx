"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Archive,
  LogOut,
  PenSquare,
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
    <aside className="w-60 h-full bg-white border-r border-[#E5E5E2] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E5E2]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <PenSquare size={13} className="text-white" />
          </div>
          <span className="font-semibold text-[#1a1a1a] text-sm tracking-tight">
            Peblo Notes
          </span>
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#F0F0ED] text-[#1a1a1a] font-medium"
                  : "text-[#666] hover:bg-[#F5F5F3] hover:text-[#1a1a1a]"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#E5E5E2]">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-[#1a1a1a] truncate">{user.name}</p>
          <p className="text-xs text-[#999] truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#666] hover:bg-[#F5F5F3] hover:text-[#1a1a1a] transition-all w-full"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}