'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing-nav';
import { useAuth } from '@/components/auth-provider';
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  Store,
  Smartphone,
  BarChart3,
  QrCode,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  X,
  ChefHat,
  Receipt,
  CreditCard,
  Building2,
  KeyRound,
  HelpCircle,
  Mail,
  ScanLine,
} from 'lucide-react';

export default function LandingPage() {
  const { user, status, roles } = useAuth();
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'operator' | 'kitchen' | 'customer'>('operator');
  const [activeAiIndex, setActiveAiIndex] = useState(0);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do hawker stall vendors join the platform?',
      answer:
        'Hawker stall vendors join strictly via private email invitation dispatched by their food court or hawker centre operator. Individual stall vendors cannot register directly from the public landing page. Your food hall operator registers the physical venue first, assigns designated booth slots, and generates secure 1-click invitation links sent directly to vendor emails.',
    },
    {
      question: "Who is the 'Start Free' registration on the landing page for?",
      answer:
        "'Start Free' is exclusively for Hawker Centre / Food Hall Shop Owners and Venue Operators who manage dining halls, seating areas, and overall food court infrastructure. If you operate a physical multi-stall venue, you can sign up, name your food hall, and begin issuing stall invitations in under 15 minutes.",
    },
    {
      question: 'Can an individual food stall sign up without a venue operator invitation?',
      answer:
        'No. Hawker is built around a unified multi-tenant experience that powers multi-stall customer carts and shared table QR sessions (where diners can order from multiple stalls in a single checkout). For orders and payments to route accurately, every stall must belong to an authorized venue registered by an operator.',
    },
    {
      question: 'I received an email invitation for my booth. How do I get started?',
      answer:
        'Simply click the private invitation link received in your email (/booths/join?token=...). You will be prompted to create or sign into your merchant account, claim your booth slot, customize your menu items with price variations and photos, and immediately start receiving live customer tickets on your digital Kitchen Display System (KDS).',
    },
    {
      question: 'What is the difference between a Shop Owner and a Stall Worker?',
      answer:
        'A Shop Owner (Venue Operator) manages the physical food hall: generating QR table stickers, allocating booth slots, inviting stall workers, and reviewing venue-wide revenue. A Stall Worker (Chef / Vendor) runs an individual kitchen: receiving live orders, updating ticket statuses, marking sold-out dishes, and triggering 1-tap automated refunds.',
    },
    {
      question: 'Are there any upfront hardware costs or monthly subscription fees?',
      answer:
        'None. Hawker requires zero monthly subscriptions, zero upfront software licenses, and zero proprietary hardware terminals. Kitchen staff can use existing Android phones, iPads, or tablets. We operate on a transparent transaction cut—meaning we only earn when your venue and stalls make sales.',
    },
  ];

  const handleCopyCode = () => {
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const aiQueries = [
    {
      query: 'Craving delicious freshly cooked pasta or western dishes under RM15',
      intent: {
        category: 'Western Dishes',
        dishType: 'Pasta',
        flavorProfile: ['Rich Sauce', 'Savory'],
        dietary: ['Pork Free'],
        maxPrice: 'RM 15.00',
      },
      result: {
        dish: 'Spaghetti',
        stall: 'Booth 01 • Western',
        price: 'RM 10.01',
        prepTime: '6 mins',
        matchReason: "100% match • Fresh pasta prepared on order at Lim's Foodcourt",
      },
    },
    {
      query: 'What vegetarian or light options are ready for table 4?',
      intent: {
        category: 'Vegetarian',
        dietary: ['Vegetarian-friendly'],
        speed: 'Fast Dispatch',
        maxPrice: 'RM 15.00',
      },
      result: {
        dish: 'Spaghetti (Custom Herb Selection)',
        stall: 'Booth 01 • Western',
        price: 'RM 10.01',
        prepTime: '6 mins',
        matchReason: '95% match • Customisable preparation',
      },
    },
    {
      query: 'Satisfying hot meal under RM12 near table 4',
      intent: {
        category: 'Main Course',
        speed: 'Quick Dispatch',
        maxPrice: 'RM 12.00',
      },
      result: {
        dish: 'Spaghetti',
        stall: 'Booth 01 • Western',
        price: 'RM 10.01',
        prepTime: '6 mins',
        matchReason: '100% match • Within budget (RM 10.01), instant table notification',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
      {/* Top Banner Ribbon */}
      <div className="bg-[#1d1d1f] text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium tracking-tight">
        <span>🚀 Zero monthly subscriptions • Free food hall operating system</span>
        <span className="hidden sm:inline text-white/50 ml-2">• 15-minute setup</span>
      </div>

      <MarketingNav />

      {/* ── HERO SECTION (Mobile-First) ── */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.05] text-[11px] sm:text-xs font-semibold text-[#1d1d1f] mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            Next-Generation Hawker OS
          </div>

          {/* Headline - fluid on mobile, grand on desktop */}
          <h1 className="text-[32px] xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1d1d1f] leading-[1.12] max-w-4xl mx-auto">
            The unified operating system for modern food halls.
          </h1>

          {/* Subtitle */}
          <p className="mt-3.5 sm:mt-5 text-sm sm:text-base md:text-lg text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
            One QR code per table for diners. Instant kitchen displays for stall woks. Complete venue telemetry for operators with zero monthly subscriptions.
          </p>

          {/* Hero CTAs - Full-width on mobile, auto on desktop */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none mx-auto">
            {roles.hasShopOwner ? (
              <Link
                href="/shop-owner/booths"
                className="w-full sm:w-auto h-11 px-6 rounded-full text-sm font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Shop Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={'/apply' as any}
                className="w-full sm:w-auto h-11 px-6 rounded-full text-sm font-semibold bg-[#007aff] text-white hover:bg-[#0071e3] transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Start Free as Operator <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/scan"
              className="w-full sm:w-auto h-11 px-6 rounded-full text-sm font-semibold bg-[#f2f2f7] text-[#1d1d1f] hover:bg-[#e5e5ea] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 text-[#007aff]" /> Scan Table QR
            </Link>
          </div>

          {/* Key Value Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-8 sm:mt-14 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-black/[0.04] text-center shadow-2xs">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">RM 0.00</p>
              <p className="text-[11px] sm:text-xs text-[#86868b] mt-0.5 truncate">Zero subscription</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-black/[0.04] text-center shadow-2xs">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">&lt; 1 sec</p>
              <p className="text-[11px] sm:text-xs text-[#86868b] mt-0.5 truncate">Instant web app</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-black/[0.04] text-center shadow-2xs">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">100%</p>
              <p className="text-[11px] sm:text-xs text-[#86868b] mt-0.5 truncate">Direct food cut</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-black/[0.04] text-center shadow-2xs">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">1 Tap</p>
              <p className="text-[11px] sm:text-xs text-[#86868b] mt-0.5 truncate">Multi-stall cart</p>
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE PRODUCT STUDIO DISPLAY SHOWCASE ── */}
        <div id="product" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-16">
          {/* Segmented Control Switcher - Compact on mobile */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="inline-flex w-full sm:w-auto p-1 bg-black/[0.06] backdrop-blur-md rounded-full border border-black/[0.04]">
              <button
                onClick={() => setActiveShowcaseTab('operator')}
                className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeShowcaseTab === 'operator'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                <span className="sm:hidden">🏢 Operator</span>
                <span className="hidden sm:inline">🏢 Food Court Operator</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab('kitchen')}
                className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeShowcaseTab === 'kitchen'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                <span className="sm:hidden">🍳 Kitchen</span>
                <span className="hidden sm:inline">🍳 Stall Kitchen View</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab('customer')}
                className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeShowcaseTab === 'customer'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                <span className="sm:hidden">📱 Diner QR</span>
                <span className="hidden sm:inline">📱 Diner QR Experience</span>
              </button>
            </div>
          </div>

          {/* Hardware Display Frame */}
          <div className="relative rounded-[22px] sm:rounded-[36px] bg-[#1d1d1f] p-2 sm:p-4 shadow-[0_24px_60px_rgba(0,0,0,0.14)] border border-black/10">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-3 py-2 text-white/50 text-[11px] border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shrink-0" />
                <span className="ml-2 text-white/70 font-mono text-[10px] truncate">
                  app.hawker.com &mdash; Lim&apos;s Foodcourt
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-[#30d158] font-medium text-[10px] sm:text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-ping" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Display Canvas */}
            <div className="bg-[#fbfbfd] rounded-[16px] sm:rounded-[26px] p-3.5 sm:p-6 text-[#1d1d1f] min-h-[360px] overflow-hidden">
              {/* TAB 1: Operator View */}
              {activeShowcaseTab === 'operator' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.06] shadow-2xs">
                      <p className="text-[10px] sm:text-xs text-[#86868b] font-medium truncate">Today&apos;s Sales</p>
                      <p className="text-lg sm:text-2xl font-bold mt-0.5 tracking-tight">RM 1,420.00</p>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#30d158] mt-0.5">
                        <TrendingUp className="w-3 h-3" /> +18.5%
                      </span>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.06] shadow-2xs">
                      <p className="text-[10px] sm:text-xs text-[#86868b] font-medium truncate">Total Orders</p>
                      <p className="text-lg sm:text-2xl font-bold mt-0.5 tracking-tight">142</p>
                      <span className="text-[10px] sm:text-[11px] font-medium text-[#86868b] mt-0.5 block truncate">
                        Peak: 12:45 PM
                      </span>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.06] shadow-2xs hidden md:block">
                      <p className="text-xs text-[#86868b] font-medium">Prep Velocity</p>
                      <p className="text-2xl font-bold mt-0.5 tracking-tight">6.0 mins</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30d158] mt-0.5">
                        <Zap className="w-3 h-3" /> Western Kitchen
                      </span>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.06] shadow-2xs hidden md:block">
                      <p className="text-xs text-[#86868b] font-medium">Active Booths</p>
                      <p className="text-2xl font-bold mt-0.5 tracking-tight">10 Slots</p>
                      <span className="text-[11px] font-medium text-[#0071e3] mt-0.5 block">
                        1 Active • 9 Invited
                      </span>
                    </div>
                  </div>

                  {/* Booth Roster */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-[#1d1d1f]">Live Booth Operations</h4>
                      <span className="text-[10px] sm:text-xs text-[#86868b]">Lim&apos;s Foodcourt</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                      {[
                        {
                          name: 'Western',
                          stall: 'Booth #01',
                          revenue: 'RM 1,420.00',
                          orders: 142,
                          status: 'Open',
                          statusColor: 'text-[#30d158] bg-[#30d158]/10',
                          badge: 'Menu: Spaghetti (RM 10.01)',
                        },
                        {
                          name: 'Booth Slot #02',
                          stall: 'Booth #02',
                          revenue: 'RM 0.00',
                          orders: 0,
                          status: 'Ready to Invite',
                          statusColor: 'text-[#0071e3] bg-[#0071e3]/10',
                          badge: 'Token: HKR-8F92-KL',
                        },
                        {
                          name: 'Booth Slot #03',
                          stall: 'Booth #03',
                          revenue: 'RM 0.00',
                          orders: 0,
                          status: 'Ready to Invite',
                          statusColor: 'text-[#0071e3] bg-[#0071e3]/10',
                          badge: 'Invitation Link Ready',
                        },
                      ].map((booth) => (
                        <div
                          key={booth.stall}
                          className="bg-white p-3 rounded-xl border border-black/[0.05] shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-medium text-[#86868b]">
                                {booth.stall}
                              </span>
                              <p className="text-xs sm:text-sm font-bold text-[#1d1d1f] truncate">{booth.name}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${booth.statusColor}`}>
                              {booth.status}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
                            <span className="font-bold text-[#1d1d1f]">{booth.revenue}</span>
                            <span className="text-[10px] text-[#86868b] truncate">{booth.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Kitchen Display View */}
              {activeShowcaseTab === 'kitchen' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1d1d1f] text-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/60 font-medium">Kitchen Display • Booth #01</p>
                        <h4 className="text-xs sm:text-sm font-bold text-white">Western • Lim&apos;s Foodcourt</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[#30d158]/20 text-[#30d158] text-[10px] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" /> Audio Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl border-2 border-[#ff9f0a] p-3.5 sm:p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1d1d1f]">Ticket #1042</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] font-bold text-[10px]">
                          Table 04 • 3m ago
                        </span>
                      </div>
                      <div className="mt-2.5 space-y-1.5 border-y border-black/[0.06] py-2.5 text-xs">
                        <div className="font-medium text-[#1d1d1f]">
                          <p className="font-bold text-sm">1x Spaghetti</p>
                          <p className="text-[11px] text-[#0071e3] font-semibold mt-0.5">• Freshly Prepared Pasta</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-[#1d1d1f]">TOTAL: RM 10.01</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          PAID (0% Cut)
                        </span>
                      </div>
                      <button className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold bg-[#30d158] text-white hover:bg-[#28b84d] transition-colors">
                        Mark Ready for Table 04
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-black/[0.08] p-3.5 sm:p-4 shadow-sm hidden sm:block">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1d1d1f]">Ticket #1043</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] font-bold text-[10px]">
                          Table 02 • 1m ago
                        </span>
                      </div>
                      <div className="mt-2.5 space-y-1.5 border-y border-black/[0.06] py-2.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-[#1d1d1f]">
                            <p className="font-bold text-sm">1x Spaghetti</p>
                            <p className="text-[11px] text-[#6e6e73]">• Standard Serving</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                            Refund
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-[#1d1d1f]">TOTAL: RM 10.01</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          PAID (0% Cut)
                        </span>
                      </div>
                      <button className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors">
                        Move to Kitchen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Diner Mobile Experience */}
              {activeShowcaseTab === 'customer' && (
                <div className="max-w-sm mx-auto bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] shadow-lg p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        04
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1d1d1f] truncate">Table 04 • Lim&apos;s Foodcourt</p>
                        <p className="text-[10px] text-[#86868b]">Verified Table Session</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#30d158]/10 text-[#30d158] shrink-0">
                      PAID
                    </span>
                  </div>

                  <div className="bg-[#f5f5f7] p-3 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span>1x Spaghetti (Western - Booth 01)</span>
                      <span className="font-bold text-[#1d1d1f]">RM 10.01</span>
                    </div>
                    <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#6e6e73]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#1d1d1f]">RM 10.01</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6e6e73]">
                      <span>Convenience Fee (Diner Flat)</span>
                      <span className="font-medium text-[#1d1d1f]">RM 0.50</span>
                    </div>
                    <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between font-bold text-sm">
                      <span>Total Paid</span>
                      <span className="text-[#0071e3]">RM 10.51</span>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-full text-xs font-bold bg-[#1d1d1f] text-white shadow-sm flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" /> Paid via DuitNow QR
                  </button>
                  <p className="text-center text-[10px] text-[#86868b]">
                    0% hawker cut • 1-Tap out-of-stock refunds direct to eWallet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM & THE SOLUTION (Apple Contrast) ── */}
      <section className="py-14 sm:py-24 bg-white border-y border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-16">
            <p className="text-xs font-semibold text-[#0071e3] mb-2">
              The food hall paradigm
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              The friction of old food halls. Reimagined.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
              Traditional hawker centres suffer from fragmented queues, cash bottlenecks, and zero centralized operational data. Hawker unifies the entire room.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* The Old Way */}
            <div className="bg-[#f5f5f7] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.04] flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/[0.06] text-[#6e6e73] mb-4">
                  The Old Way
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">
                  Fragmented queues. Blind management.
                </h3>
                <ul className="mt-5 space-y-3.5 text-xs sm:text-sm text-[#6e6e73]">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✕
                    </span>
                    <span>
                      <strong>Customers wait in 4 separate lines</strong> to buy drinks, noodles, and dessert, carrying noisy buzzers back to tables.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✕
                    </span>
                    <span>
                      <strong>Stall woks struggle with change</strong> and lost paper chits while shouting numbers over dining noise.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✕
                    </span>
                    <span>
                      <strong>Operators have zero visibility</strong> into daily floor turnover, peak hours, or individual stall sales.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs text-[#86868b]">
                Result: Lost sales, customer friction, and painful paper accounting.
              </div>
            </div>

            {/* The Hawker Way */}
            <div className="bg-[#1d1d1f] text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#0071e3]/20 text-[#2997ff] mb-4">
                  The Hawker Way
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  One platform. Total clarity.
                </h3>
                <ul className="mt-5 space-y-3.5 text-xs sm:text-sm text-[#d2d2d7]">
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
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/50 flex items-center justify-between">
                <span>Result: +28% average ticket size • zero lost orders</span>
                <span className="text-[#2997ff] font-semibold">100% Automated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: 4-STEP SETUP ── */}
      <section id="how-it-works" className="py-14 sm:py-24 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-16">
            <p className="text-xs font-semibold text-[#0071e3] mb-2">
              Frictionless setup
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              Up and running in four simple steps.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
              From food hall creation to live table ordering in under 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/[0.06] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-1 rounded-full">
                      Step {item.step}
                    </span>
                    <item.icon className="w-5 h-5 text-[#86868b]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Invitation Deep Dive Card */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-black/[0.06] shadow-sm">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div>
                <span className="text-xs font-semibold text-[#0071e3]">
                  The booth invitation flow
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] mt-1.5">
                  No complex setup for your stall holders.
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Food court operators shouldn&apos;t have to be IT administrators. When you generate a booth token in Hawker, stall owners receive a private invitation link, name their stall, and launch their kitchen display instantly.
                </p>

                <div className="mt-5 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]">
                    <ShieldCheck className="w-4 h-4 text-[#30d158]" /> Single-use security token
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]">
                    <Clock className="w-4 h-4 text-[#0071e3]" /> 48-hour expiration safety
                  </div>
                </div>
              </div>

              {/* Interactive Mock Invite Code Card */}
              <div className="bg-[#f5f5f7] p-4 sm:p-5 rounded-2xl border border-black/[0.06]">
                <div className="flex items-center justify-between text-xs text-[#86868b] mb-2.5">
                  <span>Generated by Shop Owner</span>
                  <span className="text-[#30d158] font-bold">Active & Valid</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-black/[0.06] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[#86868b] font-semibold">
                      Booth #04 invitation key
                    </p>
                    <p className="text-base sm:text-xl font-mono font-bold tracking-wider text-[#1d1d1f] mt-0.5 truncate">
                      HKR-8F92-KL
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors shrink-0"
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
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#6e6e73]">
                  <span>Stall: Jalan Alor Char Kway Teow</span>
                  <span className="text-[#86868b]">Private link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES GRID ── */}
      <section id="features" className="py-14 sm:py-24 bg-white border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-16">
            <p className="text-xs font-semibold text-[#0071e3] mb-2">
              Comprehensive capability
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              Engineered for speed. Built for scale.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
              Every tool a modern food hall needs, seamlessly woven together into a unified experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Bento 1: Multi-Stall Cart (Span 2) */}
            <div className="md:col-span-2 bg-[#f5f5f7] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#0071e3] shadow-xs mb-4">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#0071e3]">
                  Unified checkout
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                  One order. One payment. Multiple stalls.
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Diners can select satay from Stall 1, laksa from Stall 4, and iced teh tarik from the drink stall in one digital basket. Hawker handles the sub-order breakdown, kitchen dispatch, and payment splits automatically.
                </p>
              </div>
              <div className="mt-6 bg-white p-3.5 rounded-xl border border-black/[0.05] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#1d1d1f]">Supported Payments:</span>
                <div className="flex flex-wrap items-center gap-1.5 font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f]">DuitNow QR</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f]">Touch &apos;n Go</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f]">Apple Pay</span>
                </div>
              </div>
            </div>

            {/* Bento 2: Zero App Download */}
            <div className="bg-[#f5f5f7] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#30d158] shadow-xs mb-4">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#248a3d]">
                  Zero friction
                </span>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                  Instant Web App
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  No App Store downloads. No password signups. Diners scan the table QR code and the full menu opens in 0.8 seconds on Safari or Chrome.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-black/[0.06] text-xs font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>Edge Speed</span>
                <span>&lt; 1s LCP</span>
              </div>
            </div>

            {/* Bento 3: Stall Autonomy */}
            <div className="bg-[#f5f5f7] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#ff9f0a] shadow-xs mb-4">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#c96f00]">
                  Stall control
                </span>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                  Stall Autonomy
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Stalls customize dish modifiers (extra egg, noodle choice, spicy level) and 1-tap 86/sold-out toggle during lunch rushes.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-black/[0.06] text-xs font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>Modifiers</span>
                <span>Active</span>
              </div>
            </div>

            {/* Bento 4: Operator Analytics (Span 2) */}
            <div className="md:col-span-2 bg-[#f5f5f7] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#bf5af2] shadow-xs mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#bf5af2]">
                  Operator analytics
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                  Granular food hall telemetry.
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Compare performance across woks, track hourly customer surges, and generate automatic end-of-day revenue reconciliation for booth lease percentages.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-black/[0.05]">
                  <p className="text-[10px] text-[#86868b] font-medium">Daily Report</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1d1d1f] mt-0.5 truncate">Automated CSV</p>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-black/[0.05]">
                  <p className="text-[10px] text-[#86868b] font-medium">Lease Payouts</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1d1d1f] mt-0.5 truncate">Split Engine</p>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-black/[0.05]">
                  <p className="text-[10px] text-[#86868b] font-medium">Dish Rankings</p>
                  <p className="text-xs sm:text-sm font-bold text-[#1d1d1f] mt-0.5 truncate">Live Top 10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI DISCOVERY SECTION ── */}
      <section id="intelligence" className="py-14 sm:py-24 bg-[#0b0c0e] text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-[#2997ff] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
              Hawker Food Intelligence
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Culinary discovery. Without hallucinations.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed">
              Diners search how they speak: &ldquo;Spicy noodles with seafood under RM18.&rdquo; OpenRouter parses intent into strict Zod schemas, then executes deterministic Supabase queries. Zero AI fantasy. 100% verified dishes.
            </p>
          </div>

          <div className="bg-[#16171a] rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-8 shadow-2xl">
            {/* Prompt Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {aiQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAiIndex(idx)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                    activeAiIndex === idx
                      ? 'bg-white text-[#1d1d1f] shadow-md'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  Prompt #{idx + 1}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-center">
              <div className="space-y-3">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <p className="text-xs text-white/60 font-semibold">
                    Natural language search prompt
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1">
                    &ldquo;{aiQueries[activeAiIndex].query}&rdquo;
                  </p>
                </div>

                <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 font-mono text-xs text-[#2997ff] space-y-1">
                  <p className="text-xs text-white/60 font-sans font-semibold mb-1.5">
                    Validated SearchIntent (Zod output)
                  </p>
                  <p>category: &quot;{aiQueries[activeAiIndex].intent.category}&quot;</p>
                  <p>dietary: {JSON.stringify(aiQueries[activeAiIndex].intent.dietary)}</p>
                  <p>maxPrice: &quot;{aiQueries[activeAiIndex].intent.maxPrice}&quot;</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/50">
                  <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0" />
                  <span>Strict SQL isolation • Deterministic local queries</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/15">
                <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                  <span className="font-mono text-[11px] text-[#30d158] flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#30d158]" />
                    Verified Dish Match
                  </span>
                  <span>Supabase</span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {aiQueries[activeAiIndex].result.dish}
                      </h4>
                      <p className="text-xs text-[#2997ff] font-semibold mt-0.5">
                        {aiQueries[activeAiIndex].result.stall}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-white shrink-0">
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
                    <span className="text-[#30d158] font-bold">In Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS BY ROLE (Shop Owner vs Booth Owner) ── */}
      <section id="roles" className="py-14 sm:py-24 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-16">
            <p className="text-xs font-semibold text-[#0071e3] mb-2">
              Tailored experiences
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              Designed for operators. Built for cooks.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
              Two dedicated interfaces reflecting the dual reality of a bustling food court.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Role 1: Food Court Operator */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.06] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  Food Court & Centre Operators
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Oversee all booths, manage table layouts, dispatch invite tokens, and track venue-wide revenue with full financial isolation.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-[#1d1d1f]">
                  {[
                    'Multi-booth roster & occupancy overview',
                    'Single-click cryptographic booth invite codes',
                    'Consolidated real-time gross venue revenue',
                    'Automated stall lease & settlement reporting',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#0071e3] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-black/[0.06]">
                {roles.hasShopOwner ? (
                  <Link
                    href="/shop-owner/booths"
                    className="w-full h-12 inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors"
                  >
                    Open Shop Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                ) : (
                  <Link
                    href={'/apply' as any}
                    className="w-full h-12 inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#1d1d1f] text-white hover:bg-black transition-colors"
                  >
                    Start Free as Shop Owner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                )}
              </div>
            </div>

            {/* Role 2: Booth Owner */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/[0.06] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center font-bold mb-4">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  Independent Stall & Booth Masters
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Your kitchen. Your recipes. Your orders. Manage your menu, set custom spice levels, and fulfill incoming orders without noisy buzzers.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-[#1d1d1f]">
                  {[
                    'Instant KDS on any phone, tablet, or iPad',
                    '1-tap dish availability & sold-out controls',
                    'Custom ingredient options & add-ons',
                    'Audio alerts for incoming table tickets',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#30d158] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-black/[0.06]">
                <div className="w-full h-12 inline-flex items-center justify-center rounded-full text-xs font-semibold bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.04]">
                  Joined via private email invitation from venue operator
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING & MODEL (Mobile-First) ── */}
      <section id="pricing" className="py-14 sm:py-24 bg-white border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              Fair Business Model
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              Zero monthly subscriptions.
              <span className="block text-[#0071e3] mt-1">We only win when you sell.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73] leading-relaxed">
              Traditional restaurant POS vendors lock food halls into monthly software rent and proprietary terminals. Hawker throws out the subscription model entirely.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-10 sm:mb-16">
            {/* The Legacy Extortion Model */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#f5f5f7] p-5 sm:p-8 border border-black/[0.06] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/5 text-[#86868b]">
                    Legacy POS & SaaS
                  </span>
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Extraction Model
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  You pay whether you make money or not.
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  Traditional software vendors treat food court operators as captive rent-payers, extracting high recurring fees regardless of weather or diner footfall.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.04] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      RM
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#1d1d1f]">RM 300 – RM 800 / month per stall</p>
                      <p className="text-[11px] text-[#6e6e73] mt-0.5">Heavy recurring invoices billed every 30 days like digital rent.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.04] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      POS
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#1d1d1f]">RM 3,500 – RM 8,000 upfront terminals</p>
                      <p className="text-[11px] text-[#6e6e73] mt-0.5">Bulky hardware terminals with expensive warranty leases.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs text-[#86868b]">
                Locked 24–36 month contracts with early termination penalties.
              </div>
            </div>

            {/* The Hawker Standard */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#1d1d1f] text-white p-5 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0071e3]/20 blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/30">
                    The Hawker standard
                  </span>
                  <span className="text-xs font-bold text-[#30d158] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Aligned
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  RM 0.00 until an order is served.
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#a1a1a6] leading-relaxed">
                  Software should be free infrastructure. We only take a transparent cut directly from transactions when you actually make sales.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#30d158]/20 text-[#30d158] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      RM
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">RM 0.00 / month forever</p>
                      <p className="text-[11px] text-[#a1a1a6] mt-0.5">Unlimited food stalls, menus, and tables. Zero software bills.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      BYO
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">RM 0.00 hardware lock-in</p>
                      <p className="text-[11px] text-[#a1a1a6] mt-0.5">Screens and ordering run on any existing tablet, iPad, or smartphone.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#a1a1a6]">
                  Zero lock-in • 100% free to start
                </span>
                {roles.hasShopOwner ? (
                  <Link
                    href="/shop-owner/booths"
                    className="w-full sm:w-auto h-11 px-6 rounded-full text-xs font-bold bg-white text-[#1d1d1f] hover:bg-white/90 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    Open Shop Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={'/apply' as any}
                    className="w-full sm:w-auto h-11 px-6 rounded-full text-xs font-bold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    Start Free for RM 0 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 4-Step Transaction Cut Breakdown */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#fbfbfd] p-5 sm:p-8 border border-black/[0.06] shadow-2xs">
            <div className="max-w-2xl mb-6">
              <span className="text-xs font-semibold text-[#0071e3]">
                Transparent fee breakdown
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                How a real RM 15.00 order works at your food hall.
              </h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 leading-relaxed">
                By default, diners pay a flat RM 0.50 platform service fee at checkout. Stall owners keep 100% of their dish revenue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-white border border-black/[0.06]">
                <p className="text-xs font-semibold text-[#86868b]">1. Customer basket</p>
                <p className="text-lg font-bold text-[#1d1d1f] mt-0.5">RM 15.00</p>
                <p className="text-xs text-[#6e6e73] mt-0.5">Chicken Rice + Iced Kopi across 2 stalls.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.06]">
                <p className="text-xs font-semibold text-[#0071e3]">2. Diner platform fee</p>
                <p className="text-lg font-bold text-[#0071e3] mt-0.5">+ RM 0.50</p>
                <p className="text-xs text-[#6e6e73] mt-0.5">Paid by diner at checkout.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#30d158]/30 bg-[#30d158]/[0.02]">
                <p className="text-xs font-semibold text-[#248a3d]">3. Hawkers keep</p>
                <p className="text-lg font-bold text-[#248a3d] mt-0.5">RM 15.00 (100%)</p>
                <p className="text-xs text-[#6e6e73] mt-0.5">Zero stall cut. Hawkers retain full price.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.06]">
                <p className="text-xs font-semibold text-[#86868b]">4. Automated payout</p>
                <p className="text-lg font-bold text-[#1d1d1f] mt-0.5">Daily / Direct</p>
                <p className="text-xs text-[#6e6e73] mt-0.5">Settled via DuitNow bank transfer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
      <section id="faq" className="py-14 sm:py-24 bg-[#f5f5f7] border-t border-black/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              Everything you need to know.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6e6e73]">
              Clear answers on venue setup, stall email invitations, and our zero-subscription model.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-4 px-4 sm:px-6 flex items-center justify-between text-left gap-3 hover:bg-black/[0.01] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-sm sm:text-base text-[#1d1d1f] leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full bg-black/5 flex items-center justify-center shrink-0 text-[#1d1d1f] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-black/10' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed border-t border-black/[0.04] pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Callout box for Stall Vendors */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-2xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f]">
                Are you a stall vendor or hawker master?
              </h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 leading-relaxed">
                Stalls join exclusively via private email invitation dispatched by your food hall operator. Check your inbox for your unique activation link, or ask your venue manager to dispatch a booth invite token.
              </p>
            </div>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto h-11 px-5 rounded-full text-xs font-bold bg-[#1d1d1f] text-white hover:bg-black transition-colors flex items-center justify-center shrink-0"
            >
              See Invite Flow
            </a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-28 bg-[#1d1d1f] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-xs font-semibold text-[#2997ff] mb-3">
            The modern standard
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Transform your food hall today.
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-lg text-[#a1a1a6] max-w-xl mx-auto leading-relaxed">
            Eliminate long queues, empower independent stall owners, and run your venue with effortless software. Zero subscription fees.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none mx-auto">
            {roles.hasShopOwner ? (
              <Link
                href="/shop-owner/booths"
                className="w-full sm:w-auto h-12 px-7 rounded-full text-sm font-bold bg-white text-[#1d1d1f] hover:bg-white/90 transition-all shadow-sm flex items-center justify-center"
              >
                Go to Shop Dashboard
              </Link>
            ) : (
              <Link
                href={'/apply' as any}
                className="w-full sm:w-auto h-12 px-7 rounded-full text-sm font-bold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-md flex items-center justify-center"
              >
                Start Free
              </Link>
            )}
            <Link
              href="/pricing"
              className="w-full sm:w-auto h-12 px-6 rounded-full text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center"
            >
              Payment Cut Details
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#f5f5f7] border-t border-black/[0.08] text-xs text-[#6e6e73] py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-8">
            <div>
              <p className="font-bold text-[#1d1d1f] mb-2.5">Product</p>
              <ul className="space-y-2 text-[11px] sm:text-xs">
                <li><a href="#product" className="hover:text-[#1d1d1f]">Operator Dashboard</a></li>
                <li><a href="#features" className="hover:text-[#1d1d1f]">Kitchen Display (KDS)</a></li>
                <li><a href="#features" className="hover:text-[#1d1d1f]">Multi-Stall QR Cart</a></li>
                <li><a href="#intelligence" className="hover:text-[#1d1d1f]">AI Discovery Engine</a></li>
                <li><Link href="/pricing" className="hover:text-[#1d1d1f]">Pricing & Model</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-[#1d1d1f] mb-2.5">Operators</p>
              <ul className="space-y-2 text-[11px] sm:text-xs">
                <li>
                  {roles.hasShopOwner ? (
                    <Link href="/shop-owner/booths" className="hover:text-[#1d1d1f]">
                      Shop Dashboard
                    </Link>
                  ) : (
                    <Link href={'/apply' as any} className="hover:text-[#1d1d1f]">
                      Start Free (Shop Owner)
                    </Link>
                  )}
                </li>
                <li><a href="#how-it-works" className="hover:text-[#1d1d1f]">Booth Invitation Keys</a></li>
                <li><a href="#roles" className="hover:text-[#1d1d1f]">Revenue Reconciliation</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-[#1d1d1f] mb-2.5">Merchants</p>
              <ul className="space-y-2 text-[11px] sm:text-xs">
                <li><Link href="/auth?redirect=/owner" className="hover:text-[#1d1d1f]">Merchant Sign In</Link></li>
                <li><a href="#how-it-works" className="hover:text-[#1d1d1f]">Stall Join (Email Only)</a></li>
                <li><a href="#features" className="hover:text-[#1d1d1f]">Menu Modifiers</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-[#1d1d1f] mb-2.5">Diners</p>
              <ul className="space-y-2 text-[11px] sm:text-xs">
                <li><Link href="/home" className="hover:text-[#1d1d1f]">Diner Web App</Link></li>
                <li><Link href="/scan" className="hover:text-[#1d1d1f]">Scan Table QR</Link></li>
                <li><Link href="/menu" className="hover:text-[#1d1d1f]">Browse Menus</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86868b]">
            <p>&copy; {new Date().getFullYear()} Hawker Technologies Inc. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:underline">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:underline">Legal</a>
            </div>
            <p>Malaysia • English</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
