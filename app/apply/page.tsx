'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';

const CUISINES = [
  'Chicken Rice & Roasted Meats',
  'Noodles & Laksa',
  'Nasi Lemak & Malay Delights',
  'Indian & Mamak Specialties',
  'Western & Grill',
  'Seafood & Zi Char',
  'Beverages & Desserts',
  'Vegetarian & Vegan',
  'Halal Certified',
  'Other Local Street Food',
];

export default function ApplyPage() {
  const router = useRouter();
  const { user, status, profile, roles, refreshRoles } = useAuth();

  // Form states
  const [shopName, setShopName] = useState('');
  const [stallName, setStallName] = useState('');
  const [venueName, setVenueName] = useState('Lot 10 Hutong');
  const [address, setAddress] = useState('50 Jalan Sultan, Kuala Lumpur');
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [phone, setPhone] = useState('');
  const [prepTime, setPrepTime] = useState('5-10 mins');
  const [shopStatus, setShopStatus] = useState<'pending_review' | 'approved' | 'draft'>('approved');

  // UI flow states
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedShop, setSubmittedShop] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiCheckedShop, setApiCheckedShop] = useState<{ id: string; name: string; role: string } | null>(null);

  const isAuthenticated = status === 'authenticated' && Boolean(user);
  const isLoadingAuth = status === 'loading';
  const isChecking = isLoadingAuth || (isAuthenticated && roles.isLoading);

  // Derived existing shop from roles or from API check
  const existingShop = (roles.hasShopOwner && roles.shops.length > 0 ? roles.shops[0] : null) || apiCheckedShop;

  // Display user details
  const displayName =
    profile?.displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Account';
  const userEmail = user?.email || profile?.email || '';

  // 1. Check if user already owns a shop via API if roles not yet hydrated with shop
  useEffect(() => {
    let active = true;

    if (!isAuthenticated || roles.hasShopOwner) {
      return;
    }

    const checkShops = async () => {
      try {
        const res = await authenticatedFetch('/api/owner/shops');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.shops) && data.shops.length > 0) {
            setApiCheckedShop(data.shops[0]);
          }
        }
      } catch {
        // Ignore check errors
      }
    };

    void checkShops();

    return () => {
      active = false;
    };
  }, [isAuthenticated, roles.hasShopOwner]);

  // Handle Form Submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setErrorMessage('Please enter a business or stall name.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const fullAddress = venueName.trim()
        ? `${venueName.trim()} — ${address.trim()}`
        : address.trim();

      const finalStallName = stallName.trim() || `${shopName.trim()} Stall`;

      const res = await authenticatedFetch('/api/owner/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shopName.trim(),
          address: fullAddress,
          stallName: finalStallName,
          cuisine,
          phone: phone.trim(),
          prepTime,
          status: shopStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      // If user already had a shop, data.status === 'existing'
      const createdOrExistingShop = data.shop;
      setSubmittedShop(createdOrExistingShop);

      // Refresh roles so AuthProvider reflects newly created shop ownership
      await refreshRoles();

      // Automatically transition to success / redirect
      setTimeout(() => {
        router.push('/shop-owner/booths' as any);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white pb-24">
      {/* ── Apple Top Navigation Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/85 border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              H
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Hawker</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-[#86868b] font-medium hidden sm:inline">
                Stall Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs font-medium">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#30d158]" />
                <span className="text-[#1d1d1f] font-semibold truncate max-w-[140px] sm:max-w-none">
                  {displayName}
                </span>
              </div>
            ) : (
              <Link
                href="/auth?redirect=/apply"
                className="text-[#0071e3] hover:underline px-2 py-1 font-semibold"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full border border-black/10 bg-white hover:bg-black/[0.04] transition-all text-[#1d1d1f] text-xs font-semibold"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* State 1: Checking authentication or existing shops */}
        {isChecking ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.06] shadow-sm">
            <LoaderCircle className="w-8 h-8 text-[#0071e3] animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Verifying Account Status</h2>
            <p className="text-sm text-[#6e6e73] mt-1">Please wait a moment while we load your profile...</p>
          </div>
        ) : !isAuthenticated ? (
          /* State 2: Unauthenticated User - Prompt to sign in or create account first */
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Store className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#0071e3]/10 text-[#0071e3] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Hawker Shop Owner Onboarding
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Start Free: Register Your Hawker Shop
            </h1>
            <p className="text-sm sm:text-base text-[#6e6e73] mt-2 max-w-md mx-auto">
              Set up your hawker venue or food hall operations. Stalls and booth masters join your venue via email invitation.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href="/auth?mode=signup&redirect=/apply"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-sm"
              >
                Sign Up as Hawker Owner
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth?mode=signin&redirect=/apply"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-[#1d1d1f] bg-black/5 hover:bg-black/10 transition-all"
              >
                Sign In to Existing
              </Link>
            </div>

            <div className="mt-10 pt-6 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-[#6e6e73]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                <span>Zero monthly fees. Keep 100% of your earnings.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                <span>Instant QR table-side ordering for customers.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                <span>Real-time digital kitchen display system (KDS).</span>
              </div>
            </div>
          </div>
        ) : existingShop ? (
          /* State 3: User already owns a shop - Avoid duplicate creation! */
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#30d158]/15 text-[#248a3d] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#30d158]/15 text-[#248a3d] mb-3">
              Active Shop Found
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              You Already Manage {existingShop.name}
            </h1>
            <p className="text-sm sm:text-base text-[#6e6e73] mt-2 max-w-lg mx-auto">
              Your user account (<strong className="text-[#1d1d1f]">{userEmail}</strong>) is already associated with an active hawker business. You do not need to submit another application.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-[#f5f5f7] max-w-md mx-auto text-left text-xs space-y-1.5 border border-black/[0.04]">
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Registered Stall:</span>
                <span className="font-semibold text-[#1d1d1f]">{existingShop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Account Role:</span>
                <span className="font-semibold text-[#1d1d1f] capitalize">{existingShop.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#248a3d]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                  Active & Approved
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href="/shop-owner/booths"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#1d1d1f] hover:bg-black transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Shop Dashboard
              </Link>
              <Link
                href="/owner"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-[#1d1d1f] bg-black/5 hover:bg-black/10 transition-all"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Kitchen & Orders
              </Link>
            </div>
          </div>
        ) : submittedShop ? (
          /* State 4: Just submitted successfully */
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-[#30d158]/15 text-[#248a3d] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#30d158]/15 text-[#248a3d] mb-3">
              Application Approved
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Welcome to Hawker, {submittedShop.name}!
            </h1>
            <p className="text-sm sm:text-base text-[#6e6e73] mt-2 max-w-md mx-auto">
              Your shop and primary stall workspace have been created successfully. Redirecting you to your stall dashboard now...
            </p>

            <div className="mt-8">
              <Link
                href="/shop-owner/booths"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-sm"
              >
                Enter Shop Dashboard Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* State 5: Onboarding Application Form */
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-2">
                <Store className="w-3.5 h-3.5" />
                Hawker Stall Application
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                List Your Hawker Stall
              </h1>
              <p className="text-sm text-[#6e6e73] mt-1">
                Complete your stall setup to start receiving digital table orders.
              </p>
            </div>

            {/* User Account Separation Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/[0.08] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-sm">
                  {displayName[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#1d1d1f]">{displayName}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-[#6e6e73] font-medium">
                      Personal Account
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6e73]">{userEmail}</p>
                </div>
              </div>

              <div className="text-right text-[11px] text-[#6e6e73] hidden sm:block">
                <span>Will become</span>
                <p className="font-semibold text-[#1d1d1f]">Shop Owner</p>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-[#ff3b30]">
                {errorMessage}
              </div>
            )}

            {/* Main Form Card */}
            <form onSubmit={handleSubmitApplication} className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
              {/* Section 1: Business Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
                  <ChefHat className="w-4 h-4 text-[#0071e3]" />
                  <h2 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
                    1. Stall & Business Profile
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Hawker Stall / Business Name <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ah Seng Hainanese Chicken Rice"
                      value={shopName}
                      onChange={(e) => {
                        setShopName(e.target.value);
                        if (!stallName) setStallName(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Stall Unit / Booth Slot
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stall #08 / Main Wok"
                      value={stallName}
                      onChange={(e) => setStallName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Cuisine Category
                    </label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    >
                      {CUISINES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Location & Contact */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
                  <MapPin className="w-4 h-4 text-[#0071e3]" />
                  <h2 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
                    2. Location & Operations
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Hawker Centre / Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lot 10 Hutong"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Contact Number / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +60 12-345 6789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Full Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50 Jalan Sultan, Kuala Lumpur"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Status & Review */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
                  <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
                  <h2 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
                    3. Activation & Status
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#0071e3] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-[#1d1d1f]">Instant Stall Provisioning</p>
                    <p className="text-[#6e6e73]">
                      Submitting this form immediately provisions your hawker business workspace (<code className="text-[#1d1d1f]">restaurants</code>), your primary stall (<code className="text-[#1d1d1f]">food_outlets</code>), and assigns your personal user account as the verified <strong className="text-[#1d1d1f]">Owner</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1d1d1f]">
                    Initial Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShopStatus('approved')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        shopStatus === 'approved'
                          ? 'border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]'
                          : 'border-black/10 bg-white hover:bg-black/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1d1d1f]">Approved & Active</span>
                        {shopStatus === 'approved' && <Check className="w-4 h-4 text-[#0071e3]" />}
                      </div>
                      <p className="text-[11px] text-[#6e6e73] mt-0.5">Ready to take customer orders immediately</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShopStatus('pending_review')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        shopStatus === 'pending_review'
                          ? 'border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]'
                          : 'border-black/10 bg-white hover:bg-black/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1d1d1f]">Pending Review</span>
                        {shopStatus === 'pending_review' && <Check className="w-4 h-4 text-[#0071e3]" />}
                      </div>
                      <p className="text-[11px] text-[#6e6e73] mt-0.5">Submit for venue operator verification</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-black/[0.06]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 transition-all shadow-sm hover:shadow"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Creating Hawker Business...
                    </>
                  ) : (
                    <>
                      Submit Application & Launch Stall
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#86868b] mt-3">
                  By applying, you agree to Hawker&apos;s standard merchant terms and fair-pricing policy.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
