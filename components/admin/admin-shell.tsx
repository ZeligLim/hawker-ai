'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  LayoutDashboard,
  Percent,
  Building2,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Store,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

const navItems = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/monetization',
    label: 'Monetization & Fees',
    icon: Percent,
    exact: false,
  },
  {
    href: '/admin/shops',
    label: 'Venues & Food Halls',
    icon: Building2,
    exact: false,
  },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { user, roles, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const roleLabel = roles.isSaasOwner ? 'SaaS Owner' : 'Superadmin';

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#111827] border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">Hawker SaaS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Admin
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar Navigation Shell */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-72 bg-[#0e1424] border-r border-white/10 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ height: '100vh' }}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">Hawker Platform</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Platform Control Plane
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Cross-App Portals
            </p>
            <div className="space-y-1">
              <Link
                href={'/home' as any}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Diner App (Customer)</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </Link>
              <Link
                href={'/shop-owner/booths' as any}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Food Hall Operator Portal</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* User Identity & Sign Out Footer */}
        <div className="p-3 border-t border-white/10 bg-[#0a0f1d]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-xs font-medium text-white truncate">
                {user?.email ?? 'Superadmin'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {roleLabel} &bull; Cross-Tenant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSignOutDialogOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#090d16] flex flex-col">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Sign Out Confirmation Modal */}
      {isSignOutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#111827] p-6 text-white shadow-2xl border border-white/10">
            <h3 className="text-lg font-bold tracking-tight">Sign out of Superadmin?</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              You will be signed out from your active platform session. You will need to re-authenticate with superadmin credentials to regain access.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSignOutDialogOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignOutDialogOpen(false);
                  void signOut();
                }}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-500 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
