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
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';

const platformHighlights = [
  '0% stall transaction commission (hawkers keep 100%)',
  'Unlimited stalls & QR table codes',
  'Multi-stall unified checkout basket',
  'Real-time mobile Kitchen Display (KDS)',
  '1-tap sold-out eWallet refunds',
  'OpenRouter AI culinary natural search',
  'Direct bank / eWallet automated payouts',
  'Single-click cryptographic booth invites',
];

function SubscribeContent() {
  const { status, profile, isGuest } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Form states - Step 1
  const [venueName, setVenueName] = useState('Lot 10 Hutong Food Hall');
  const [operatorName, setOperatorName] = useState('Tan Wei Ming');
  const [email, setEmail] = useState('operator@hutong.com.my');
  const [phone, setPhone] = useState('+60 12-345 6789');
  const [city, setCity] = useState('Kuala Lumpur');
  const [stallCount, setStallCount] = useState('6-15 stalls');

  // Monetization & Payout states - Step 2
  const [feePayer, setFeePayer] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [bankName, setBankName] = useState('Maybank');
  const [bankAccountNumber, setBankAccountNumber] = useState('5140 1234 5678');
  const [accountHolder, setAccountHolder] = useState('Lot 10 Hutong Sdn Bhd');

  // First Booth states - Step 3
  const [firstStallName, setFirstStallName] = useState('Ah Fatt Hainanese Chicken Rice');
  const [firstStallCategory, setFirstStallCategory] = useState('Chicken Rice & Roast Meats');
  const [firstStallSlot, setFirstStallSlot] = useState('Booth #01');

  // Generated Invite Code state - Step 4
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
          setSubmissionError('Please sign in before provisioning your venue in the database.');
          setIsSubmitting(false);
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white pb-20">
      {/* ── Apple Top Navigation Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/85 border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              H
            </div>
            <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Hawker</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/pricing" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors hidden sm:inline">
              Pricing & Model
            </Link>
            <span className="text-black/10 hidden sm:inline">|</span>
            <Link
              href="/auth?redirect=/subscribe"
              className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-black/[0.04] transition-all text-[#1d1d1f]"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Onboarding Container ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Apple Stepper Breadcrumb */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="flex items-center justify-between text-xs font-medium">
            <div
              className={`flex items-center gap-2 ${
                currentStep >= 1 ? 'text-[#0071e3]' : 'text-[#86868b]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep > 1
                    ? 'bg-[#30d158] text-white'
                    : currentStep === 1
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-black/[0.08] text-[#86868b]'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span className="hidden sm:inline">Venue</span>
            </div>

            <div className={`h-[1px] flex-1 mx-2 sm:mx-3 ${currentStep >= 2 ? 'bg-[#0071e3]' : 'bg-black/[0.1]'}`} />

            <div
              className={`flex items-center gap-2 ${
                currentStep >= 2 ? 'text-[#0071e3]' : 'text-[#86868b]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep > 2
                    ? 'bg-[#30d158] text-white'
                    : currentStep === 2
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-black/[0.08] text-[#86868b]'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className="hidden sm:inline">Settlement & Fees</span>
            </div>

            <div className={`h-[1px] flex-1 mx-2 sm:mx-3 ${currentStep >= 3 ? 'bg-[#0071e3]' : 'bg-black/[0.1]'}`} />

            <div
              className={`flex items-center gap-2 ${
                currentStep >= 3 ? 'text-[#0071e3]' : 'text-[#86868b]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep > 3
                    ? 'bg-[#30d158] text-white'
                    : currentStep === 3
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-black/[0.08] text-[#86868b]'
                }`}
              >
                {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
              </span>
              <span className="hidden sm:inline">First Stall</span>
            </div>

            <div className={`h-[1px] flex-1 mx-2 sm:mx-3 ${currentStep >= 4 ? 'bg-[#0071e3]' : 'bg-black/[0.1]'}`} />

            <div
              className={`flex items-center gap-2 ${
                currentStep === 4 ? 'text-[#30d158]' : 'text-[#86868b]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep === 4
                    ? 'bg-[#30d158] text-white'
                    : 'bg-black/[0.08] text-[#86868b]'
                }`}
              >
                4
              </span>
              <span className="hidden sm:inline">Activation</span>
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          {/* LEFT: STEP CONTENT */}
          <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* ── STEP 1: VENUE DETAILS ── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <Building2 className="w-3.5 h-3.5" />
                    Step 1 of 4 &bull; Venue Registration
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Let&apos;s set up your food hall.
                  </h1>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Enter your venue and operator contact details. You can configure individual stalls and table numbers in the next steps.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                      Hawker Centre or Food Hall Name
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
                    Continue to Payout & Fee Setup
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: SETTLEMENT & FEES ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <BadgePercent className="w-3.5 h-3.5" />
                    Step 2 of 4 &bull; Settlement & Platform Cut
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Zero monthly fees. Pay only when you sell.
                  </h1>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Hawker charges zero monthly subscription fees. We take a transparent cut directly from payment transactions.
                  </p>
                </div>

                {/* 3-Pillar Economics Banner */}
                <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06]">
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">Monthly Software</p>
                    <p className="text-base font-bold text-[#30d158]">RM 0.00 / mo</p>
                    <p className="text-[10px] text-[#6e6e73]">Free forever platform</p>
                  </div>
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">Hardware POS</p>
                    <p className="text-base font-bold text-[#1d1d1f]">RM 0.00</p>
                    <p className="text-[10px] text-[#6e6e73]">Bring your own devices</p>
                  </div>
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">Monetization</p>
                    <p className="text-base font-bold text-[#0071e3]">Payment Cut</p>
                    <p className="text-[10px] text-[#6e6e73]">Deducted at checkout</p>
                  </div>
                </div>

                {/* Fee Payer Configuration */}
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-semibold text-[#1d1d1f]">
                    Platform Fee Settlement Strategy
                  </label>

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div
                      onClick={() => setFeePayer('CUSTOMER')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        feePayer === 'CUSTOMER'
                          ? 'border-[#0071e3] bg-[#0071e3]/[0.02] shadow-sm'
                          : 'border-black/[0.08] bg-white hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            feePayer === 'CUSTOMER'
                              ? 'border-[#0071e3] bg-[#0071e3] text-white'
                              : 'border-black/20 bg-white'
                          }`}
                        >
                          {feePayer === 'CUSTOMER' && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#1d1d1f]">Diner Service Fee</h3>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#30d158]/15 text-[#30d158]">
                              Recommended
                            </span>
                          </div>
                          <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                            Diners pay a flat RM 0.50 platform fee at checkout. Hawkers keep 100% of dish prices.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setFeePayer('MERCHANT')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        feePayer === 'MERCHANT'
                          ? 'border-[#0071e3] bg-[#0071e3]/[0.02] shadow-sm'
                          : 'border-black/[0.08] bg-white hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            feePayer === 'MERCHANT'
                              ? 'border-[#0071e3] bg-[#0071e3] text-white'
                              : 'border-black/20 bg-white'
                          }`}
                        >
                          {feePayer === 'MERCHANT' && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#1d1d1f]">Venue-Absorbed Cut</h3>
                          <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                            Platform cut is deducted directly from payouts. Diners see zero added service fee at checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Account Settlement Details */}
                <div className="space-y-4 pt-2 border-t border-black/[0.06]">
                  <div>
                    <h3 className="text-xs font-semibold text-[#1d1d1f]">Direct Payout Settlement Account</h3>
                    <p className="text-xs text-[#6e6e73] mt-0.5">
                      Net stall sales will be transferred directly to this account via DuitNow / FAST bank transfer.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                        Settlement Bank / Provider
                      </label>
                      <div className="relative">
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full h-[46px] appearance-none rounded-2xl border border-black/10 bg-white px-4 pr-10 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
                        >
                          <option value="Maybank">Malayan Banking Berhad (Maybank)</option>
                          <option value="CIMB Bank">CIMB Bank Berhad</option>
                          <option value="Public Bank">Public Bank Berhad</option>
                          <option value="Hong Leong Bank">Hong Leong Bank Berhad</option>
                          <option value="RHB Bank">RHB Bank Berhad</option>
                          <option value="AmBank">AmBank Berhad</option>
                          <option value="Touch 'n Go Biz">Touch &apos;n Go eWallet Biz</option>
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
                      Account Holder Legal Name
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

            {/* ── STEP 3: FIRST STALL SETUP ── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <Store className="w-3.5 h-3.5" />
                    Step 3 of 4 &bull; First Stall Slot
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Add your first food stall.
                  </h1>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Set up your first booth slot now. Hawker will immediately generate a cryptographically secure invitation code so your stall holder can activate their kitchen.
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
                        placeholder="e.g. Noodles, Satay, Rice"
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
                      You can add more stalls, reassign slots, or invite other stall owners at any time from your Hawker Operator Dashboard.
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
                        Provisioning Venue...
                      </>
                    ) : (
                      <>
                        Complete Setup & Generate Key
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: SUCCESS & ACTIVATION ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30d158]/15 text-[#30d158] text-xs font-semibold mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Setup Complete &bull; Free Forever Platform
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Welcome to Hawker.
                  </h1>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    <strong className="text-[#1d1d1f]">{venueName}</strong> has been initialized on Hawker&apos;s Pay-As-You-Grow model. Your first booth slot is ready for activation.
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

          {/* RIGHT: ORDER & PLAN SUMMARY PANEL */}
          <aside className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                Model Overview
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
                Pay-As-You-Grow Platform
              </h2>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                100% free software access with zero monthly bills or terminal hardware leases.
              </p>
            </div>

            {/* Trial Billing Ledger */}
            <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>Monthly Software Fee</span>
                <span className="font-semibold text-[#30d158]">RM 0.00 / mo</span>
              </div>
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>POS Hardware & Terminal Leases</span>
                <span className="font-semibold text-[#1d1d1f]">RM 0.00 (BYO)</span>
              </div>
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>Monetization</span>
                <span className="font-semibold text-[#0071e3]">Small cut per transaction</span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between font-bold text-sm text-[#1d1d1f]">
                <span>Due Today</span>
                <span className="text-[#0071e3]">RM 0.00</span>
              </div>
            </div>

            {/* Plan Features Included */}
            <div>
              <p className="text-xs font-semibold text-[#1d1d1f] mb-3">Included in every venue:</p>
              <ul className="space-y-2.5 text-xs text-[#515154]">
                {platformHighlights.map((feat) => (
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
                <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" />
                <span>Zero monthly software bills &bull; Cancel or pause anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Full access to customer ordering & kitchen displays</span>
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
            <span>Loading subscription configuration...</span>
          </div>
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}
