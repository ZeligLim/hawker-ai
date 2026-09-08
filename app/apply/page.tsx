'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';

const VENUE_TYPES = [
  'Food Court / Food Hall',
  'Hawker Centre',
  'Kopitiam / Traditional Coffee Shop',
  'Night Market / Street Food Alley',
  'Commercial / Campus Canteen',
  'Multi-Brand Cloud Kitchen',
];

const STALL_CAPACITIES = [
  { label: '3 - 5 Stalls (Boutique Hall)', value: 5 },
  { label: '6 - 12 Stalls (Medium Food Court)', value: 10 },
  { label: '13 - 25 Stalls (Large Food Hall)', value: 20 },
  { label: '26+ Stalls (Mega Hawker Centre)', value: 30 },
];

export default function ApplyPage() {
  const router = useRouter();
  const { user, status, profile, roles, refreshRoles } = useAuth();

  // Form states - Pure Shop / Venue Onboarding
  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState(VENUE_TYPES[0]);
  const [stallCapacity, setStallCapacity] = useState('10');
  const [city, setCity] = useState('Kuala Lumpur');
  const [address, setAddress] = useState('50 Jalan Sultan, City Centre');
  const [phone, setPhone] = useState('');
  const [tableCount, setTableCount] = useState('30 tables');
  const [shopStatus] = useState<'approved' | 'pending_review'>('approved');

  // UI flow states
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

  // Handle Form Submission (Pure Shop Onboarding)
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim()) {
      setErrorMessage('Please enter your food hall or hawker centre name.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const fullAddress = city.trim()
        ? `${address.trim()}, ${city.trim()}`
        : address.trim();

      const res = await authenticatedFetch('/api/owner/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venueName.trim(),
          address: fullAddress,
          phone: phone.trim(),
          venueType,
          boothCount: Number(stallCapacity) || 5,
          status: shopStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        throw new Error(data.error || 'Failed to submit shop registration.');
      }

      const createdOrExistingShop = data.shop;
      setSubmittedShop(createdOrExistingShop);

      // Refresh roles so AuthProvider reflects newly created shop ownership
      await refreshRoles();

      // Automatically transition to Shop Dashboard
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
                Shop Onboarding
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
              <Building2 className="w-8 h-8" />
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
                Sign Up
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
                <span>Zero monthly fees. Only 0.5% per order.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                <span>Instant QR table-side ordering for customers.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                <span>Private email invitations for stall vendors.</span>
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
              Your user account (<strong className="text-[#1d1d1f]">{userEmail}</strong>) is already the verified Shop Owner of an active hawker venue. You do not need to register another venue.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-[#f5f5f7] max-w-md mx-auto text-left text-xs space-y-1.5 border border-black/[0.04]">
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Registered Venue:</span>
                <span className="font-semibold text-[#1d1d1f]">{existingShop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Account Role:</span>
                <span className="font-semibold text-[#1d1d1f] capitalize">Shop Owner</span>
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
                href="/shop-owner/analytics"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-[#1d1d1f] bg-black/5 hover:bg-black/10 transition-all"
              >
                View Financial Analytics
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
              Shop Registered Successfully
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Welcome to Hawker, {submittedShop.name}!
            </h1>
            <p className="text-sm sm:text-base text-[#6e6e73] mt-2 max-w-md mx-auto">
              Your food hall workspace has been created. Redirecting to your Shop Dashboard to manage booth slots and invite stall vendors...
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
          /* State 5: Onboarding Application Form for Hawker Shop Owners */
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-2">
                <Building2 className="w-3.5 h-3.5" />
                Hawker Shop Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                Register Your Hawker Centre & Food Hall
              </h1>
              <p className="text-sm text-[#6e6e73] mt-1">
                Set up your physical food court or hawker venue. Once registered, generate table QR codes and invite your stall vendors via email.
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
                <p className="font-semibold text-[#1d1d1f]">Shop Owner (Operator)</p>
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
              {/* Section 1: Venue Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
                  <Building2 className="w-4 h-4 text-[#0071e3]" />
                  <h2 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
                    1. Venue & Establishment Profile
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Hawker Centre / Food Hall Name <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lot 10 Hutong Food Hall"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Venue Classification
                    </label>
                    <select
                      value={venueType}
                      onChange={(e) => setVenueType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    >
                      {VENUE_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Initial Stall Booth Slots
                    </label>
                    <select
                      value={stallCapacity}
                      onChange={(e) => setStallCapacity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    >
                      {STALL_CAPACITIES.map((cap) => (
                        <option key={cap.value} value={String(cap.value)}>
                          {cap.label}
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
                      City / Region <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kuala Lumpur"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Operator Contact / WhatsApp <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +60 12-345 6789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Full Street Address <span className="text-[#ff3b30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50 Jalan Sultan, City Centre"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f]">
                      Estimated Seating / Table Capacity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 40 tables (approx. 160 diners)"
                      value={tableCount}
                      onChange={(e) => setTableCount(e.target.value)}
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
                    3. Activation & Stall Policy
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-[#0071e3]/5 border border-[#0071e3]/10 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#0071e3] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-[#1d1d1f]">Stalls Are Email-Invite Only</p>
                    <p className="text-[#6e6e73]">
                      Individual hawker stalls cannot register independently on the website. Once your venue is registered, you will generate secure 1-click invitation tokens (<code className="text-[#1d1d1f]">/booths/join?token=...</code>) in your Shop Dashboard to email to each vendor.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#0071e3] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-[#1d1d1f]">Instant Venue Provisioning</p>
                    <p className="text-[#6e6e73]">
                      Submitting this form immediately provisions your food hall workspace (<code className="text-[#1d1d1f]">restaurants</code>) and assigns your personal user account as the verified <strong className="text-[#1d1d1f]">Shop Owner</strong>.
                    </p>
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
                      Registering Hawker Shop...
                    </>
                  ) : (
                    <>
                      Register Hawker Shop
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#86868b] mt-3">
                  By registering, you agree to Hawker&apos;s standard venue operator terms and fair-pricing policy.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
