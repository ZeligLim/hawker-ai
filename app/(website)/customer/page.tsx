'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  Menu,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
  X,
  Store,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';

const CUSTOMER_FAQS = [
  {
    question: 'Do I need to download an app from the App Store or Google Play?',
    answer:
      'No app download is required! Hawker works entirely in your mobile browser. Simply scan the QR code on your table, and the multi-stall food court menu opens instantly.',
  },
  {
    question: 'Can my friends and I order from different stalls in one checkout?',
    answer:
      'Yes! That is the core magic of Hawker. Add dishes from different stalls into one shared cart and pay once with your preferred eWallet or card.',
  },
  {
    question: 'How do I know when my food is ready to pick up?',
    answer:
      'Your phone acts as your buzzer. Sit comfortably at your table and watch live status updates. When a stall finishes your dish, your phone vibrates and alerts you for pickup.',
  },
  {
    question: 'What payment methods can I use?',
    answer:
      'Hawker supports DuitNow QR, Touch n Go eWallet, GrabPay, Boost, Apple Pay, Google Pay, and Visa/Mastercard.',
  },
  {
    question: 'What happens if a dish sells out after I pay?',
    answer:
      'If a stall runs out of ingredients during peak hours, the kitchen triggers an automated refund that immediately credits back your original payment method.',
  },
];

export default function CustomerLandingPage() {
  const { user, status, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [foodHalls, setFoodHalls] = useState<HawkerCentreSummary[]>([]);
  const [loadingHalls, setLoadingHalls] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHalls() {
      try {
        const res = await fetch('/api/hawker-centres');
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.hawkerCentres)) {
          setFoodHalls(data.hawkerCentres);
        }
      } catch {
        // gracefully handle
      } finally {
        if (active) setLoadingHalls(false);
      }
    }
    loadHalls();
    return () => {
      active = false;
    };
  }, []);

  const isAuthenticated = status === 'authenticated' && Boolean(user);
  const displayName =
    profile?.displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Diner';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
      {/* ── Sticky Customer Navigation Bar (Spacious & Clean) ── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/90 border-b border-black/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={'/customer' as any} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-[#0071e3] text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              H
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Hawker</span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                Diners
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items - Clean & Centered */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#1d1d1f]/75">
            <a href="#how-it-works" className="hover:text-[#1d1d1f] transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-[#1d1d1f] transition-colors">
              Perks
            </a>
            <a href="#food-halls" className="hover:text-[#1d1d1f] transition-colors">
              Food Halls
            </a>
            <a href="#faq" className="hover:text-[#1d1d1f] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-black px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-black" />
              <span>Scan QR</span>
            </Link>

            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-black shadow-xs transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[80px]">{displayName}</span>
              </Link>
            ) : (
              <Link
                href="/auth?redirect=/customer"
                className="text-xs font-semibold text-[#1d1d1f]/75 hover:text-[#1d1d1f] px-2 py-1 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/scan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d1d1f] bg-white border border-black/10 px-2.5 py-1.5 rounded-full shadow-xs"
              aria-label="Scan QR"
            >
              <QrCode className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Scan</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#1d1d1f] hover:bg-black/5"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-black/[0.06] bg-[#f5f5f7] px-4 pt-2 pb-6 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#1d1d1f]">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                How It Works
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Perks
              </a>
              <a
                href="#food-halls"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Hawker Centres
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                FAQ
              </a>
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex flex-col gap-2">
              <Link
                href="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#1d1d1f]"
              >
                <QrCode className="w-4 h-4 text-[#0071e3]" />
                Scan Table QR
              </Link>
              <a
                href="#food-halls"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#0071e3] text-xs font-semibold text-white shadow-sm"
              >
                <Store className="w-4 h-4" />
                Explore Hawker Centres
              </a>
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs text-[#1d1d1f]/80 py-1.5 font-semibold"
                >
                  My Profile ({displayName})
                </Link>
              ) : (
                <Link
                  href="/auth?redirect=/customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs text-[#0071e3] py-1.5 font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-6 border border-[#0071e3]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
            <span>Digital Tabletop Ordering For Hawker Centres</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08] max-w-3xl mx-auto">
            Order from every stall at your table. <br />
            <span className="text-[#0071e3]">One simple checkout.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-[#6e6e73] font-normal leading-relaxed max-w-2xl mx-auto tracking-[-0.01em]">
            Scan the QR code at your table, mix dishes from any food court stall into one shared tray, and get notified on your phone when each meal is ready.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#food-halls"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-[0_2px_12px_rgba(0,113,227,0.28)] hover:shadow-[0_4px_18px_rgba(0,113,227,0.38)]"
            >
              <Store className="w-4 h-4 mr-2" />
              Explore Hawker Centres
            </a>

            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#1d1d1f] bg-white border border-black/10 hover:bg-black/[0.03] transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 mr-2 text-[#0071e3]" />
              Scan Table QR
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="mt-10 pt-6 border-t border-black/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs text-[#6e6e73]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
              <span>No App Download</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
              <span>Multi-Stall Cart</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
              <span>DuitNow & eWallets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
              <span>Live Phone Alert</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW ORDERING WORKS (STEP BY STEP) ── */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#0071e3]">
              3 simple steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1.5">
              How Table Ordering Works
            </h2>
            <p className="text-sm text-[#6e6e73] mt-2">
              From finding a table to your first bite in under 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f]">Scan Your Table QR</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Take a seat anywhere in the food court. Point your camera at the table QR code. The digital menu opens instantly with no app download.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f]">Mix & Match from Stalls</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Browse menus from every stall. Combine chicken rice, fried noodles, and drinks into one shared cart and pay once with DuitNow, TNG, or Card.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#30d158]/15 text-[#248a3d] flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f]">Pick Up When It Buzzes</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Sit and chat with friends. When a stall finishes your dish, your phone vibrates and notifies you to pick it up from the stall counter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY BENEFITS ── */}
      <section id="benefits" className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#0071e3]">
            Better dining
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1.5">
            Why Diners Love Hawker
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f]">One Shared Cart</h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              No more splitting up to queue. Order from multiple independent hawkers in a single checkout with unified billing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#30d158]/15 text-[#248a3d] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f]">Zero App Download</h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              Works right inside your mobile browser. Fast, lightweight, and requires no account setup or app store downloads.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#ff9500]/15 text-[#c96f00] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f]">Digital Phone Buzzer</h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              No standing in crowded aisles holding heavy buzzers. Your phone alerts you the second your dish is ready for collection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#5856d6]/15 text-[#5856d6] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f]">Instant Sold-Out Refunds</h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              If an ingredient runs out during busy lunch hours, stalls trigger an automated 1-tap refund straight back to your payment method.
            </p>
          </div>
        </div>
      </section>

      {/* ── POPULAR HAWKER CENTRES & FOOD HALLS ── */}
      <section id="food-halls" className="py-16 sm:py-20 bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <div>
              <span className="text-xs font-semibold text-[#0071e3]">
                Discover venues
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1.5">
                Popular Hawker Centres & Food Halls
              </h2>
            </div>

            <Link
              href="/home"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline"
            >
              Browse all stalls & dishes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingHalls ? (
            <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-12 text-center text-xs sm:text-sm text-[#6e6e73]">
              Loading active hawker centres…
            </div>
          ) : foodHalls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {foodHalls.map((hall) => (
                <div
                  key={hall.id}
                  className="bg-neutral-50 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:bg-neutral-100 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black font-bold shadow-xs">
                        <Store className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black shadow-xs">
                        ★ {hall.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#1d1d1f]">{hall.name}</h3>
                    <p className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0071e3] shrink-0" />
                      <span className="truncate">{hall.address}</span>
                    </p>

                    {hall.specialties && hall.specialties.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {hall.specialties.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#6e6e73] border border-black/5"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <Link
                    href={`/shop/${hall.slug}`}
                    className="w-full inline-flex items-center justify-center py-2.5 rounded-full bg-white border border-black/10 hover:bg-black/[0.02] text-xs font-semibold text-[#1d1d1f] transition-all shadow-xs"
                  >
                    View Food Centre ({hall.stallsCount} {hall.stallsCount === 1 ? 'Stall' : 'Stalls'})
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-12 text-center text-xs sm:text-sm text-[#6e6e73]">
              No active hawker centres available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* ── CUSTOMER FAQ (ACCORDION) ── */}
      <section id="faq" className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-[#0071e3]">
            Questions & answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-1.5">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {CUSTOMER_FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#1d1d1f] hover:bg-black/[0.02] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-[#6e6e73] leading-relaxed border-t border-black/[0.04] pt-2.5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FINAL DINER CALL TO ACTION ── */}
      <section className="py-16 bg-[#1d1d1f] text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
            Sit comfortably. Order effortlessly.
          </h2>
          <p className="mt-3 text-sm text-white/70 max-w-md mx-auto">
            Experience food court dining without lines or table guarding.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#food-halls"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-xs sm:text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-md"
            >
              <Store className="w-4 h-4 mr-2" />
              Explore Hawker Centres
            </a>
            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-all"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan Table QR
            </Link>
          </div>
        </div>
      </section>

      {/* ── SIMPLE CUSTOMER FOOTER ── */}
      <footer className="bg-white border-t border-black/[0.06] py-8 text-xs text-[#6e6e73]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#0071e3] text-white flex items-center justify-center font-bold text-[10px]">
              H
            </div>
            <span className="text-[#1d1d1f] font-semibold">Hawker</span>
            <span>• Digital Food Court Table Ordering</span>
          </div>
          <div className="flex items-center gap-4 text-[#86868b]">
            <Link href="/home" className="hover:text-[#1d1d1f]">Dishes</Link>
            <span>&bull;</span>
            <Link href="/scan" className="hover:text-[#1d1d1f]">Scan QR</Link>
            <span>&bull;</span>
            <a href="#faq" className="hover:text-[#1d1d1f]">FAQ</a>
          </div>
          <p>© {new Date().getFullYear()} Hawker Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
