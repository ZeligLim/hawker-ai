'use client';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

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

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const roleLabel = roles.isSaasOwner ? 'SaaS Owner' : 'Superadmin';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-black/[0.08] sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-[#1d1d1f]">Hawker Admin</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/5 text-[#6e6e73] border border-black/[0.06]">
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSignOutDialogOpen(true)}
          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>



      {/* Desktop Sidebar Navigation Shell */}
      <aside
        className="hidden md:flex sticky top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-[#fbfbfd]/90 backdrop-blur-xl border-r border-black/[0.08] flex-col"
        style={{ height: '100vh' }}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base text-[#1d1d1f] tracking-tight">Hawker Platform</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-medium text-[#6e6e73] bg-black/[0.04] border border-black/[0.06] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-xs font-semibold text-[#86868b] mb-1.5">
              Control plane
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1d1d1f] text-white shadow-xs font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6e6e73]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold text-[#86868b] mb-1.5">
              Cross-app portals
            </p>
            <div className="space-y-1">
              <Link
                href={'/home' as any}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>Diner App (Customer)</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#86868b]" />
              </Link>
              <Link
                href={'/shop-owner/booths' as any}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>Food Hall Operator Portal</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#86868b]" />
              </Link>
            </div>
          </div>
        </div>

        {/* User Identity & Sign Out Footer */}
        <div className="p-3 border-t border-black/[0.06] bg-white md:bg-transparent">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/[0.03] border border-black/[0.06]">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                {user?.email ?? 'Superadmin'}
              </p>
              <p className="text-[11px] text-[#86868b] truncate">
                {roleLabel} &bull; Cross-Tenant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSignOutDialogOpen(true)}
              className="p-2 rounded-xl text-[#86868b] hover:text-red-600 hover:bg-red-50 transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#f5f5f7] flex flex-col pb-20 md:pb-0">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      <div className="md:hidden">
        <ClientBottomNav
          items={navItems}
          theme="owner"
          ariaLabel="Admin Navigation"
        />
      </div>

      {/* Sign Out Confirmation Modal */}
      {isSignOutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-[#1d1d1f] shadow-2xl border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">Sign out of Superadmin?</h3>
            <p className="mt-2 text-xs text-[#6e6e73] leading-relaxed">
              You will be signed out from your active platform session. You will need to re-authenticate with superadmin credentials to regain access.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSignOutDialogOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignOutDialogOpen(false);
                  void signOut();
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition"
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
