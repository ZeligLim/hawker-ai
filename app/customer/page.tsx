'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Flame,
  Heart,
  MapPin,
  Menu,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  ThumbsUp,
  User,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

// Mock food halls for diners to explore
const FEATURED_FOOD_HALLS = [
  {
    id: 'lot10',
    name: 'Lot 10 Hutong Food Hall',
    location: 'Bukit Bintang, Kuala Lumpur',
    stallsCount: 34,
    rating: 4.8,
    image: '🍜',
    specialties: ['Hokkien Mee', 'Roast Duck', 'Beef Noodles', 'Char Kway Teow'],
    tag: 'Heritage Hall',
  },
  {
    id: 'newton',
    name: 'Newton Food Centre',
    location: 'Clemenceau Ave, Singapore',
    stallsCount: 83,
    rating: 4.9,
    image: '🦀',
    specialties: ['Chilli Crab', 'Sambal Stingray', 'Satay', 'Oyster Omelette'],
    tag: 'Michelin Bib Gourmand',
  },
  {
    id: 'penang',
    name: 'Penang Road Famous Hawker Hall',
    location: 'George Town, Penang',
    stallsCount: 28,
    rating: 4.9,
    image: '🍧',
    specialties: ['Teochew Chendul', 'Assam Laksa', 'Duck Kway Teow Soup'],
    tag: 'Must Visit',
  },
  {
    id: 'ss2',
    name: 'Medan Selera SS2',
    location: 'Petaling Jaya, Selangor',
    stallsCount: 45,
    rating: 4.7,
    image: '🍢',
    specialties: ['Lok Lok', 'Claypot Chicken Rice', 'Pau & Dim Sum'],
    tag: 'Late Night Spot',
  },
];

// Interactive basket demo items
const SAMPLE_TRAY_ITEMS = [
  {
    id: 'item-1',
    stall: 'Stall 08 • Madam Kwan Kitchen',
    name: 'Nasi Lemak Kukus with Ayam Berempah',
    price: 14.5,
    prepTime: '6 mins',
    badge: 'Best Seller',
    status: 'Cooking',
  },
  {
    id: 'item-2',
    stall: 'Stall 04 • Ah Fatt Wok Masters',
    name: 'Penang Crispy Duck Egg Char Kway Teow',
    price: 16.0,
    prepTime: '4 mins',
    badge: 'Wok Hei Special',
    status: 'Ready for Pickup',
  },
  {
    id: 'item-3',
    stall: 'Stall 12 • Penang Road Heritage Cendol',
    name: 'Signature Shaved Ice Cendol with Gula Melaka',
    price: 8.5,
    prepTime: '2 mins',
    badge: 'Sweet Finish',
    status: 'Ready for Pickup',
  },
];

// AI Culinary queries for diners
const AI_SEARCH_PREVIEWS = [
  {
    prompt: 'Craving something spicy under RM15 near Table 4',
    matchedDish: 'Nasi Lemak Kukus with Sambal Sotong',
    stall: 'Stall 08 • Madam Kwan Kitchen',
    price: 'RM 14.50',
    reason: 'Matches spicy craving, freshly wok-cooked sambal, under RM15 budget.',
    tag: 'Spicy Delight',
  },
  {
    prompt: 'Comforting hot soup noodles on a rainy day, no pork',
    matchedDish: 'Seafood Claypot Yee Mee in Golden Broth',
    stall: 'Stall 03 • Ah Fatt Claypot Special',
    price: 'RM 16.00',
    reason: 'Pork-free certified, simmered for 8 hours with fresh prawns and clams.',
    tag: 'Halal-friendly & Warm',
  },
  {
    prompt: 'Quick refreshing dessert under 5 minutes',
    matchedDish: 'Signature Pandan Cendol with Pure Melaka Gula',
    stall: 'Stall 12 • Penang Heritage Cendol',
    price: 'RM 8.50',
    reason: 'Ready in 2 minutes, finely shaved ice with coconut milk and red bean.',
    tag: 'Refreshing & Fast',
  },
];

const CUSTOMER_FAQS = [
  {
    question: 'Do I need to download an app from the App Store or Google Play?',
    answer:
      'No app download required! Hawker works entirely in your mobile browser. Simply open your camera, point it at the QR code sticker on your table, and the full multi-stall food court menu loads instantly.',
  },
  {
    question: 'Can my friends and I order from different stalls in one checkout?',
    answer:
      'Yes! That is the core magic of Hawker. You can order chicken rice from Stall 1, fried noodles from Stall 5, and fresh sugar cane juice from the drinks stall all in ONE shared cart, and pay once with your preferred eWallet or card.',
  },
  {
    question: 'How do I know when my food is ready to pick up?',
    answer:
      'Your phone acts as your digital buzzer. You can sit comfortably at your table while watching live status updates ("Order Received" → "Kitchen Cooking" → "Ready for Pickup"). When a stall finishes your dish, your phone vibrates and sounds an alert.',
  },
  {
    question: 'What payment methods can I use?',
    answer:
      'Hawker supports all major Malaysian and regional eWallets including DuitNow QR, Touch n Go eWallet, GrabPay, Boost, Apple Pay, Google Pay, and Visa/Mastercard.',
  },
  {
    question: 'What happens if a dish sells out after I pay?',
    answer:
      'During lunch rushes, stalls occasionally run out of popular ingredients. If a merchant cannot fulfill an item, the kitchen triggers an automated 1-tap refund that immediately credits back your original payment method.',
  },
  {
    question: 'Can I reorder extra drinks or desserts later without leaving my seat?',
    answer:
      'Absolutely! Your table QR session remains active. Whenever you want another round of iced tea, satay, or dessert, just open your tab and order instantly.',
  },
];

export default function CustomerLandingPage() {
  const { user, status, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAiQuery, setActiveAiQuery] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [trayItems, setTrayItems] = useState(SAMPLE_TRAY_ITEMS);

  const isAuthenticated = status === 'authenticated' && Boolean(user);
  const displayName =
    profile?.displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Diner';

  const traySubtotal = trayItems.reduce((sum, item) => sum + item.price, 0);
  const platformFee = 0.5;
  const trayTotal = traySubtotal + (trayItems.length > 0 ? platformFee : 0);

  const toggleTrayItem = (id: string) => {
    setTrayItems((prev) => {
      const exists = prev.some((i) => i.id === id);
      if (exists) {
        return prev.filter((i) => i.id !== id);
      }
      const original = SAMPLE_TRAY_ITEMS.find((i) => i.id === id);
      return original ? [...prev, original] : prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
      {/* ── Top Ribbon: Switcher to Hawker for Venue Operators ── */}
      <div className="bg-[#1d1d1f] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-tight flex items-center justify-center gap-2">
        <span className="hidden sm:inline text-white/60">Own or manage a hawker centre or food court?</span>
        <span className="font-semibold text-white">Hawker for Venue Operators & Shop Owners</span>
        <Link
          href="/"
          className="inline-flex items-center text-[#2997ff] hover:underline font-semibold ml-1"
        >
          Learn more <ChevronRight className="w-3 h-3 ml-0.5 inline" />
        </Link>
      </div>

      {/* ── Sticky Customer Navigation Bar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/85 border-b border-black/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo & Diner Badge */}
          <div className="flex items-center gap-3">
            <Link href={'/customer' as any} className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-[#0071e3] text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                H
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Hawker</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                  For Diners
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#1d1d1f]/75">
            <Link href="/menu" className="hover:text-[#1d1d1f] transition-colors">
              Explore Menus
            </Link>
            <a href="#how-it-works" className="hover:text-[#1d1d1f] transition-colors">
              How It Works
            </a>
            <a href="#multi-stall" className="hover:text-[#1d1d1f] transition-colors">
              Multi-Stall Tray
            </a>
            <a href="#ai-search" className="hover:text-[#1d1d1f] transition-colors">
              AI Food Search
            </a>
            <a href="#food-halls" className="hover:text-[#1d1d1f] transition-colors">
              Food Halls
            </a>
            <a href="#faq" className="hover:text-[#1d1d1f] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] bg-black/5 hover:bg-black/10 px-3.5 py-1.5 rounded-full transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-[#0071e3]" />
              Scan Table QR
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] px-4 py-1.5 rounded-full shadow-sm transition-all"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Order Food Now
            </Link>

            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#1d1d1f] shadow-sm hover:border-black/20"
              >
                <div className="w-2 h-2 rounded-full bg-[#30d158]" />
                <span className="truncate max-w-[100px]">{displayName}</span>
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

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#1d1d1f] hover:bg-black/5"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-black/[0.06] bg-[#f5f5f7] px-4 pt-2 pb-6 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#1d1d1f]">
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Explore Menus & Stalls
              </Link>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                How It Works
              </a>
              <a
                href="#multi-stall"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Multi-Stall Tray Demo
              </a>
              <a
                href="#ai-search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                AI Culinary Search
              </a>
              <a
                href="#food-halls"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Featured Food Halls
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Diner FAQ
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
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#0071e3] text-xs font-semibold text-white shadow-sm"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Browse Menus & Order
              </Link>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs text-[#0071e3] py-2 font-semibold"
              >
                For Food Court Operators & Stalls →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── CINEMATIC HERO SECTION ── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#0071e3]/10 via-[#30d158]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#30d158] animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-[#1d1d1f]">
              The Frictionless Hawker Experience
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08] max-w-4xl mx-auto">
            Order from every stall at your table. <br className="hidden sm:inline" />
            <span className="text-[#0071e3]">One simple checkout.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl lg:text-[21px] text-[#6e6e73] font-normal leading-relaxed max-w-2xl mx-auto tracking-[-0.01em]">
            Never guard a table with tissue packets again. Scan your table QR, mix and match dishes from all your favorite food court stalls into one tray, and get notified on your phone when each meal is ready.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-[0_2px_12px_rgba(0,113,227,0.28)] hover:shadow-[0_4px_18px_rgba(0,113,227,0.38)] hover:-translate-y-0.5"
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Browse Menus & Food Halls
            </Link>

            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#1d1d1f] bg-white border border-black/10 hover:bg-black/[0.03] transition-all shadow-sm hover:border-black/20"
            >
              <QrCode className="w-4 h-4 mr-2 text-[#0071e3]" />
              Scan Table QR
            </Link>
          </div>

          {/* Diner Feature Micro-badges */}
          <div className="mt-12 pt-8 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
              <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>No App Download Needed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
              <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>Multi-Stall Single Cart</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
              <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>DuitNow & eWallet Pay</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
              <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>Live Phone Buzzer</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE OLD WAY VS THE HAWKER WAY ── */}
      <section className="py-16 sm:py-24 bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
              Rethinking Food Court Dining
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mt-2">
              All the street food you love. <br />
              None of the dining headache.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 rounded-3xl bg-[#f5f5f7] border border-black/[0.06] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ff3b30]/10 text-[#ff3b30]">
                The Old Hawkers
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">Queues, Cash & Table Guarding</h3>
              <ul className="space-y-3 text-sm text-[#6e6e73]">
                <li className="flex items-start gap-3">
                  <span className="text-[#ff3b30] font-bold">✕</span>
                  <span>Choping tables with packets of tissue or keys while fearing someone takes your seat.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff3b30] font-bold">✕</span>
                  <span>Friends split up into 3 different stalls and queue with cash in hand.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff3b30] font-bold">✕</span>
                  <span>Standing in front of the stall holding hot soup trays waiting for your number.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff3b30] font-bold">✕</span>
                  <span>Finding out a dish is sold out after standing in a 20-minute line.</span>
                </li>
              </ul>
            </div>

            {/* The Hawker Way */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0071e3]/5 to-transparent border border-[#0071e3]/20 shadow-[0_12px_32px_rgba(0,113,227,0.06)] space-y-4 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#30d158]/15 text-[#248a3d]">
                The Hawker Way
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">Sit Together, Scan & Relax</h3>
              <ul className="space-y-3 text-sm text-[#1d1d1f]/85">
                <li className="flex items-start gap-3">
                  <span className="text-[#30d158] font-bold">✓</span>
                  <span>Take a seat immediately and scan your table QR with your mobile camera.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#30d158] font-bold">✓</span>
                  <span>Everyone browses all stalls together and adds their favorites to one bill.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#30d158] font-bold">✓</span>
                  <span>One single payment via DuitNow, GrabPay, Touch n Go, or Card.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#30d158] font-bold">✓</span>
                  <span>Your phone buzzes when each dish is cooked and ready for quick pickup.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE MULTI-STALL TRAY DEMO ── */}
      <section id="multi-stall" className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mt-2">
            The Multi-Stall Tray
          </h2>
          <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
            Add items from different hawker stalls into a single unified basket. Try toggling items below to see how our unified checkout handles multi-vendor routing automatically.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Header of Simulated Tray */}
          <div className="p-5 sm:p-6 bg-[#1d1d1f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-sm">
                T07
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Table 07 • Lot 10 Hutong</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#30d158] text-white font-bold">
                    Active Session
                  </span>
                </div>
                <p className="text-xs text-white/60">3 Stalls in this order • Unified Payment</p>
              </div>
            </div>

            <div className="text-right flex items-center gap-3 self-end sm:self-auto">
              <div>
                <p className="text-[11px] text-white/60">Total Bill</p>
                <p className="text-lg font-bold text-white">RM {trayTotal.toFixed(2)}</p>
              </div>
              <Link
                href="/menu"
                className="px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition-all"
              >
                Order in Real Life
              </Link>
            </div>
          </div>

          {/* Tray Items List */}
          <div className="p-6 divide-y divide-black/[0.06]">
            {SAMPLE_TRAY_ITEMS.map((item) => {
              const inTray = trayItems.some((i) => i.id === item.id);
              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#0071e3]">{item.stall}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-[#6e6e73] font-medium">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#1d1d1f]">{item.name}</p>
                    <div className="flex items-center gap-3 text-xs text-[#6e6e73]">
                      <span>RM {item.price.toFixed(2)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                        {item.prepTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTrayItem(item.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        inTray
                          ? 'bg-[#30d158]/15 text-[#248a3d] hover:bg-[#ff3b30]/10 hover:text-[#ff3b30]'
                          : 'bg-black/5 text-[#1d1d1f] hover:bg-black/10'
                      }`}
                    >
                      {inTray ? '✓ In Tray (Remove)' : '+ Add to Tray'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tray Breakdown Footer */}
          <div className="p-5 bg-[#f5f5f7] border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6e6e73]">
            <div className="flex items-center gap-4">
              <span>Dishes: <strong className="text-[#1d1d1f]">{trayItems.length}</strong></span>
              <span>Subtotal: <strong className="text-[#1d1d1f]">RM {traySubtotal.toFixed(2)}</strong></span>
              <span>Platform Fee: <strong className="text-[#1d1d1f]">RM {platformFee.toFixed(2)}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#30d158] font-semibold">● 100% Automated Multi-Merchant Routing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW ORDERING WORKS (STEP BY STEP) ── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
              Step-by-Step Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mt-2">
              How Table Ordering Works
            </h2>
            <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
              Designed from the ground up for busy food halls. From arrival to your first bite in under 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-[#f5f5f7] border border-black/[0.04] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">Scan Your Table QR</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Take a seat anywhere in the hawker centre. Point your smartphone camera at the QR code sticker on the table. The digital food court opens immediately with no app install required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-[#f5f5f7] border border-black/[0.04] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">Mix & Match from Stalls</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Browse vibrant photo menus from every active stall in the building. Add chicken rice, char kway teow, and iced drinks to your shared basket and pay with DuitNow, TNG, or Card.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-[#f5f5f7] border border-black/[0.04] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#30d158]/15 text-[#248a3d] flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">Pick Up When It Buzzes</h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                Chat and relax with your table. Each kitchen receives your ticket instantly on their display. When a dish is ready, your phone vibrates and notifies you to pick it up from the counter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI CULINARY SEARCH SHOWCASE ── */}
      <section id="ai-search" className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Culinary Assistant
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mt-2">
            Craving Something Specific? Just Ask.
          </h2>
          <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
            Our AI understands local Malaysian food slang, dietary restrictions, and flavor cravings to match you with the best dish across 50+ stalls in seconds.
          </p>
        </div>

        {/* AI Query Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {AI_SEARCH_PREVIEWS.map((query, index) => (
            <button
              key={query.prompt}
              type="button"
              onClick={() => setActiveAiQuery(index)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeAiQuery === index
                  ? 'bg-[#0071e3] text-white shadow-sm'
                  : 'bg-white border border-black/10 text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              &ldquo;{query.prompt}&rdquo;
            </button>
          ))}
        </div>

        {/* AI Match Result Card */}
        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.06)] p-6 sm:p-8 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0071e3]">
              <Sparkles className="w-4 h-4" />
              <span>AI Culinary Recommendation</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#248a3d]">
              {AI_SEARCH_PREVIEWS[activeAiQuery].tag}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-[#6e6e73]">
              Query: &ldquo;{AI_SEARCH_PREVIEWS[activeAiQuery].prompt}&rdquo;
            </p>
            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-[#1d1d1f]">
                  {AI_SEARCH_PREVIEWS[activeAiQuery].matchedDish}
                </h4>
                <span className="font-bold text-sm text-[#0071e3]">
                  {AI_SEARCH_PREVIEWS[activeAiQuery].price}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#6e6e73]">
                {AI_SEARCH_PREVIEWS[activeAiQuery].stall}
              </p>
              <p className="text-xs text-[#1d1d1f]/80 italic pt-1 border-t border-black/[0.04]">
                &ldquo;{AI_SEARCH_PREVIEWS[activeAiQuery].reason}&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] px-4 py-2 rounded-full shadow-sm transition-all"
            >
              Order This Dish
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED FOOD HALLS DIRECTORY ── */}
      <section id="food-halls" className="py-16 sm:py-24 bg-white border-y border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
                Discover Venues
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mt-2">
                Popular Food Halls on Hawker
              </h2>
              <p className="text-sm text-[#6e6e73] mt-1">
                Explore menus from famous hawker centres across Malaysia & Singapore.
              </p>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline"
            >
              Browse all food courts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_FOOD_HALLS.map((hall) => (
              <div
                key={hall.id}
                className="bg-[#f5f5f7] rounded-3xl p-6 border border-black/[0.04] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{hall.image}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#1d1d1f]">
                      {hall.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#1d1d1f]">{hall.name}</h3>
                  <p className="text-xs text-[#6e6e73] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0071e3]" />
                    {hall.location}
                  </p>

                  <div className="mt-4 pt-3 border-t border-black/[0.06] space-y-2">
                    <div className="flex justify-between text-xs text-[#6e6e73]">
                      <span>Stall Vendors:</span>
                      <strong className="text-[#1d1d1f]">{hall.stallsCount} Stalls</strong>
                    </div>
                    <div className="flex justify-between text-xs text-[#6e6e73]">
                      <span>Diner Rating:</span>
                      <strong className="text-[#30d158]">★ {hall.rating}</strong>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {hall.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-black/[0.06] text-[#6e6e73]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/menu"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-full bg-white border border-black/10 hover:bg-black/[0.02] text-xs font-semibold text-[#1d1d1f] transition-all"
                >
                  View Menu & Stalls
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOMER FAQ (ACCORDION) ── */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mt-2">
            Frequently Asked Questions by Diners
          </h2>
          <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
            Everything you need to know about using Hawker at your dining table.
          </p>
        </div>

        <div className="space-y-3">
          {CUSTOMER_FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#1d1d1f] hover:bg-black/[0.02] transition-colors"
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
                  <div className="px-5 pb-4 text-xs sm:text-sm text-[#6e6e73] leading-relaxed border-t border-black/[0.04] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FINAL DINER CALL TO ACTION ── */}
      <section className="py-20 bg-[#1d1d1f] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 mb-4">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#2997ff]" />
            Your Next Meal Awaits
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Sit comfortably. Order effortlessly. <br />
            Eat authentically.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl mx-auto">
            Experience the future of street food culture. Browse all menus or scan your table QR code to start eating.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-md"
            >
              Explore Food Halls & Menus
            </Link>
            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-all"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan Table QR
            </Link>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER FOOTER ── */}
      <footer className="bg-white border-t border-black/[0.06] py-12 text-xs text-[#6e6e73]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2">
              <p className="font-semibold text-[#1d1d1f]">Diner Experience</p>
              <ul className="space-y-1.5">
                <li><Link href="/menu" className="hover:text-[#1d1d1f]">Browse Menus</Link></li>
                <li><Link href="/scan" className="hover:text-[#1d1d1f]">Scan Table QR</Link></li>
                <li><Link href="/home" className="hover:text-[#1d1d1f]">Customer Home</Link></li>
                <li><Link href="/orders" className="hover:text-[#1d1d1f]">Track Active Orders</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-[#1d1d1f]">Food Discovery</p>
              <ul className="space-y-1.5">
                <li><a href="#food-halls" className="hover:text-[#1d1d1f]">Famous Food Halls</a></li>
                <li><a href="#ai-search" className="hover:text-[#1d1d1f]">AI Food Search</a></li>
                <li><a href="#multi-stall" className="hover:text-[#1d1d1f]">Multi-Stall Basket</a></li>
                <li><a href="#how-it-works" className="hover:text-[#1d1d1f]">How Ordering Works</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-[#1d1d1f]">For Venue Operators</p>
              <ul className="space-y-1.5">
                <li><Link href="/" className="hover:text-[#1d1d1f]">Hawker for Food Halls</Link></li>
                <li><Link href="/apply" className="hover:text-[#1d1d1f]">Register Your Shop</Link></li>
                <li><Link href="/pricing" className="hover:text-[#1d1d1f]">Pricing & Plans</Link></li>
                <li><Link href="/shop-owner/booths" className="hover:text-[#1d1d1f]">Shop Dashboard</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-[#1d1d1f]">Platform & Legal</p>
              <ul className="space-y-1.5">
                <li><a href="#faq" className="hover:text-[#1d1d1f]">Customer FAQ</a></li>
                <li><Link href="/auth" className="hover:text-[#1d1d1f]">Sign In / Register</Link></li>
                <li><span className="text-[#86868b]">Zero Hidden Fees</span></li>
                <li><span className="text-[#86868b]">Privacy & Security</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#0071e3] text-white flex items-center justify-center font-bold text-[10px]">
                H
              </div>
              <span className="text-[#1d1d1f] font-semibold">Hawker</span>
              <span>• The Operating System for Street Food & Hawker Centres</span>
            </div>
            <p>© {new Date().getFullYear()} Hawker Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
