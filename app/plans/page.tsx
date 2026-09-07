'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Store,
  Sparkles,
  RefreshCw,
  Receipt,
  Headphones,
} from 'lucide-react';

interface PlanDetail {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  badge?: string;
  featured?: boolean;
  maxBooths: string;
  highlights: string[];
}

const plans: PlanDetail[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'Perfect for boutique food courts, pop-up street markets, and small kiosks.',
    maxBooths: 'Up to 3 booths',
    highlights: [
      '0% stall commission (hawkers keep 100%)',
      'Flat RM 0.50 diner platform fee',
      '1-tap sold-out eWallet refunds',
      'Digital menu & QR table ordering',
      'Standard mobile kitchen view',
      'Basic sales & order summaries',
      'Up to 3 active stall profiles',
    ],
  },
  {
    id: 'pro',
    name: 'Food Hall Pro',
    monthlyPrice: 249,
    annualPrice: 199,
    description: 'Designed for bustling hawker centres, commercial food courts, and food halls.',
    badge: 'Most Popular',
    featured: true,
    maxBooths: 'Up to 15 booths',
    highlights: [
      'Everything in Starter',
      'Up to 15 concurrent booth slots',
      'Multi-stall unified checkout basket',
      'OpenRouter AI Food Discovery',
      'Real-time operator revenue telemetry',
      'Single-click cryptographic booth invites',
      'Automated tenant lease & rent split reporting',
      'Priority ticket & chat support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Venue',
    monthlyPrice: 599,
    annualPrice: 479,
    description: 'For multi-floor halls, night markets, and high-volume commercial food complexes.',
    maxBooths: 'Unlimited booths',
    highlights: [
      'Everything in Food Hall Pro',
      'Unlimited booths & stall profiles',
      'Custom POS & accounting ERP export',
      'Dedicated on-site onboarding engineer',
      '99.9% uptime SLA guarantee',
      'Multi-venue centralized management',
      'Direct phone & WhatsApp hotline',
    ],
  },
];

const comparisonMatrix = [
  {
    category: 'Hawker Stall Economics',
    features: [
      { name: 'Stall Transaction Commission', starter: '0% (Keep 100%)', pro: '0% (Keep 100%)', enterprise: '0% (Keep 100%)' },
      { name: 'Diner Platform Service Fee', starter: 'RM 0.50 flat', pro: 'RM 0.50 flat', enterprise: 'RM 0.50 or Custom' },
      { name: '1-Tap Out-of-Stock Refunds', starter: 'Included', pro: 'Included', enterprise: 'Included' },
      { name: 'Direct eWallet Settlement', starter: 'Included', pro: 'Included', enterprise: 'Included' },
    ],
  },
  {
    category: 'Customer Experience & Ordering',
    features: [
      { name: 'QR Code Table Ordering', starter: 'Unlimited Tables', pro: 'Unlimited Tables', enterprise: 'Unlimited Tables' },
      { name: 'Multi-Stall Single Checkout', starter: 'Single stall only', pro: 'Included (Unified)', enterprise: 'Included (Unified)' },
      { name: 'AI Culinary Natural Search', starter: 'Standard Search', pro: 'OpenRouter AI', enterprise: 'OpenRouter AI + Custom' },
      { name: 'Digital Receipt & Order Chits', starter: 'Included', pro: 'Included', enterprise: 'Included' },
      { name: 'Zero App Download Required', starter: 'Included', pro: 'Included', enterprise: 'Included' },
    ],
  },
  {
    category: 'Kitchen & Operations',
    features: [
      { name: 'Concurrent Booth Capacity', starter: 'Up to 3 booths', pro: 'Up to 15 booths', enterprise: 'Unlimited booths' },
      { name: 'Real-time Kitchen Display (KDS)', starter: 'Standard', pro: 'Live WebSockets', enterprise: 'Live WebSockets' },
      { name: 'Cryptographic Stall Invites', starter: 'Manual Link', pro: '1-Click Keys', enterprise: '1-Click Keys + SSO' },
      { name: 'Audio Chimes on New Orders', starter: 'Included', pro: 'Included', enterprise: 'Included' },
    ],
  },
  {
    category: 'Management & Financials',
    features: [
      { name: 'Real-time Gross Telemetry', starter: 'Daily summary', pro: 'Real-time 2s sync', enterprise: 'Real-time 2s sync' },
      { name: 'Stall Lease Settlement Reports', starter: 'Basic CSV', pro: 'Automated Splits', enterprise: 'Custom ERP Sync' },
      { name: 'Multi-Venue Control', starter: 'No', pro: 'Optional', enterprise: 'Included' },
      { name: 'SLA Guarantee', starter: 'Standard', pro: '99.5%', enterprise: '99.9% Financial SLA' },
      { name: 'Onboarding Support', starter: 'Self-serve guide', pro: 'Dedicated setup agent', enterprise: 'On-site engineer' },
    ],
  },
];

const faqs = [
  {
    q: 'How does the 14-day free trial work?',
    a: 'Every new venue receives full access to all features on their selected tier for 14 days with zero upfront charge (RM 0.00 today). You can provision stalls, print QR codes, and run live orders. You may cancel anytime with a single click before the trial ends.',
  },
  {
    q: 'Does Hawker take a commission on food sales?',
    a: 'No. Hawker operates on a pure zero-commission model for hawkers. Stall operators keep 100% of their menu prices. The platform is funded through venue software subscriptions and a transparent, flat RM 0.50 diner service fee per checkout.',
  },
  {
    q: 'How do out-of-stock refunds work?',
    a: 'If a stall runs out of an ingredient, the cook taps "Sold Out / Refund" on their kitchen screen. Hawker immediately triggers an automated refund for that item back to the customer’s eWallet (Stripe / Touch ’n Go / DuitNow QR) and automatically marks the dish unavailable on the digital menu.',
  },
  {
    q: 'Can diners order from multiple stalls at once?',
    a: 'Yes. On Food Hall Pro and Enterprise tiers, diners can add chicken rice from Booth 01 and coffee from Booth 14 into one shared cart, pay once, and both stalls instantly receive their respective kitchen tickets simultaneously.',
  },
  {
    q: 'Can I upgrade or switch billing cycles later?',
    a: 'Yes, you can upgrade, downgrade, or switch between monthly and annual billing at any time from your venue operator settings with prorated billing adjustments.',
  },
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white pb-24">
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
            <Link href="/" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              Platform Overview
            </Link>
            <span className="text-black/10">|</span>
            <Link href="/auth" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              Sign In
            </Link>
            <Link
              href={`/subscribe?cycle=${billingCycle}`}
              className="px-3.5 py-1.5 rounded-full text-white bg-[#0071e3] hover:bg-[#0077ed] font-medium shadow-sm transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="pt-16 pb-12 text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
            Transparent Malaysian Pricing
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#1d1d1f] leading-[1.08]">
            Simple plans for every food hall.
          </h1>
          <p className="text-base sm:text-lg text-[#6e6e73] max-w-xl mx-auto leading-relaxed">
            0% stall commission. Flat RM 0.50 diner fee. 1-tap automated refunds. Start your 14-day free trial today.
          </p>

          {/* Billing Toggle (Apple Segmented Style) */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-black/[0.05] p-1 rounded-full flex items-center border border-black/[0.04] shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                Billed Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                <span>Billed Annually</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#30d158]/15 text-[#30d158]">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const annualSavings = (plan.monthlyPrice - plan.annualPrice) * 12;

            return (
              <div
                key={plan.id}
                className={`rounded-[32px] p-7 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.featured
                    ? 'bg-[#1d1d1f] text-white shadow-xl relative overflow-hidden ring-1 ring-black/10'
                    : 'bg-white text-[#1d1d1f] border border-black/[0.06] shadow-sm'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#0071e3] text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-lg font-semibold ${plan.featured ? 'text-white' : 'text-[#1d1d1f]'}`}>
                      {plan.name}
                    </p>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        plan.featured ? 'bg-white/20 text-white' : 'bg-[#0071e3]/10 text-[#0071e3]'
                      }`}
                    >
                      {plan.maxBooths}
                    </span>
                  </div>
                  <p className={`text-xs mt-1.5 leading-relaxed ${plan.featured ? 'text-white/60' : 'text-[#86868b]'}`}>
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">RM {price}</span>
                    <span className={`text-xs ${plan.featured ? 'text-white/60' : 'text-[#86868b]'}`}>/month</span>
                  </div>

                  {billingCycle === 'annual' ? (
                    <p className="text-[11px] font-semibold text-[#30d158] mt-1.5">
                      Billed annually (RM {price * 12}/yr) &bull; Save RM {annualSavings}
                    </p>
                  ) : (
                    <p className={`text-[11px] mt-1.5 ${plan.featured ? 'text-white/60' : 'text-[#86868b]'}`}>
                      Billed monthly &bull; 14-day free trial included
                    </p>
                  )}

                  <div className={`mt-6 pt-6 border-t ${plan.featured ? 'border-white/10' : 'border-black/[0.06]'}`}>
                    <p className={`text-xs font-semibold mb-3 ${plan.featured ? 'text-white' : 'text-[#1d1d1f]'}`}>
                      Included capabilities:
                    </p>
                    <ul className={`space-y-3 text-xs ${plan.featured ? 'text-[#d2d2d7]' : 'text-[#515154]'}`}>
                      {plan.highlights.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6">
                  <Link
                    href={`/subscribe?plan=${plan.id}&cycle=${billingCycle}`}
                    className={`w-full inline-flex items-center justify-center py-3 rounded-full text-xs font-semibold transition-all ${
                      plan.featured
                        ? 'bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-lg shadow-[#0071e3]/25'
                        : 'bg-[#1d1d1f] text-white hover:bg-black'
                    }`}
                  >
                    Start 14-day free trial
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DETAILED COMPARISON TABLE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Detailed Specs</p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Compare every capability side-by-side
          </h2>
        </div>

        <div className="bg-white rounded-[32px] border border-black/[0.06] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.08] bg-[#fafafa]">
                  <th className="py-4 px-6 font-semibold text-[#1d1d1f] w-2/5">Feature Overview</th>
                  <th className="py-4 px-4 font-semibold text-[#1d1d1f] text-center w-1/5">Starter</th>
                  <th className="py-4 px-4 font-semibold text-[#0071e3] text-center w-1/5 bg-[#0071e3]/5">
                    Food Hall Pro
                  </th>
                  <th className="py-4 px-4 font-semibold text-[#1d1d1f] text-center w-1/5">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {comparisonMatrix.map((section) => (
                  <div key={section.category} className="contents">
                    <tr className="bg-black/[0.02]">
                      <td
                        colSpan={4}
                        className="py-2.5 px-6 font-bold uppercase tracking-wider text-[10px] text-[#86868b]"
                      >
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((feat) => (
                      <tr key={feat.name} className="hover:bg-black/[0.01] transition-colors">
                        <td className="py-3.5 px-6 font-medium text-[#1d1d1f]">{feat.name}</td>
                        <td className="py-3.5 px-4 text-center text-[#515154]">{feat.starter}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-[#0071e3] bg-[#0071e3]/5">
                          {feat.pro}
                        </td>
                        <td className="py-3.5 px-4 text-center text-[#515154]">{feat.enterprise}</td>
                      </tr>
                    ))}
                  </div>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Got Questions?</p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-sm space-y-2 hover:border-black/[0.12] transition-colors"
            >
              <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0071e3] shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CALL TO ACTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-[#1d1d1f] text-white rounded-[36px] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#0071e3] text-white">
              Instant Provisioning
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              Ready to modernize your food hall?
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              Activate your venue in less than 5 minutes. No hardware installations, zero credit card commitment today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/subscribe?cycle=${billingCycle}&plan=pro`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-lg"
              >
                Start 14-day free trial
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold bg-white/10 text-white hover:bg-white/15 transition-all"
              >
                Return to homepage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
