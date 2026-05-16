"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      setLoading(false);
      return;
    }

    // Auto sign-in after signup
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success("Account created! Welcome to Peblo Notes.");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1a1a1a] mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 7V12C4 16.4 7.4 20.5 12 21C16.6 20.5 20 16.4 20 12V7L12 3Z"
                fill="white" fillOpacity="0.9"/>
              <path d="M9 12L11 14L15 10" stroke="#1a1a1a" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a] tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-[#888] mt-1">Start your AI notes workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#444] mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E2] bg-white text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#444] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E2] bg-white text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#444] mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E2] bg-white text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#888] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1a1a1a] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}