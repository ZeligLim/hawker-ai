'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Building2,
  Store,
  Sparkles,
  ShieldCheck,
  Clock,
  Copy,
  CheckCircle2,
  KeyRound,
  BadgePercent,
  LoaderCircle,
  Zap,
  Banknote,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';

const platformGuarantees = [
  '0% stall transaction commission (hawkers keep 100%)',
  'Unlimited stalls & QR table codes',
  'Multi-stall unified checkout basket',
  'Real-time mobile Kitchen Display System (KDS)',
  '1-tap automated sold-out eWallet refunds',
  'OpenRouter AI culinary natural search',
  'Automated daily DuitNow / FAST bank settlement',
  'Single-click cryptographic booth invite keys',
];

function LaunchpadContent() {
  const { status, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Form states - Step 1: Venue Profile
  const [venueName, setVenueName] = useState('Lot 10 Hutong Food Hall');
  const [operatorName, setOperatorName] = useState('Tan Wei Ming');
  const [email, setEmail] = useState('operator@hutong.com.my');
  const [phone, setPhone] = useState('+60 12-345 6789');
  const [city, setCity] = useState('Kuala Lumpur');
  const [stallCount, setStallCount] = useState('6-15 stalls');

  // Form states - Step 2: Settlement & Monetization Strategy
  const [feePayer, setFeePayer] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [bankName, setBankName] = useState('Maybank');
  const [bankAccountNumber, setBankAccountNumber] = useState('5140 1234 5678');
  const [accountHolder, setAccountHolder] = useState('Lot 10 Hutong Sdn Bhd');

  // Form states - Step 3: First Stall
  const [firstStallName, setFirstStallName] = useState('Ah Fatt Hainanese Chicken Rice');
  const [firstStallCategory, setFirstStallCategory] = useState('Chicken Rice & Roast Meats');
  const [firstStallSlot, setFirstStallSlot] = useState('Booth #01');

  // Step 4: Generated Invite Code
  const [copiedCode, setCopiedCode] = useState(false);
  const [generatedInviteToken, setGeneratedInviteToken] = useState<string | null>(null);
  const generatedCode = generatedInviteToken || 'HKR-8F92-KL';

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleNext = async () => {
    setSubmissionError(null);

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const session = (await supabase?.auth.getSession())?.data.session;
        if (!session) {
          // If unauthenticated, generate a realistic demo token for immediate trial preview
          const fallbackToken = `DEMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          setGeneratedInviteToken(fallbackToken);
          setCurrentStep(4);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // 1. Create restaurant shop
        const shopRes = await fetch('/api/owner/shops', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: venueName.trim() || 'Food Hall',
            address: `${city.trim() || 'Kuala Lumpur'}, Malaysia`,
          }),
        });

        const shopData = await shopRes.json().catch(() => ({}));
        if (!shopRes.ok || !shopData.shop?.id) {
          throw new Error(shopData.error || 'Failed to create venue in database.');
        }

        const shopId = shopData.shop.id;

        // 2. Create the first booth
        const boothRes = await fetch('/api/owner/booths', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            restaurantId: shopId,
            name: firstStallName.trim() || 'Booth #01',
          }),
        });

        const boothData = await boothRes.json().catch(() => ({}));
        if (!boothRes.ok || !boothData.booth?.id) {
          throw new Error(boothData.error || 'Failed to provision initial booth.');
        }

        const boothId = boothData.booth.id;

        // 3. Generate cryptographic invite code
        const inviteRes = await fetch(`/api/owner/booths/${boothId}/invite`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const inviteData = await inviteRes.json().catch(() => ({}));
        if (!inviteRes.ok || !inviteData.token) {
          throw new Error(inviteData.error || 'Failed to generate cryptographic invite token.');
        }

        setGeneratedInviteToken(inviteData.token);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setSubmissionError(err instanceof Error ? err.message : 'Unable to complete venue setup.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white pb-24">
      {/* ── Apple Top Navigation Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/85 border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              H
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Hawker</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-[#86868b] font-medium hidden sm:inline">
                Launchpad
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30d158]/15 text-[#30d158] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              RM 0.00 / month forever
            </span>
            <Link
              href="/pricing"
              className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors px-2 py-1"
            >
              Pricing Model
            </Link>
            {status === 'authenticated' && profile ? (
              <span className="text-[#1d1d1f] font-semibold hidden sm:inline">
                {profile.displayName || profile.email || 'Operator'}
              </span>
            ) : (
              <Link
                href="/auth?redirect=/subscribe"
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

      {/* ── Main Container ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Page Hero Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            Zero Monthly Subscriptions &bull; Pay As You Sell
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08]">
            Zero monthly subscriptions.
            <span className="block text-[#0071e3] mt-1">We only win when you sell.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#6e6e73] leading-relaxed">
            No recurring software rent. No proprietary hardware. Register your food hall, configure your direct payout account, and launch your first stall in under 2 minutes.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="max-w-3xl mb-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs font-medium">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                currentStep === 1
                  ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                  : currentStep > 1
                  ? 'border-[#30d158]/30 bg-[#30d158]/5 text-[#30d158]'
                  : 'border-black/5 bg-white text-[#86868b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep > 1
                      ? 'bg-[#30d158] text-white'
                      : currentStep === 1
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/10 text-[#86868b]'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                </span>
                <span className="font-semibold truncate">1. Venue Profile</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                currentStep === 2
                  ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                  : currentStep > 2
                  ? 'border-[#30d158]/30 bg-[#30d158]/5 text-[#30d158]'
                  : 'border-black/5 bg-white text-[#86868b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep > 2
                      ? 'bg-[#30d158] text-white'
                      : currentStep === 2
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/10 text-[#86868b]'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                </span>
                <span className="font-semibold truncate">2. Settlement</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                currentStep === 3
                  ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                  : currentStep > 3
                  ? 'border-[#30d158]/30 bg-[#30d158]/5 text-[#30d158]'
                  : 'border-black/5 bg-white text-[#86868b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep > 3
                      ? 'bg-[#30d158] text-white'
                      : currentStep === 3
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/10 text-[#86868b]'
                  }`}
                >
                  {currentStep > 3 ? <Check className="w-3 h-3" /> : '3'}
                </span>
                <span className="font-semibold truncate">3. First Stall</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
          {/* LEFT: INTERACTIVE ONBOARDING STAGES */}
          <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* ── STEP 1: VENUE PROFILE ── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <Building2 className="w-3.5 h-3.5" />
                    Stage 1 of 3 &bull; Food Hall Identity
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Register your food hall or hawker centre.
                  </h2>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Enter your venue name and management contact. Hawker creates an operator workspace with zero upfront costs.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                      Food Hall or Hawker Centre Name
                    </label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Lot 10 Hutong Food Hall"
                      className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Operator / General Manager Name
                      </label>
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        placeholder="e.g. Tan Wei Ming"
                        className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Work Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. operator@hutong.com.my"
                        className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Contact Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+60 12-345 6789"
                        className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        City / State
                      </label>
                      <div className="relative">
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-[46px] appearance-none rounded-2xl border border-black/10 bg-white px-4 pr-10 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
                        >
                          <option value="Kuala Lumpur">Kuala Lumpur</option>
                          <option value="Petaling Jaya / Selangor">Petaling Jaya / Selangor</option>
                          <option value="George Town / Penang">George Town / Penang</option>
                          <option value="Johor Bahru">Johor Bahru</option>
                          <option value="Ipoh / Perak">Ipoh / Perak</option>
                          <option value="Melaka">Melaka</option>
                          <option value="Other">Other Region</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                      Estimated Stall Capacity
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {['1-5 stalls', '6-15 stalls', '16+ stalls'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setStallCount(opt)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                            stallCount === opt
                              ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                              : 'border-black/10 bg-white text-[#1d1d1f] hover:bg-black/[0.02]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-black/[0.06]">
                  <span className="text-xs text-[#86868b]">Zero software bills &bull; RM 0 today</span>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-sm"
                  >
                    Continue to Payout Setup
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: SETTLEMENT & REVENUE MODEL ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <BadgePercent className="w-3.5 h-3.5" />
                    Stage 2 of 3 &bull; Payout & Platform Cut
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Where should customer payments go?
                  </h2>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Hawker charges zero monthly subscription fees. We take a transparent cut directly from payment transactions. Choose how this cut is funded:
                  </p>
                </div>

                {/* 3-Pillar Economics Banner */}
                <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06]">
                  <div className="space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">Monthly Software</p>
                    <p className="text-base font-bold text-[#30d158]">RM 0.00 / mo</p>
                    <p className="text-[10px] text-[#6e6e73]">Free forever platform</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">Hardware POS</p>
                    <p className="text-base font-bold text-[#1d1d1f]">RM 0.00</p>
                    <p className="text-[10px] text-[#6e6e73]">Bring your own devices</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">Monetization</p>
                    <p className="text-base font-bold text-[#0071e3]">Payment Cut</p>
                    <p className="text-[10px] text-[#6e6e73]">Only on successful sales</p>
                  </div>
                </div>

                {/* Dual Fee Model Selector */}
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-semibold text-[#1d1d1f]">
                    Platform Fee Strategy
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setFeePayer('CUSTOMER')}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        feePayer === 'CUSTOMER'
                          ? 'border-[#0071e3] bg-[#0071e3]/[0.03] ring-2 ring-[#0071e3]/20 shadow-sm'
                          : 'border-black/10 bg-white hover:bg-black/[0.02]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#1d1d1f]">Diner Service Fee</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158]">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-[#6e6e73] leading-relaxed">
                          Diners pay a flat <strong className="text-[#1d1d1f]">RM 0.50 platform service fee</strong> at checkout.
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-[#30d158] font-semibold">
                        Stall owners keep 100% of dish revenue
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeePayer('MERCHANT')}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        feePayer === 'MERCHANT'
                          ? 'border-[#0071e3] bg-[#0071e3]/[0.03] ring-2 ring-[#0071e3]/20 shadow-sm'
                          : 'border-black/10 bg-white hover:bg-black/[0.02]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#1d1d1f]">Venue-Absorbed Cut</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#86868b]">
                            All-Inclusive
                          </span>
                        </div>
                        <p className="text-xs text-[#6e6e73] leading-relaxed">
                          The platform cut is deducted directly from daily gross settlement payouts.
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-[#6e6e73]">
                        Diners see zero extra fee on the checkout bill
                      </div>
                    </button>
                  </div>
                </div>

                {/* Direct Payout Bank Account Details */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#0071e3]" />
                    <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
                      DuitNow & FAST Bank Settlement Details
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Settlement Bank
                      </label>
                      <div className="relative">
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full h-[46px] appearance-none rounded-2xl border border-black/10 bg-white px-4 pr-10 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
                        >
                          <option value="Maybank">Malayan Banking Berhad (Maybank)</option>
                          <option value="CIMB">CIMB Bank Berhad</option>
                          <option value="Public Bank">Public Bank Berhad</option>
                          <option value="Hong Leong">Hong Leong Bank Berhad</option>
                          <option value="RHB">RHB Bank Berhad</option>
                          <option value="AmBank">AmBank (M) Berhad</option>
                          <option value="Touch 'n Go Biz">Touch &apos;n Go eWallet Merchant</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Bank Account Number / DuitNow ID
                      </label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="e.g. 5140 1234 5678"
                        className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                      Registered Company / Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="e.g. Lot 10 Hutong Sdn Bhd"
                      className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-black/[0.06]">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-sm"
                  >
                    Configure First Stall
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: FIRST STALL SETUP & LAUNCH ── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <Store className="w-3.5 h-3.5" />
                    Stage 3 of 3 &bull; First Stall Slot
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Add your first food stall.
                  </h2>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Set up your first booth slot now. Hawker will immediately generate a cryptographically secure invitation code so your stall holder can activate their kitchen display.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                      Stall or Brand Name
                    </label>
                    <input
                      type="text"
                      value={firstStallName}
                      onChange={(e) => setFirstStallName(e.target.value)}
                      placeholder="e.g. Ah Fatt Hainanese Chicken Rice"
                      className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Food Category / Cuisine
                      </label>
                      <input
                        type="text"
                        value={firstStallCategory}
                        onChange={(e) => setFirstStallCategory(e.target.value)}
                        placeholder="e.g. Chicken Rice, Roast Meats"
                        className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Booth Slot Identifier
                      </label>
                      <input
                        type="text"
                        value={firstStallSlot}
                        onChange={(e) => setFirstStallSlot(e.target.value)}
                        placeholder="e.g. Booth #01"
                        className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#86868b]"
                      />
                    </div>
                  </div>

                  {/* Informational Callout */}
                  <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#6e6e73] leading-relaxed">
                      You can add more stalls, reassign booth slots, or invite other stall operators at any time from your Hawker Operator Dashboard.
                    </p>
                  </div>
                </div>

                {submissionError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
                    {submissionError}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-black/[0.06]">
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-sm disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                        Launching Venue...
                      </>
                    ) : (
                      <>
                        Launch Food Hall for RM 0.00
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: VICTORY SCREEN & INSTANT ACTIVATION ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30d158]/15 text-[#30d158] text-xs font-semibold mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Setup Complete &bull; Free Forever Platform
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Your food hall is live on Hawker.
                  </h2>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    <strong className="text-[#1d1d1f]">{venueName}</strong> has been initialized under the Pay-As-You-Grow model. Your first booth slot ({firstStallName}) is ready for immediate kitchen activation.
                  </p>
                </div>

                {/* Generated Invitation Token Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#f5f5f7] border border-black/[0.08] space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#0071e3]" /> Booth Invitation Token
                    </span>
                    <span className="text-[#30d158] font-semibold text-[11px]">Valid for 48 Hours</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-black/[0.06] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold">
                        {firstStallSlot} &bull; {firstStallName}
                      </p>
                      <p className="text-2xl font-mono font-bold tracking-widest text-[#1d1d1f] mt-0.5">
                        {generatedCode}
                      </p>
                    </div>

                    <button
                      onClick={handleCopyInvite}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors shrink-0"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Token
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-[#6e6e73] leading-relaxed">
                    Send this code to your stall owner. They can visit{' '}
                    <Link href="/booths/join" className="text-[#0071e3] font-semibold hover:underline">
                      hawker.com/booths/join
                    </Link>{' '}
                    to redeem the code and begin uploading their dishes.
                  </p>
                </div>

                {/* Next Action Buttons */}
                <div className="pt-2 space-y-3">
                  <Link
                    href={'/shop-owner/booths' as any}
                    className="w-full inline-flex items-center justify-center py-3.5 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-md gap-2"
                  >
                    Open Food Hall Operator Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Link
                      href="/booths/join"
                      className="inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold border border-black/15 bg-white text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                    >
                      Test Stall Redemption Flow
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold border border-black/15 bg-white text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: THE ZERO-RISK TRANSPARENCY CARD (Sticky) */}
          <aside className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6 lg:sticky lg:top-20">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/5 text-[#86868b] text-[10px] font-bold uppercase tracking-wider mb-2">
                The Hawker Commitment
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                Zero monthly subscriptions.
              </h3>
              <p className="text-sm font-semibold text-[#0071e3] mt-0.5">
                We only win when you sell.
              </p>
              <p className="text-xs text-[#6e6e73] mt-1.5 leading-relaxed">
                No monthly software rent, no proprietary hardware terminals, and no cancellation penalties.
              </p>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>Monthly Software Fee</span>
                <span className="font-semibold text-[#30d158]">RM 0.00 / mo</span>
              </div>
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>POS Hardware & Terminals</span>
                <span className="font-semibold text-[#1d1d1f]">RM 0.00 (BYO)</span>
              </div>
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>Setup & Activation</span>
                <span className="font-semibold text-[#1d1d1f]">RM 0.00</span>
              </div>
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>Platform Monetization</span>
                <span className="font-semibold text-[#0071e3]">Small cut per transaction</span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between font-bold text-sm text-[#1d1d1f]">
                <span>Total Due Today</span>
                <span className="text-[#0071e3]">RM 0.00</span>
              </div>
            </div>

            {/* Core Guarantees */}
            <div>
              <p className="text-xs font-semibold text-[#1d1d1f] mb-3">Included with every venue:</p>
              <ul className="space-y-2.5 text-xs text-[#515154]">
                {platformGuarantees.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guarantees Strip */}
            <div className="pt-4 border-t border-black/[0.06] space-y-2 text-[11px] text-[#86868b]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
                <span>Zero monthly invoices &bull; Pause anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
                <span>Rainy day with RM 0 sales = RM 0 platform cost</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center text-xs text-[#86868b]">
          <div className="flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin text-[#0071e3]" />
            <span>Loading Hawker Launchpad...</span>
          </div>
        </div>
      }
    >
      <LaunchpadContent />
    </Suspense>
  );
}
