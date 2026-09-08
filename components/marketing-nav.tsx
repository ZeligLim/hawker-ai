'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ClipboardList,
  CookingPot,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  PlusCircle,
  Store,
  User as UserIcon,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

interface MarketingNavProps {
  currentPath?: string;
}

export function MarketingNav({ currentPath = '/' }: MarketingNavProps) {
  const router = useRouter();
  const { user, status, profile, roles, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dashboardDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (dashboardDropdownRef.current && !dashboardDropdownRef.current.contains(event.target as Node)) {
        setDashboardDropdownOpen(false);
      }
    }

    if (accountDropdownOpen || dashboardDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountDropdownOpen, dashboardDropdownOpen]);

  // Close menus on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setAccountDropdownOpen(false);
        setDashboardDropdownOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAuthenticated = status === 'authenticated' && Boolean(user);
  const isLoading = status === 'loading';

  // Role capability checks
  const hasShop = roles.hasShopOwner;
  const hasStall = roles.hasBooth;
  const hasDashboard = hasShop || hasStall;
  const hasBoth = hasShop && hasStall;

  const displayName =
    profile?.displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Account';

  const userEmail = user?.email || profile?.email || '';

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || 'H';

  const handleSignOut = async () => {
    setAccountDropdownOpen(false);
    setDashboardDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/85 border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Hawker</span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#1d1d1f]/75">
          <Link href="/#product" className="hover:text-[#1d1d1f] transition-colors">Platform</Link>
          <Link href="/#features" className="hover:text-[#1d1d1f] transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-[#1d1d1f] transition-colors">How It Works</Link>
          <Link href="/#intelligence" className="hover:text-[#1d1d1f] transition-colors">AI Discovery</Link>
          <Link href="/#faq" className="hover:text-[#1d1d1f] transition-colors">FAQ</Link>
          <Link href="/#roles" className="hover:text-[#1d1d1f] transition-colors">Solutions</Link>
          <Link
            href="/pricing"
            className={`transition-colors ${currentPath === '/pricing' || currentPath === '/plans' ? 'text-[#1d1d1f] font-semibold' : 'hover:text-[#1d1d1f]'}`}
          >
            Pricing
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-full bg-black/5 animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-black/5 animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <>
              {/* Only show 'Start Free' if shop onboarding is NOT completed */}
              {!roles.hasShopOwner && (
                <Link
                  href={'/apply' as any}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/15 px-3.5 py-1.5 rounded-full transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Start Free
                </Link>
              )}

              {/* Only show 'Dashboard' if shop onboarding OR stall setup completed */}
              {hasDashboard && (
                hasBoth ? (
                  /* Both Shop and Booth: Show Dropdown */
                  <div className="relative" ref={dashboardDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setDashboardDropdownOpen((prev) => !prev);
                        setAccountDropdownOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1d1d1f] hover:bg-black px-3.5 py-1.5 rounded-full shadow-sm transition-all"
                      aria-expanded={dashboardDropdownOpen}
                      aria-haspopup="menu"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                      <ChevronDown
                        className={`w-3 h-3 text-white/70 transition-transform ${dashboardDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {dashboardDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.12)] py-1.5 text-xs text-[#1d1d1f] z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-1.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/[0.04]">
                          Choose Workspace
                        </div>
                        <Link
                          href="/shop-owner/booths"
                          onClick={() => setDashboardDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-black/[0.04] transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[#1d1d1f] leading-snug">Shop Dashboard</p>
                            <p className="text-[10px] text-[#86868b] truncate">{roles.shops?.[0]?.name || 'Food Hall Venue'}</p>
                          </div>
                        </Link>
                        <Link
                          href="/owner/orders"
                          onClick={() => setDashboardDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-black/[0.04] transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#ff9500]/10 text-[#d97706] flex items-center justify-center shrink-0">
                            <CookingPot className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[#1d1d1f] leading-snug">Stall Kitchen (KDS)</p>
                            <p className="text-[10px] text-[#86868b] truncate">{roles.booths?.[0]?.name || 'Live Tickets & Menu'}</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : hasShop ? (
                  /* Only Shop Owner */
                  <Link
                    href="/shop-owner/booths"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1d1d1f] hover:bg-black px-3.5 py-1.5 rounded-full shadow-sm transition-all"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Shop Dashboard
                  </Link>
                ) : (
                  /* Only Stall Worker */
                  <Link
                    href="/owner/orders"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1d1d1f] hover:bg-black px-3.5 py-1.5 rounded-full shadow-sm transition-all"
                  >
                    <CookingPot className="w-3.5 h-3.5" />
                    Stall Kitchen
                  </Link>
                )
              )}

              {/* Account Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountDropdownOpen((prev) => !prev);
                    setDashboardDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-black/10 bg-white hover:bg-black/[0.03] transition-all text-xs font-medium text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  aria-expanded={accountDropdownOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-[10px]">
                    {initials}
                  </div>
                  <span className="max-w-[110px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#6e6e73] transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.12)] py-2 text-xs text-[#1d1d1f] z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-black/[0.06]">
                      <p className="font-semibold text-[#1d1d1f] truncate">{displayName}</p>
                      {userEmail && <p className="text-[11px] text-[#6e6e73] truncate">{userEmail}</p>}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#30d158]/15 text-[#248a3d]">
                          {roles.hasShopOwner && roles.hasBooth
                            ? 'Shop Owner & Merchant'
                            : roles.hasShopOwner
                              ? 'Shop Owner'
                              : roles.hasBooth
                                ? 'Stall Merchant'
                                : 'Diner'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {roles.hasShopOwner && (
                        <Link
                          href="/shop-owner/booths"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.04] transition-colors"
                        >
                          <Store className="w-4 h-4 text-[#6e6e73]" />
                          <span>Shop Management</span>
                        </Link>
                      )}
                      {roles.hasBooth && (
                        <Link
                          href="/owner"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.04] transition-colors"
                        >
                          <CookingPot className="w-4 h-4 text-[#6e6e73]" />
                          <span>Kitchen KDS & Orders</span>
                        </Link>
                      )}
                      <Link
                        href="/home"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.04] transition-colors"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-[#6e6e73]" />
                        <span>Diner Food Discovery</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.04] transition-colors"
                      >
                        <ClipboardList className="w-4 h-4 text-[#6e6e73]" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/[0.04] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#6e6e73]" />
                        <span>Profile & Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-black/[0.06]">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#ff3b30] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-xs font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-all"
              >
                Sign In
              </Link>
              <Link
                href={'/apply' as any}
                className="text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] px-3.5 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:shadow"
              >
                Start Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && hasDashboard && (
            hasBoth ? (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-[11px] font-semibold text-white bg-[#1d1d1f] px-2.5 py-1 rounded-full shadow-sm"
              >
                Dashboard
              </button>
            ) : hasShop ? (
              <Link
                href="/shop-owner/booths"
                className="text-[11px] font-semibold text-white bg-[#1d1d1f] px-2.5 py-1 rounded-full shadow-sm"
              >
                Shop Dashboard
              </Link>
            ) : (
              <Link
                href="/owner/orders"
                className="text-[11px] font-semibold text-white bg-[#1d1d1f] px-2.5 py-1 rounded-full shadow-sm"
              >
                Stall Kitchen
              </Link>
            )
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 text-[#1d1d1f]/70 hover:text-[#1d1d1f] rounded-lg hover:bg-black/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-black/[0.06] bg-[#f5f5f7] px-4 pt-3 pb-6 flex flex-col gap-3">
          {isAuthenticated ? (
            <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-sm mb-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-[#1d1d1f] truncate">{displayName}</p>
                  {userEmail && <p className="text-[11px] text-[#6e6e73] truncate">{userEmail}</p>}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 text-sm font-medium text-[#1d1d1f]/80">
            <Link href="/#product" onClick={() => setMobileMenuOpen(false)} className="py-1">Platform</Link>
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="py-1">Features</Link>
            <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1">How It Works</Link>
            <Link href="/#intelligence" onClick={() => setMobileMenuOpen(false)} className="py-1">AI Discovery</Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="py-1">FAQ</Link>
            <Link href="/#roles" onClick={() => setMobileMenuOpen(false)} className="py-1">Solutions</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-1">Pricing</Link>
          </div>

          <div className="pt-2 flex flex-col gap-2 border-t border-black/[0.06]">
            {isLoading ? (
              <div className="h-10 rounded-full bg-black/5 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* Mobile Dashboards: Only show if shop or booth is completed */}
                {hasDashboard && (
                  hasBoth ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/shop-owner/booths"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#1d1d1f]"
                      >
                        <Store className="w-3.5 h-3.5" />
                        Shop Dashboard
                      </Link>
                      <Link
                        href="/owner/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#1d1d1f]"
                      >
                        <CookingPot className="w-3.5 h-3.5" />
                        Stall Kitchen
                      </Link>
                    </div>
                  ) : hasShop ? (
                    <Link
                      href="/shop-owner/booths"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-[#1d1d1f]"
                    >
                      <Store className="w-4 h-4" />
                      Shop Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/owner/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-[#1d1d1f]"
                    >
                      <CookingPot className="w-4 h-4" />
                      Stall Kitchen (KDS)
                    </Link>
                  )
                )}

                {/* 'Start Free' only if shop onboarding NOT completed */}
                {!roles.hasShopOwner && (
                  <Link
                    href={'/apply' as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-[#0071e3]"
                  >
                    Start Free (Register Shop)
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 rounded-full text-xs font-semibold border border-black/10 bg-white text-[#1d1d1f]"
                  >
                    Account Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-center py-2 rounded-full text-xs font-semibold border border-red-200 bg-red-50 text-[#ff3b30]"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href={'/apply' as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-[#0071e3]"
                >
                  Start Free
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-full text-xs font-medium border border-black/10 bg-white"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
