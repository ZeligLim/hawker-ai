'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  Check,
  Store,
  UtensilsCrossed,
  Smartphone,
  BarChart3,
  QrCode,
  Sparkles,
  Clock,
  Users,
  ShieldCheck,
  Zap,
  Search,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  TrendingUp,
  Menu,
  X,
  ChefHat,
  Receipt,
  Laptop,
  Activity,
  Flame,
  CreditCard,
  Building2,
  KeyRound,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'operator' | 'kitchen' | 'customer'>('operator');
  const [activeAiIndex, setActiveAiIndex] = useState(0);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleCopyCode = () => {
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const aiQueries = [
    {
      query: 'Craving something spicy with chicken and rice near Table 4',
      intent: {
        category: 'Rice Dishes',
        protein: 'Chicken',
        flavorProfile: ['Spicy', 'Fragrant'],
        dietary: ['Halal Options'],
        maxPrice: 'RM 18.00',
      },
      result: {
        dish: 'Nasi Lemak Kukus with Ayam Goreng Berempah',
        stall: 'Stall 08 • Madam Kwan Kitchen',
        price: 'RM 14.50',
        prepTime: '6 mins',
        matchReason: '98% match • Freshly spiced sambal, lemongrass fried chicken',
      },
    },
    {
      query: 'Comforting hot soup noodles on a rainy day, no pork',
      intent: {
        category: 'Noodle Soup',
        broth: 'Rich & Comforting',
        dietary: ['No Pork', 'Halal-friendly'],
        temperature: 'Hot Broth',
        maxPrice: 'RM 20.00',
      },
      result: {
        dish: 'Traditional Claypot Seafood Yee Mee',
        stall: 'Stall 03 • Ah Fatt Claypot Special',
        price: 'RM 16.00',
        prepTime: '8 mins',
        matchReason: '96% match • Hot ginger egg drop broth, fresh tiger prawns',
      },
    },
    {
      query: 'Quick iced dessert and street snacks under RM10',
      intent: {
        category: 'Dessert & Snacks',
        temperature: 'Iced / Chilled',
        speed: 'Fast Dispatch (< 4m)',
        maxPrice: 'RM 10.00',
      },
      result: {
        dish: 'Signature Shaved Ice Cendol & 5pc Chicken Satay',
        stall: 'Stall 12 • Penang Road Famous Cendol',
        price: 'RM 9.50',
        prepTime: '3 mins',
        matchReason: '99% match • Gula Melaka shaved ice, peanut dipping sauce',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
      {/* ── Apple Top Ribbon ── */}
      <div className="bg-[#1d1d1f] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-tight">
        <span>Introducing Hawker OS 2.0</span>
        <span className="mx-2 text-white/40">•</span>
        <span className="text-white/80">The complete operating system for modern food halls & hawker centres.</span>
        <Link href="/pricing" className="ml-2 inline-flex items-center text-[#2997ff] hover:underline font-semibold">
          Explore pricing <ChevronRight className="w-3 h-3 ml-0.5 inline" />
        </Link>
      </div>

      {/* ── Sticky Apple Navigation Bar ── */}
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
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#1d1d1f]/75">
            <a href="#product" className="hover:text-[#1d1d1f] transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-[#1d1d1f] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#1d1d1f] transition-colors">
              How It Works
            </a>
            <a href="#intelligence" className="hover:text-[#1d1d1f] transition-colors">
              AI Discovery
            </a>
            <a href="#roles" className="hover:text-[#1d1d1f] transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="hover:text-[#1d1d1f] transition-colors">
              Pricing
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/booths/join"
              className="text-xs font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-all"
            >
              Join Booth
            </Link>
            <Link
              href="/auth"
              className="text-xs font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/subscribe"
              className="text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] px-3.5 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:shadow"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1d1d1f] rounded-lg hover:bg-black/[0.05]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-black/[0.08] px-4 pt-3 pb-6 space-y-3">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#1d1d1f] border-b border-black/[0.04]"
            >
              Platform Overview
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#1d1d1f] border-b border-black/[0.04]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#1d1d1f] border-b border-black/[0.04]"
            >
              How It Works
            </a>
            <a
              href="#intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#1d1d1f] border-b border-black/[0.04]"
            >
              AI Food Intelligence
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#1d1d1f] border-b border-black/[0.04]"
            >
              Pricing
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/subscribe"
                className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-[#0071e3]"
              >
                Start Free
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/booths/join"
                  className="text-center py-2 rounded-full text-xs font-medium border border-black/10 bg-white"
                >
                  Join Booth
                </Link>
                <Link
                  href="/auth"
                  className="text-center py-2 rounded-full text-xs font-medium border border-black/10 bg-white"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION (Apple Product Hero) ── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32 overflow-hidden">
        {/* Subtle radial ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#0071e3]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#30d158] animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-[#1d1d1f]">
              Hawker Centre Operating System
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.06] max-w-4xl mx-auto">
            Run your hawker centre with quiet precision.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl lg:text-[22px] text-[#6e6e73] font-normal leading-relaxed max-w-2xl mx-auto tracking-[-0.01em]">
            Manage multi-stall menus, route kitchen orders without chaos, and track live venue sales from one unified, beautifully engineered platform.
          </p>

          {/* Apple Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/subscribe"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-[0_2px_10px_rgba(0,113,227,0.25)] hover:shadow-[0_4px_16px_rgba(0,113,227,0.35)]"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a
              href="#product"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-[#1d1d1f] bg-white/90 border border-black/[0.1] hover:bg-white hover:border-black/[0.2] transition-all shadow-sm"
            >
              See how it works
              <ChevronRight className="w-4 h-4 ml-1 text-[#6e6e73]" />
            </a>
          </div>

          {/* Apple Micro Footnote */}
          <p className="mt-4 text-xs text-[#86868b]">
            Zero monthly subscriptions &bull; Small cut from payments &bull; 1-tap automated out-of-stock refunds
          </p>

          {/* High-level Apple Metric Strip */}
          <div className="mt-14 pt-8 border-t border-black/[0.06] grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">15 min</p>
              <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">Average venue setup</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">0 sec</p>
              <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">Customer app download</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">100%</p>
              <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">Direct kitchen dispatch</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">1 Tap</p>
              <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">Multi-stall checkout</p>
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE PRODUCT STUDIO DISPLAY SHOWCASE ── */}
        <div id="product" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-18">
          {/* Segmented Control Switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-black/[0.06] backdrop-blur-md rounded-full border border-black/[0.04]">
              <button
                onClick={() => setActiveShowcaseTab('operator')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeShowcaseTab === 'operator'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                Food Court Operator
              </button>
              <button
                onClick={() => setActiveShowcaseTab('kitchen')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeShowcaseTab === 'kitchen'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                Stall Kitchen View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('customer')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeShowcaseTab === 'customer'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                Diner QR Experience
              </button>
            </div>
          </div>

          {/* Apple Hardware Display Frame */}
          <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#1d1d1f] p-2.5 sm:p-4 shadow-[0_30px_100px_rgba(0,0,0,0.18)] border border-black/10">
            {/* Top Bar of Hardware Display */}
            <div className="flex items-center justify-between px-3 py-2 text-white/50 text-[11px] border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="ml-3 text-white/70 font-mono text-[10px]">app.hawker.com &mdash; Lot 10 Hutong Food Hall</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[#30d158] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-ping" />
                  Live Sync
                </span>
                <span className="text-white/40">14 Booths Active</span>
              </div>
            </div>

            {/* Display Canvas */}
            <div className="bg-[#fbfbfd] rounded-[20px] sm:rounded-[26px] p-4 sm:p-7 text-[#1d1d1f] min-h-[460px] overflow-hidden">
              {/* TAB 1: Operator View */}
              {activeShowcaseTab === 'operator' && (
                <div className="space-y-6">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-sm">
                      <p className="text-xs text-[#86868b] font-medium">Today&apos;s Gross Sales</p>
                      <p className="text-xl sm:text-2xl font-semibold mt-1 tracking-tight">RM 18,490.50</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30d158] mt-1">
                        <TrendingUp className="w-3 h-3" /> +24.8% vs yesterday
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-sm">
                      <p className="text-xs text-[#86868b] font-medium">Total Orders Fulfilled</p>
                      <p className="text-xl sm:text-2xl font-semibold mt-1 tracking-tight">1,248</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868b] mt-1">
                        Peak: 12:45 PM &bull; 8.2/min
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-sm">
                      <p className="text-xs text-[#86868b] font-medium">Average Prep Velocity</p>
                      <p className="text-xl sm:text-2xl font-semibold mt-1 tracking-tight">6.8 mins</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30d158] mt-1">
                        <Zap className="w-3 h-3" /> 1.4m faster than avg
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-sm">
                      <p className="text-xs text-[#86868b] font-medium">Active Table Sessions</p>
                      <p className="text-xl sm:text-2xl font-semibold mt-1 tracking-tight">42 / 50</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0071e3] mt-1">
                        84% floor capacity
                      </span>
                    </div>
                  </div>

                  {/* Real-time Booth Roster Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">Live Booth Operations</h4>
                      <span className="text-xs text-[#86868b]">Auto-updates every 2s</span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        {
                          name: 'Ah Fatt Chicken Rice',
                          stall: 'Booth 01',
                          revenue: 'RM 4,210',
                          orders: 142,
                          status: 'Optimal',
                          statusColor: 'text-[#30d158] bg-[#30d158]/10',
                          badge: 'Popular',
                        },
                        {
                          name: 'Jalan Alor Char Kway Teow',
                          stall: 'Booth 04',
                          revenue: 'RM 3,890',
                          orders: 128,
                          status: 'Rush Hour',
                          statusColor: 'text-[#ff9f0a] bg-[#ff9f0a]/10',
                          badge: '6 orders queue',
                        },
                        {
                          name: 'Madam Kwan Nasi Lemak',
                          stall: 'Booth 08',
                          revenue: 'RM 4,680',
                          orders: 164,
                          status: 'Optimal',
                          statusColor: 'text-[#30d158] bg-[#30d158]/10',
                          badge: 'Top revenue',
                        },
                        {
                          name: 'Pak Mat Satay & Rojak',
                          stall: 'Booth 05',
                          revenue: 'RM 2,840',
                          orders: 98,
                          status: 'Optimal',
                          statusColor: 'text-[#30d158] bg-[#30d158]/10',
                          badge: 'Fast prep (4m)',
                        },
                        {
                          name: 'Penang Famous Cendol',
                          stall: 'Booth 12',
                          revenue: 'RM 1,640',
                          orders: 110,
                          status: 'Optimal',
                          statusColor: 'text-[#30d158] bg-[#30d158]/10',
                          badge: 'Dessert leader',
                        },
                        {
                          name: 'Klang Valley Claypot Corner',
                          stall: 'Booth 09',
                          revenue: 'RM 1,230',
                          orders: 46,
                          status: 'Prep Shift',
                          statusColor: 'text-[#0071e3] bg-[#0071e3]/10',
                          badge: 'Normal flow',
                        },
                      ].map((booth) => (
                        <div
                          key={booth.name}
                          className="bg-white p-3.5 rounded-xl border border-black/[0.05] hover:border-black/[0.12] transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">
                                {booth.stall}
                              </span>
                              <p className="text-xs font-semibold text-[#1d1d1f] truncate max-w-[150px]">{booth.name}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${booth.statusColor}`}>
                              {booth.status}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
                            <span className="font-semibold text-[#1d1d1f]">{booth.revenue}</span>
                            <span className="text-[#86868b]">{booth.orders} orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Kitchen Display View */}
              {activeShowcaseTab === 'kitchen' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1d1d1f] text-white p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-[#f5f5f7]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 font-medium">Stall Kitchen Display &bull; Booth #04</p>
                        <h4 className="text-sm font-semibold tracking-tight text-white">Jalan Alor Char Kway Teow</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-[#30d158]/20 text-[#30d158] font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#30d158]" /> Audio Chimes Active
                      </span>
                      <span className="text-white/60">3 Active Wok Tickets</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl border-2 border-[#ff9f0a] p-4 shadow-sm relative">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1d1d1f]">Ticket #1042</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] font-bold text-[10px]">
                          Table 14 &bull; 4m ago
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 border-y border-black/[0.06] py-3 text-xs">
                        <div className="font-medium text-[#1d1d1f]">
                          <p className="font-bold text-sm">2x Signature Duck Egg Kway Teow</p>
                          <p className="text-[11px] text-[#ff3b30] font-semibold mt-0.5">&bull; Extra Spicy Sambal</p>
                          <p className="text-[11px] text-[#6e6e73]">&bull; Crispy Pork Lard Extra</p>
                        </div>
                      </div>
                      <button className="mt-3 w-full py-2 rounded-xl text-xs font-semibold bg-[#30d158] text-white hover:bg-[#28b84d] transition-colors">
                        Mark Ready for Table 14
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-black/[0.08] p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1d1d1f]">Ticket #1043</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] font-bold text-[10px]">
                          Table 08 &bull; 2m ago
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 border-y border-black/[0.06] py-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-[#1d1d1f]">
                            <p className="font-bold text-sm">1x Seafood Fried Hor Fun</p>
                            <p className="text-[11px] text-[#0071e3] font-semibold mt-0.5">&bull; Egg Gravy on Side</p>
                            <p className="text-[11px] text-[#6e6e73]">&bull; Pickled Green Chilies</p>
                          </div>
                          <button className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0 hover:bg-rose-100">
                            Sold Out / Refund
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-[#1d1d1f]">STALL TOTAL: RM 15.50</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          PAID (0% Cut)
                        </span>
                      </div>
                      <button className="mt-3 w-full py-2 rounded-xl text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors">
                        Move to Wok
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-black/[0.08] p-4 shadow-sm opacity-85">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1d1d1f]">Ticket #1044</span>
                        <span className="px-2 py-0.5 rounded-full bg-black/[0.05] text-[#86868b] font-bold text-[10px]">
                          Takeaway &bull; Just now
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 border-y border-black/[0.06] py-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-[#1d1d1f]">
                            <p className="font-bold text-sm">3x Black Sauce Fried Carrot Cake</p>
                            <p className="text-[11px] text-[#6e6e73] mt-0.5">&bull; Mild Spicy, extra chives</p>
                          </div>
                          <button className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0 hover:bg-rose-100">
                            Sold Out / Refund
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-[#1d1d1f]">STALL TOTAL: RM 24.00</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          PAID (0% Cut)
                        </span>
                      </div>
                      <button className="mt-3 w-full py-2 rounded-xl text-xs font-semibold bg-black/[0.05] text-[#1d1d1f] hover:bg-black/[0.1] transition-colors">
                        Accept Order
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Customer Mobile Experience */}
              {activeShowcaseTab === 'customer' && (
                <div className="max-w-md mx-auto bg-white rounded-3xl border border-black/[0.1] shadow-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
                        12
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1d1d1f]">Table 12 &bull; Lot 10 Hutong</p>
                        <p className="text-[10px] text-[#86868b]">Receipt &bull; Verified Payment</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#30d158]/10 text-[#30d158]">
                      PAID via eWallet
                    </span>
                  </div>

                  <div className="bg-[#f5f5f7] p-3.5 rounded-2xl space-y-2 text-xs">
                    <p className="font-semibold text-[11px] text-[#86868b] uppercase tracking-wider">
                      Multi-Stall Cart (1 Order, 2 Kitchens)
                    </p>
                    <div className="flex items-center justify-between font-medium">
                      <span>1x Nasi Lemak Rendang (Booth 08)</span>
                      <span className="font-bold text-[#1d1d1f]">RM 15.50</span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span>1x Iced White Coffee (Booth 14)</span>
                      <span className="font-bold text-[#1d1d1f]">RM 4.80</span>
                    </div>
                    <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#6e6e73]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#1d1d1f]">RM 20.30</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6e6e73]">
                      <span>Platform Fee (Flat Diner Fee)</span>
                      <span className="font-medium text-[#1d1d1f]">RM 0.50</span>
                    </div>
                    <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between font-bold text-sm">
                      <span>Total Paid</span>
                      <span className="text-[#0071e3]">RM 20.80</span>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-full text-xs font-bold bg-[#1d1d1f] text-white shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" /> Paid via Apple Pay / Touch &apos;n Go QR
                  </button>
                  <p className="text-center text-[10px] text-[#86868b]">
                    0% hawker cut &bull; 1-Tap out-of-stock refunds direct to eWallet &bull; No app download
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM & THE SOLUTION (Apple Contrast) ── */}
      <section className="py-20 sm:py-28 bg-white border-y border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#0071e3] mb-3">
              The Food Hall Paradigm
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              The friction of old food halls. Reimagined.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6e6e73]">
              Traditional hawker centres suffer from fragmented queues, cash bottlenecks, and zero centralized operational data. Hawker unifies the entire room.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <div className="bg-[#f5f5f7] p-8 sm:p-10 rounded-[32px] border border-black/[0.04] flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/[0.06] text-[#6e6e73] mb-6">
                  The Old Way
                </span>
                <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                  Chaos, paper slips, and blind spots.
                </h3>
                <ul className="mt-6 space-y-4 text-sm text-[#515154]">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      &times;
                    </span>
                    <span>
                      <strong>Customers wait in 4 separate lines</strong> just to assemble a single meal for their family.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      &times;
                    </span>
                    <span>
                      <strong>Booth owners shout order numbers</strong> over noisy dining crowds, leading to cold dishes and walkouts.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      &times;
                    </span>
                    <span>
                      <strong>Venue managers have zero visibility</strong> into daily gross sales, stall turnover, or peak congestion.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-black/[0.06] text-xs text-[#86868b]">
                Result: Lost sales, customer frustration, and painful paper accounting.
              </div>
            </div>

            {/* The Hawker Way */}
            <div className="bg-[#1d1d1f] text-white p-8 sm:p-10 rounded-[32px] shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#0071e3]/20 text-[#2997ff] mb-6">
                  The Hawker Way
                </span>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  One platform. Total clarity.
                </h3>
                <ul className="mt-6 space-y-4 text-sm text-[#d2d2d7]">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#30d158]/20 text-[#30d158] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>
                      <strong>One QR code per table</strong> allows diners to browse every stall and checkout in one seamless transaction.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#30d158]/20 text-[#30d158] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>
                      <strong>Automatic sub-order routing</strong> splits the ticket instantly to each stall&apos;s kitchen screen or mobile.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#30d158]/20 text-[#30d158] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>
                      <strong>Live operator dashboard</strong> tracks every ringgit, peak hour surges, and stall performance in real time.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50 flex items-center justify-between">
                <span>Result: +28% average ticket size &bull; zero lost orders</span>
                <span className="text-[#2997ff] font-semibold">100% Automated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: 4-STEP ONBOARDING & INVITATION ARCHITECTURE ── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#0071e3] mb-3">
              Frictionless Setup
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              Up and running in four simple steps.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6e6e73]">
              From food hall creation to live table ordering in under 15 minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create Your Venue',
                desc: 'Register your food court or hawker centre. Set table count, currency, and operating hours in minutes.',
                icon: Building2,
              },
              {
                step: '02',
                title: 'Provision Stalls',
                desc: 'Add booth slots (e.g. Stall 01 - Chicken Rice, Stall 02 - Noodles) with customizable category tags.',
                icon: Store,
              },
              {
                step: '03',
                title: 'Dispatch Invite Codes',
                desc: 'Generate secure single-use 8-character codes. Stall owners redeem and activate their digital stall.',
                icon: KeyRound,
              },
              {
                step: '04',
                title: 'Deploy Table QRs',
                desc: 'Print table badges. Customers scan, browse live menus, order across stalls, and pay instantly.',
                icon: QrCode,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white p-7 rounded-[28px] border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-1 rounded-full">
                      Step {item.step}
                    </span>
                    <item.icon className="w-5 h-5 text-[#86868b]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Invitation Flow Deep Dive */}
          <div className="mt-12 bg-white rounded-[32px] p-6 sm:p-10 border border-black/[0.06] shadow-sm">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
                  The Booth Invitation Flow
                </span>
                <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mt-2">
                  No complex setup for your stall holders.
                </h3>
                <p className="mt-3 text-sm text-[#6e6e73] leading-relaxed">
                  Food court operators shouldn&apos;t have to be IT administrators. When you create a booth in Hawker, you generate a cryptographically hashed invite code. The stall owner visits <span className="font-mono text-xs bg-black/[0.05] px-1.5 py-0.5 rounded">hawker.com/booths/join</span>, pastes the code, and their kitchen is live.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#1d1d1f]">
                    <ShieldCheck className="w-4 h-4 text-[#30d158]" /> Single-use security token
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#1d1d1f]">
                    <Clock className="w-4 h-4 text-[#0071e3]" /> 48-hour expiration safety
                  </div>
                </div>
              </div>

              {/* Interactive Mock Invite Code Card */}
              <div className="bg-[#f5f5f7] p-5 sm:p-6 rounded-2xl border border-black/[0.08]">
                <div className="flex items-center justify-between text-xs text-[#86868b] mb-3">
                  <span>Generated by Shop Owner</span>
                  <span className="text-[#30d158] font-semibold">Active & Valid</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-black/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold">
                      Booth #04 Invitation Key
                    </p>
                    <p className="text-xl font-mono font-bold tracking-widest text-[#1d1d1f] mt-0.5">
                      HKR-8F92-KL
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors"
                  >
                    {copiedInvite ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-[#6e6e73]">
                  <span>Stall: Jalan Alor Char Kway Teow</span>
                  <Link href="/booths/join" className="text-[#0071e3] font-semibold hover:underline">
                    Test redemption flow &rsaquo;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO BOX FEATURE GRID (Apple Bento Style) ── */}
      <section id="features" className="py-20 sm:py-28 bg-white border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#0071e3] mb-3">
              Comprehensive Capability
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              Engineered for speed. Built for scale.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6e6e73]">
              Every tool a modern food hall needs, seamlessly woven together into a unified experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Multi-Stall Unified Cart (Span 2) */}
            <div className="md:col-span-2 bg-[#f5f5f7] p-8 sm:p-10 rounded-[32px] border border-black/[0.06] flex flex-col justify-between hover:border-black/[0.12] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#0071e3] shadow-sm mb-6">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
                  Unified Checkout
                </span>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
                  One order. One payment. Multiple stalls.
                </h3>
                <p className="mt-3 text-sm text-[#6e6e73] max-w-xl leading-relaxed">
                  Diners can select satay from Stall 1, laksa from Stall 4, and iced teh tarik from the drink stall in one digital basket. Hawker handles the sub-order breakdown, kitchen dispatch, and payment splits automatically.
                </p>
              </div>
              <div className="mt-8 bg-white p-4 rounded-2xl border border-black/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-medium text-[#1d1d1f]">Supported Payments:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] font-semibold text-[#1d1d1f]">DuitNow QR</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] font-semibold text-[#1d1d1f]">Touch &apos;n Go</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] font-semibold text-[#1d1d1f]">Apple Pay</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] font-semibold text-[#1d1d1f]">Credit Cards</span>
                </div>
              </div>
            </div>

            {/* Bento 2: Zero App Download QR Tables */}
            <div className="bg-[#f5f5f7] p-8 sm:p-10 rounded-[32px] border border-black/[0.06] flex flex-col justify-between hover:border-black/[0.12] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#30d158] shadow-sm mb-6">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#30d158] uppercase tracking-wider">
                  Zero Friction
                </span>
                <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
                  Instant Web App
                </h3>
                <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                  No App Store downloads. No password signups. Diners scan the table QR code and the full menu opens in 0.8 seconds on Safari or Chrome.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>Fast Edge Delivery</span>
                <span>&lt; 1s LCP</span>
              </div>
            </div>

            {/* Bento 3: Live Merchant Autonomy */}
            <div className="bg-[#f5f5f7] p-8 sm:p-10 rounded-[32px] border border-black/[0.06] flex flex-col justify-between hover:border-black/[0.12] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#ff9f0a] shadow-sm mb-6">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#ff9f0a] uppercase tracking-wider">
                  Stall Control
                </span>
                <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
                  Stall Autonomy
                </h3>
                <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
                  Stalls customize up to 10 modifiers per dish (extra cockles, noodle choice, chili level) and 1-tap 86/sold-out toggle during lunch rushes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>Modifiers & Customisations</span>
                <span>Up to 10 / dish</span>
              </div>
            </div>

            {/* Bento 4: Live Telemetry & Revenue Split (Span 2) */}
            <div className="md:col-span-2 bg-[#f5f5f7] p-8 sm:p-10 rounded-[32px] border border-black/[0.06] flex flex-col justify-between hover:border-black/[0.12] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#bf5af2] shadow-sm mb-6">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#bf5af2] uppercase tracking-wider">
                  Operator Analytics
                </span>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
                  Granular food hall telemetry.
                </h3>
                <p className="mt-3 text-sm text-[#6e6e73] max-w-xl leading-relaxed">
                  Compare performance across woks, track hourly customer surges, and generate automatic end-of-day revenue reconciliation for booth lease percentages.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="text-[10px] text-[#86868b] font-medium">Daily Report</p>
                  <p className="text-sm font-semibold text-[#1d1d1f] mt-0.5">Automated PDF / CSV</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="text-[10px] text-[#86868b] font-medium">Lease Payouts</p>
                  <p className="text-sm font-semibold text-[#1d1d1f] mt-0.5">Split Calculation</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-black/[0.05]">
                  <p className="text-[10px] text-[#86868b] font-medium">Dish Popularity</p>
                  <p className="text-sm font-semibold text-[#1d1d1f] mt-0.5">Live Heatmap</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI DISCOVERY SECTION (Apple Intelligence Vibe) ── */}
      <section id="intelligence" className="py-20 sm:py-28 bg-[#0b0c0e] text-white overflow-hidden relative">
        {/* Apple Intelligence Aurora Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#0071e3]/20 via-[#bf5af2]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-[#2997ff] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
              Hawker Food Intelligence
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white">
              Culinary discovery. Without hallucinations.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              Diners search how they speak: &ldquo;Spicy noodles with seafood under RM18.&rdquo; OpenRouter parses intent into strict Zod schemas, then executes deterministic Supabase queries. Zero AI fantasy. 100% verified dishes.
            </p>
          </div>

          {/* Interactive AI Query Simulator */}
          <div className="bg-[#16171a] rounded-[32px] border border-white/10 p-6 sm:p-10 shadow-2xl">
            {/* Prompt Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {aiQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAiIndex(idx)}
                  className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
                    activeAiIndex === idx
                      ? 'bg-white text-[#1d1d1f] shadow-md font-semibold'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  Prompt #{idx + 1}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Input Query & Extracted Structured Intent */}
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                    Natural Language Search Prompt
                  </p>
                  <p className="text-sm sm:text-base font-medium text-white mt-1">
                    &ldquo;{aiQueries[activeAiIndex].query}&rdquo;
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 font-mono text-xs text-[#2997ff] space-y-1">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans font-semibold mb-2">
                    Validated SearchIntent (Zod Output)
                  </p>
                  <p>&#123;</p>
                  <p className="pl-4">category: &quot;{aiQueries[activeAiIndex].intent.category}&quot;,</p>
                  <p className="pl-4">dietary: {JSON.stringify(aiQueries[activeAiIndex].intent.dietary)},</p>
                  <p className="pl-4">maxPrice: &quot;{aiQueries[activeAiIndex].intent.maxPrice}&quot;</p>
                  <p>&#125;</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/50">
                  <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                  <span>Strict SQL isolation &bull; OpenRouter AI never touches database credentials</span>
                </div>
              </div>

              {/* Right: Matched Live Dish Result */}
              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 rounded-3xl border border-white/15">
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <span className="font-mono text-[11px] text-[#30d158] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#30d158]" />
                    Deterministic Database Match
                  </span>
                  <span>Supabase Verified</span>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        {aiQueries[activeAiIndex].result.dish}
                      </h4>
                      <p className="text-xs text-[#2997ff] font-medium mt-0.5">
                        {aiQueries[activeAiIndex].result.stall}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {aiQueries[activeAiIndex].result.price}
                    </span>
                  </div>

                  <p className="text-xs text-white/70">
                    {aiQueries[activeAiIndex].result.matchReason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Prep: {aiQueries[activeAiIndex].result.prepTime}
                    </span>
                    <span className="text-[#30d158] font-medium">In Stock &bull; Live Wok</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS BY ROLE (Shop Owner vs Booth Owner) ── */}
      <section id="roles" className="py-20 sm:py-28 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#0071e3] mb-3">
              Tailored Experiences
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              Designed for operators. Built for cooks.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6e6e73]">
              Two dedicated interfaces reflecting the dual reality of a bustling food court.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Role 1: Food Court Operator */}
            <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-black/[0.06] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                  Food Court & Centre Operators
                </h3>
                <p className="mt-3 text-sm text-[#6e6e73] leading-relaxed">
                  Oversee all booths, manage table layouts, dispatch invite tokens, and track venue-wide revenue with full financial isolation.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#1d1d1f]">
                  {[
                    'Multi-booth roster & occupancy overview',
                    'Single-click cryptographic booth invite codes',
                    'Consolidated real-time gross venue revenue',
                    'Automated stall lease & tenancy settlement reporting',
                    'Full export of order chits and financial reports',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#0071e3] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-black/[0.06]">
                <Link
                  href="/subscribe"
                  className="w-full inline-flex items-center justify-center py-3 rounded-full text-sm font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors"
                >
                  Start as Venue Operator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Role 2: Booth Owner */}
            <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-black/[0.06] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center font-bold mb-6">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                  Independent Stall & Booth Masters
                </h3>
                <p className="mt-3 text-sm text-[#6e6e73] leading-relaxed">
                  Your kitchen. Your recipes. Your orders. Manage your menu, set custom spice levels, and fulfill incoming orders without noisy buzzers.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#1d1d1f]">
                  {[
                    'Instant KDS (Kitchen Display System) on any phone or iPad',
                    '1-tap dish availability & sold-out controls',
                    'Custom ingredient options & extra egg / noodle add-ons',
                    'Audio alerts for new incoming woks & table orders',
                    'Complete isolation from neighboring stalls',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-black/[0.06]">
                <Link
                  href="/booths/join"
                  className="w-full inline-flex items-center justify-center py-3 rounded-full text-sm font-semibold border border-black/15 bg-white text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                >
                  Join with Invitation Code
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLE-STYLE PRICING SECTION (Transaction-Based / No Subscriptions) ── */}
      <section id="pricing" className="py-24 sm:py-32 bg-white border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#0071e3] mb-3">
              Simple, Pay-As-You-Grow Pricing
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              Zero monthly subscriptions. We only win when you sell.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6e6e73] leading-relaxed">
              No tier limits, no upfront software fees, and no terminal rentals. Everything is completely free to set up—we simply take a small, transparent cut from processed payments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Pillar 1: 100% Free Platform */}
            <div className="bg-[#fbfbfd] p-7 sm:p-8 rounded-[32px] border border-black/[0.08] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mb-5">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f]">Free Forever Platform</h3>
                <p className="text-xs text-[#86868b] mt-1">For every hawker centre, food hall, and street market.</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-[#1d1d1f]">RM 0</span>
                  <span className="text-xs text-[#86868b]">/ month</span>
                </div>
                <p className="text-[11px] text-[#30d158] font-semibold mt-1">Zero monthly software invoices</p>

                <ul className="mt-6 space-y-3 text-xs text-[#515154]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Unlimited food stalls & booths</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Unlimited QR table codes & digital menus</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Zero hardware lock-in (use any phone/tablet)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>No setup costs or annual commitments</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/subscribe"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors"
                >
                  Get started for free
                </Link>
              </div>
            </div>

            {/* Pillar 2: Transaction Cut (Featured Center) */}
            <div className="bg-[#1d1d1f] text-white p-7 sm:p-8 rounded-[32px] shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-5">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#0071e3] text-white">
                  Payment Cut
                </span>
              </div>
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
                  <CreditCard className="w-5 h-5 text-[#2997ff]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Pay As You Sell</h3>
                <p className="text-xs text-white/60 mt-1">We take a small cut directly from payments.</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Small Cut</span>
                  <span className="text-xs text-white/60">/ transaction</span>
                </div>
                <p className="text-[11px] text-[#30d158] font-semibold mt-1">No orders = RM 0.00 platform fee</p>

                <ul className="mt-6 space-y-3 text-xs text-[#d2d2d7]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Transparent cut from payment gateway</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Direct automated bank / eWallet payouts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>1-tap automated sold-out eWallet refunds</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Automated tenant sales reconciliation</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>No financial risk during quiet or off-peak days</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/subscribe"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors shadow-lg"
                >
                  Activate Venue Now
                </Link>
              </div>
            </div>

            {/* Pillar 3: All Features Unlocked */}
            <div className="bg-[#fbfbfd] p-7 sm:p-8 rounded-[32px] border border-black/[0.08] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center mb-5">
                  <Sparkles className="w-5 h-5 text-[#30d158]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f]">All Features Included</h3>
                <p className="text-xs text-[#86868b] mt-1">Every premium capability, zero tier gating.</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-[#1d1d1f]">100%</span>
                  <span className="text-xs text-[#86868b]">features unlocked</span>
                </div>
                <p className="text-[11px] text-[#0071e3] font-semibold mt-1">No feature paywalls</p>

                <ul className="mt-6 space-y-3 text-xs text-[#515154]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Multi-stall unified checkout basket</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Real-time kitchen display screens (KDS)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>OpenRouter AI natural language search</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Cryptographic booth invite keys</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Live gross revenue & tenancy telemetry</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold border border-black/15 bg-white text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                >
                  Explore pricing details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CINEMATIC FINAL CTA (Apple Keynote Style) ── */}
      <section className="py-24 sm:py-32 bg-[#1d1d1f] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#2997ff] mb-4">
            The Modern Standard
          </p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.035em] text-white leading-[1.08]">
            Transform your food hall today.
          </h2>
          <p className="mt-5 text-base sm:text-xl text-[#a1a1a6] max-w-2xl mx-auto leading-relaxed">
            Eliminate long queues, empower independent stall owners, and run your venue with effortless software. Zero subscription fees.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/subscribe"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-[0_4px_20px_rgba(0,113,227,0.35)]"
            >
              Get started for free
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
            >
              See how the payment cut works
            </Link>
          </div>

          <p className="mt-6 text-xs text-[#86868b]">
            Need a walkthrough? Our team is on the ground in Kuala Lumpur, Penang, and Johor Bahru.
          </p>
        </div>
      </section>

      {/* ── APPLE GLOBAL FOOTER ── */}
      <footer className="bg-[#f5f5f7] border-t border-black/[0.08] text-[11px] text-[#6e6e73] py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Footnote / Disclaimer */}
          <div className="pb-8 border-b border-black/[0.08] text-[11px] leading-relaxed text-[#86868b] space-y-2">
            <p>
              1. 15-minute quick setup is based on average onboarding time across tested Malaysian food halls with up to 10 digital menus.
            </p>
            <p>
              2. OpenRouter AI Food Discovery utilizes structured Zod JSON validation to query local Supabase database records deterministically, guaranteeing complete allergen safety and zero menu item hallucinations.
            </p>
          </div>

          {/* Directory Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
            <div>
              <p className="font-semibold text-[#1d1d1f] mb-3">Product</p>
              <ul className="space-y-2.5">
                <li><a href="#product" className="hover:text-[#1d1d1f] transition-colors">Operator Dashboard</a></li>
                <li><a href="#features" className="hover:text-[#1d1d1f] transition-colors">Kitchen Display (KDS)</a></li>
                <li><a href="#features" className="hover:text-[#1d1d1f] transition-colors">Multi-Stall QR Cart</a></li>
                <li><a href="#intelligence" className="hover:text-[#1d1d1f] transition-colors">AI Discovery Engine</a></li>
                <li><Link href="/pricing" className="hover:text-[#1d1d1f] transition-colors">Pricing & Model</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#1d1d1f] mb-3">Operators</p>
              <ul className="space-y-2.5">
                <li><Link href="/subscribe" className="hover:text-[#1d1d1f] transition-colors">Create Hawker Centre</Link></li>
                <li><a href="#how-it-works" className="hover:text-[#1d1d1f] transition-colors">Booth Invitation Keys</a></li>
                <li><a href="#roles" className="hover:text-[#1d1d1f] transition-colors">Revenue Reconciliation</a></li>
                <li><a href="#product" className="hover:text-[#1d1d1f] transition-colors">Table Session Manager</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#1d1d1f] mb-3">Merchants</p>
              <ul className="space-y-2.5">
                <li><Link href="/booths/join" className="hover:text-[#1d1d1f] transition-colors">Join an Existing Booth</Link></li>
                <li><Link href="/auth?redirect=/owner" className="hover:text-[#1d1d1f] transition-colors">Merchant Sign In</Link></li>
                <li><a href="#features" className="hover:text-[#1d1d1f] transition-colors">Menu Customisations</a></li>
                <li><a href="#features" className="hover:text-[#1d1d1f] transition-colors">Sold-out 86 Controls</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#1d1d1f] mb-3">Hawker Cloud</p>
              <ul className="space-y-2.5">
                <li><Link href="/home" className="hover:text-[#1d1d1f] transition-colors">Customer Web App</Link></li>
                <li><Link href="/menu" className="hover:text-[#1d1d1f] transition-colors">Browse Food Halls</Link></li>
                <li><span className="text-[#86868b]">Status: All Systems Normal</span></li>
                <li><span className="text-[#86868b]">Region: ap-southeast-1 (Malaysia)</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="pt-8 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Hawker Technologies Inc. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4 text-[#86868b]">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>&bull;</span>
              <a href="#" className="hover:underline">Terms of Service</a>
              <span>&bull;</span>
              <a href="#" className="hover:underline">Sales Policy</a>
              <span>&bull;</span>
              <a href="#" className="hover:underline">Legal</a>
            </div>
            <p className="text-[#86868b]">Malaysia &bull; English</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
