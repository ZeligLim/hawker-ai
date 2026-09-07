'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  ChevronRight,
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
  CreditCard,
  Users,
  KeyRound,
  BadgePercent,
  LoaderCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';

interface PlanTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  maxBooths: string;
  featured?: boolean;
  features: string[];
}

const plans: PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'Ideal for boutique food courts and pop-up street markets.',
    maxBooths: 'Up to 3 booths',
    features: [
      '0% stall transaction commission (keep 100%)',
      'Flat RM 0.50 diner platform fee',
      '1-tap sold-out eWallet refunds',
      'Digital menu & QR table ordering',
      'Stall kitchen display system',
      'Basic sales & order summaries',
      'Standard customer mobile ordering',
    ],
  },
  {
    id: 'pro',
    name: 'Food Hall Pro',
    monthlyPrice: 249,
    annualPrice: 199,
    description: 'Designed for bustling hawker centres & full-scale food halls.',
    maxBooths: 'Up to 15 booths',
    featured: true,
    features: [
      'Everything in Starter',
      'Up to 15 concurrent booth slots',
      'Multi-stall unified checkout basket',
      'OpenRouter AI Food Discovery',
      'Real-time operator revenue telemetry',
      'Single-click cryptographic booth invites',
      'Automated tenant rent split reporting',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Venue',
    monthlyPrice: 599,
    annualPrice: 479,
    description: 'For multi-level commercial venues and large culinary complexes.',
    maxBooths: 'Unlimited booths',
    features: [
      'Everything in Food Hall Pro',
      'Unlimited booths & stall profiles',
      'Custom POS & accounting ERP export',
      'Dedicated on-site onboarding engineer',
      '99.9% uptime SLA guarantee',
    ],
  },
];

function SubscribeContent() {
  const searchParams = useSearchParams();
  const urlPlan = searchParams.get('plan');
  const urlCycle = searchParams.get('cycle') || searchParams.get('billing');

  const { status, profile, isGuest } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [overrideCycle, setOverrideCycle] = useState<'monthly' | 'annual' | null>(null);
  const [overridePlanId, setOverridePlanId] = useState<string | null>(null);

  const billingCycle = overrideCycle ?? (urlCycle === 'annual' ? 'annual' : 'monthly');
  const selectedPlanId =
    overridePlanId ?? (urlPlan && ['starter', 'pro', 'enterprise'].includes(urlPlan) ? urlPlan : 'pro');

  const setBillingCycle = (cycle: 'monthly' | 'annual') => setOverrideCycle(cycle);
  const setSelectedPlanId = (id: string) => setOverridePlanId(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Form states
  const [venueName, setVenueName] = useState('Lot 10 Hutong Food Hall');
  const [operatorName, setOperatorName] = useState('Tan Wei Ming');
  const [email, setEmail] = useState('operator@hutong.com.my');
  const [phone, setPhone] = useState('+60 12-345 6789');
  const [city, setCity] = useState('Kuala Lumpur');
  const [stallCount, setStallCount] = useState('6-15 stalls');

  // First Booth states
  const [firstStallName, setFirstStallName] = useState('Ah Fatt Hainanese Chicken Rice');
  const [firstStallCategory, setFirstStallCategory] = useState('Chicken Rice & Roast Meats');
  const [firstStallSlot, setFirstStallSlot] = useState('Booth #01');

  // Generated Invite Code state
  const [copiedCode, setCopiedCode] = useState(false);
  const [generatedInviteToken, setGeneratedInviteToken] = useState<string | null>(null);
  const generatedCode = generatedInviteToken || 'HKR-8F92-KL';

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];
  const currentPrice = billingCycle === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;

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
            <Link href="/plans" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors hidden sm:inline">
              Compare All Plans
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
              <span className="hidden sm:inline">Plan</span>
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
                  <span className="text-xs text-[#86868b]">14 days free &bull; No charge today</span>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-sm"
                  >
                    Continue to Plan Selection
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: CHOOSE PLAN ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
                    <BadgePercent className="w-3.5 h-3.5" />
                    Step 2 of 4 &bull; Choose Your Plan
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Select the plan that fits your venue.
                  </h1>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    Enjoy a full 14-day free trial on any tier. You won&apos;t be billed today and you can modify your plan at any time.
                  </p>
                </div>

                {/* Billing Cycle Switcher */}
                <div className="flex items-center justify-center pt-2">
                  <div className="inline-flex items-center p-1 bg-[#f5f5f7] rounded-full border border-black/[0.06]">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-[#1d1d1f] shadow-sm'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Billed Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        billingCycle === 'annual'
                          ? 'bg-white text-[#1d1d1f] shadow-sm'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Billed Annually <span className="text-[#30d158] font-bold ml-1">Save 20%</span>
                    </button>
                  </div>
                </div>

                {/* Plan Tier Selection List */}
                <div className="space-y-3.5 pt-2">
                  {plans.map((plan) => {
                    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                    const isSelected = selectedPlanId === plan.id;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0071e3] bg-[#0071e3]/[0.02] shadow-sm'
                            : 'border-black/[0.08] bg-white hover:border-black/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-[#0071e3] bg-[#0071e3] text-white'
                                  : 'border-black/20 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-[#1d1d1f]">{plan.name}</h3>
                                {plan.featured && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0071e3] text-white">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6e6e73] mt-0.5">{plan.description}</p>
                              <span className="inline-block mt-2 text-[11px] font-semibold text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-md">
                                {plan.maxBooths}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                              RM {price}
                            </span>
                            <span className="text-xs text-[#86868b] block">/month</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    Setup Complete &bull; 14-Day Trial Active
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    Welcome to Hawker.
                  </h1>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                    <strong className="text-[#1d1d1f]">{venueName}</strong> has been initialized with the{' '}
                    <strong className="text-[#0071e3]">{selectedPlan.name}</strong> plan. Your first booth slot is ready for activation.
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
                Subscription Overview
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
                {selectedPlan.name}
              </h2>
              <p className="text-xs text-[#6e6e73] mt-0.5">{selectedPlan.description}</p>
            </div>

            {/* Trial Billing Ledger */}
            <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>14-Day Full Free Trial</span>
                <span className="font-semibold text-[#30d158]">RM 0.00</span>
              </div>
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>
                  {billingCycle === 'annual' ? 'Annual Plan (Billed after 14 days)' : 'Monthly Plan (Billed after 14 days)'}
                </span>
                <span className="font-semibold text-[#1d1d1f]">
                  RM {currentPrice} / mo {billingCycle === 'annual' && `(RM ${currentPrice * 12}/yr)`}
                </span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between font-bold text-sm text-[#1d1d1f]">
                <span>Due Today</span>
                <span className="text-[#0071e3]">RM 0.00</span>
              </div>
            </div>

            {/* Plan Features Included */}
            <div>
              <p className="text-xs font-semibold text-[#1d1d1f] mb-3">Included in this plan:</p>
              <ul className="space-y-2.5 text-xs text-[#515154]">
                {selectedPlan.features.map((feat) => (
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
                <span>Zero setup fees &bull; Cancel anytime with 1 click</span>
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
