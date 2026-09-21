'use client';

import Link from 'next/link';
import { MarketingNav } from '@/components/marketing-nav';
import {
 Check,
 ChevronRight,
 ShieldCheck,
 Zap,
 ArrowRight,
 Sparkles,
 RefreshCw,
 Building2,
 CreditCard,
 QrCode,
 Smartphone,
 CheckCircle2,
 XCircle,
} from 'lucide-react';

const comparisonRows = [
 {
 feature: 'Monthly Software Subscription',
 hawker: 'RM 0.00 / month forever',
 legacy: 'RM 250 – RM 800 / month',
 highlight: true,
 },
 {
 feature: 'Upfront Setup & Hardware Cost',
 hawker: 'RM 0.00 (Use any phone or tablet)',
 legacy: 'RM 3,000 – RM 10,000 terminals',
 highlight: true,
 },
 {
 feature: 'Pricing Model',
 hawker: 'Small cut from processed payments',
 legacy: 'Fixed monthly fee + transaction fees',
 highlight: false,
 },
 {
 feature: 'Stall & Booth Capacity',
 hawker: 'Unlimited stalls from Day 1',
 legacy: 'Tier-gated (Pay more per booth)',
 highlight: false,
 },
 {
 feature: 'Multi-Stall Unified Checkout',
 hawker: 'Included (1 QR, multiple stalls)',
 legacy: 'Not supported or separate POS',
 highlight: false,
 },
 {
 feature: 'Cost During Slow / Off-Peak Days',
 hawker: 'RM 0.00 (Zero financial risk)',
 legacy: 'Full monthly subscription invoiced',
 highlight: true,
 },
 {
 feature: '1-Tap Sold-Out eWallet Refunds',
 hawker: 'Instant & automated from KDS',
 legacy: 'Manual cashier cash reconciliation',
 highlight: false,
 },
 {
 feature: 'AI Natural Language Search',
 hawker: 'Included for all food halls',
 legacy: 'Not available',
 highlight: false,
 },
 {
 feature: 'Contract Commitments',
 hawker: 'None (Cancel or pause anytime)',
 legacy: '12 – 36 month binding contracts',
 highlight: false,
 },
];

const includedFeatures = [
 {
 icon: Building2,
 title: 'Unlimited Stalls & Booths',
 desc: 'Onboard 1 stall or 50 stalls with zero per-booth software surcharges.',
 },
 {
 icon: QrCode,
 title: 'Unlimited QR Table Codes',
 desc: 'Generate branded high-resolution QR codes for every dine-in table and pickup counter.',
 },
 {
 icon: Smartphone,
 title: 'Mobile Kitchen Display (KDS)',
 desc: 'Runs on any smartphone, iPad, or Android tablet with live audio chimes and ticket routing.',
 },
 {
 icon: Sparkles,
 title: 'AI Culinary Search Engine',
 desc: 'Diners can search naturally by craving, dietary restriction, or spice tolerance.',
 },
 {
 icon: RefreshCw,
 title: '1-Tap Out-of-Stock Refunds',
 desc: 'Cooks mark sold-out items from the KDS; customers receive instant automated eWallet refunds.',
 },
 {
 icon: ShieldCheck,
 title: 'Operator Telemetry & Statements',
 desc: 'Automated gross sales reporting and tenant settlement splits without spreadsheet headaches.',
 },
];

const faqs = [
 {
 q: 'Why does Hawker not charge a monthly subscription fee?',
 a: 'Traditional SaaS subscriptions penalize operators during slow months, rainy days, or renovation periods. By taking a small cut from processed payments, our business model aligns completely with yours: we only make money when your food hall makes sales.',
 },
 {
 q: 'How does the payment cut work?',
 a: 'When a diner places an order and pays through our integrated payment gateway (supporting DuitNow QR, eWallets, and cards), a small transparent cut is deducted to cover software infrastructure and payment processing. Net stall payouts are transferred directly to your bank account.',
 },
 {
 q: 'Can the customer pay the platform fee instead of the venue?',
 a: 'Yes. Hawker supports flexible fee configuration: you can choose to have diners pay a transparent flat RM 0.50 platform fee at checkout, allowing the food hall and stall owners to keep 100% of dish prices.',
 },
 {
 q: 'Do we need to buy specialized POS hardware or printers?',
 a: 'No. Hawker is 100% cloud-native and runs seamlessly in any modern web browser on devices you already own—smartphones, iPads, Android tablets, or laptops. Stall owners can view and manage orders directly from their phones.',
 },
 {
 q: 'How do 1-tap out-of-stock refunds work?',
 a: 'If a cook runs out of an ingredient during lunch rush, they tap "Item Sold Out / Refund" on their kitchen screen. The line item amount is refunded straight back to the diner’s eWallet or bank account via our payment gateway, and the dish is instantly marked unavailable across all menus.',
 },
 {
 q: 'Is there any contract, setup fee, or cancellation penalty?',
 a: 'None. You can register your venue, print table QR codes, and start taking orders for RM 0.00 today. There are no lock-in periods, cancellation fees, or minimum transaction requirements.',
 },
];

export default function PlansPage() {
 return (
 <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
 {/* ── Apple Breadcrumb Navigation Header (Auth-Aware) ── */}
 <MarketingNav currentPath="/pricing" />

 {/* ── HERO BANNER ── */}
 <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
 <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-6">
 <Zap className="w-3.5 h-3.5" />
 <span>Pay-As-You-Grow Economics</span>
 </div>

 <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08]">
 No monthly software bills.
 <br />
 <span className="text-[#0071e3]">Just a small cut from payments.</span>
 </h1>

 <p className="mt-5 text-base sm:text-xl text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
 Eliminate expensive subscriptions, upfront terminal costs, and hidden fees. Start free, scale indefinitely, and only pay when orders are placed.
 </p>
 </section>

 {/* ── CORE PRICING HERO CARD ── */}
 <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
 <div className="bg-[#1d1d1f] text-white rounded-[36px] p-8 sm:p-12 shadow-2xl relative overflow-hidden ">
 <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />

 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 ">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#2997ff] text-xs font-semibold mb-3">
 <CreditCard className="w-3.5 h-3.5" />
 <span>Zero Upfront Commitment</span>
 </div>
 <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
 Hawker Platform Access
 </h2>
 <p className="text-sm text-white/60 mt-1 max-w-md">
 Complete operating system for food halls, hawker centres, and culinary markets.
 </p>
 </div>

 <div className="md:text-right shrink-0">
 <div className="flex items-baseline md:justify-end gap-1.5">
 <span className="text-5xl sm:text-6xl font-bold tracking-tight text-white">RM 0</span>
 <span className="text-sm text-white/60">/ month</span>
 </div>
 <p className="text-xs text-[#30d158] font-semibold mt-1">
 Zero software invoices &bull; Pay as you sell
 </p>
 </div>
 </div>

 <div className="relative z-10 grid sm:grid-cols-3 gap-6 pt-8">
 <div className="space-y-2">
 <p className="text-xs font-semibold text-white/60">Setup & software</p>
 <p className="text-2xl font-bold text-white">RM 0.00</p>
 <p className="text-xs text-white/60 leading-relaxed">
 Free venue account, unlimited QR codes, and zero terminal rental charges.
 </p>
 </div>

 <div className="space-y-2">
 <p className="text-xs font-semibold text-[#2997ff]">Monetization cut</p>
 <p className="text-2xl font-bold text-white">Small Cut</p>
 <p className="text-xs text-white/60 leading-relaxed">
 Transparent cut deducted from payment gateway transactions. No sales = RM 0 fee.
 </p>
 </div>

 <div className="space-y-2">
 <p className="text-xs font-semibold text-[#30d158]">Stall payouts</p>
 <p className="text-2xl font-bold text-white">Direct & Fast</p>
 <p className="text-xs text-white/60 leading-relaxed">
 Net earnings deposited automatically to your bank account with complete audit logs.
 </p>
 </div>
 </div>

 <div className="relative z-10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-2 text-xs text-white/70">
 <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
 <span>Full feature access &bull; Unlimited booths &bull; No credit card required to start</span>
 </div>

 <Link
 href={'/apply' as any}
 className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-lg hover:shadow-xl shrink-0"
 >
 Start Free
 <ArrowRight className="w-4 h-4 ml-2" />
 </Link>
 </div>
 </div>
 </section>

 {/* ── ALL FEATURES UNLOCKED ── */}
 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="max-w-2xl mx-auto text-center mb-12">
 <p className="text-xs font-semibold text-[#0071e3] mb-2">
 No tier gates
 </p>
 <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
 Everything unlocked from day one.
 </h2>
 <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
 We don&apos;t lock essential tools behind &ldquo;Pro&rdquo; or &ldquo;Enterprise&rdquo; paywalls. Every venue gets our full culinary suite.
 </p>
 </div>

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {includedFeatures.map((item, idx) => {
 const Icon = item.icon;
 return (
 <div
 key={idx}
 className="bg-white p-6 sm:p-7 rounded-[28px] .06] shadow-sm hover:shadow-md -shadow"
 >
 <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mb-4">
 <Icon className="w-5 h-5" />
 </div>
 <h3 className="text-base font-semibold text-[#1d1d1f]">{item.title}</h3>
 <p className="text-xs text-[#6e6e73] mt-1.5 leading-relaxed">{item.desc}</p>
 </div>
 );
 })}
 </div>
 </section>

 {/* ── COMPARISON TABLE: HAWKER VS LEGACY POS ── */}
 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="max-w-2xl mx-auto text-center mb-12">
 <p className="text-xs font-semibold text-[#0071e3] mb-2">
 Clear contrast
 </p>
 <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
 Hawker vs. Legacy Subscription POS
 </h2>
 <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
 See how pay-as-you-grow economics compares to old-school software licensing.
 </p>
 </div>

 <div className="bg-white rounded-[32px] .08] shadow-sm overflow-hidden">
 <div className="grid grid-cols-[1.2fr_1fr_1fr] p-5 sm:p-6 bg-[#f5f5f7] .06] text-xs font-semibold text-[#86868b]">
 <div>Feature</div>
 <div className="text-[#0071e3]">Hawker (Pay-as-you-grow)</div>
 <div className="text-[#86868b]">Traditional POS / SaaS</div>
 </div>

 <div className=" .06] text-xs sm:text-sm">
 {comparisonRows.map((row, idx) => (
 <div
 key={idx}
 className={`grid grid-cols-[1.2fr_1fr_1fr] p-4 sm:p-5 items-center ${
 row.highlight ? 'bg-[#0071e3]/[0.02]' : 'hover:bg-black/[0.01]'
 }`}
 >
 <div className="font-medium text-[#1d1d1f] pr-3">{row.feature}</div>
 <div className="font-semibold text-[#0071e3] flex items-center gap-2 pr-3">
 <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
 <span>{row.hawker}</span>
 </div>
 <div className="text-[#6e6e73] flex items-center gap-2">
 <XCircle className="w-4 h-4 text-[#ff3b30] shrink-0 opacity-70" />
 <span>{row.legacy}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ── FAQ SECTION ── */}
 <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="text-center mb-12">
 <p className="text-xs font-semibold text-[#0071e3] mb-2">
 Frequently asked questions
 </p>
 <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
 Got questions? We have answers.
 </h2>
 </div>

 <div className="space-y-4">
 {faqs.map((faq, idx) => (
 <div
 key={idx}
 className="bg-white p-6 rounded-2xl .06] shadow-sm space-y-2"
 >
 <h3 className="text-base font-semibold text-[#1d1d1f] flex items-start gap-2.5">
 <span className="text-[#0071e3] font-bold">Q:</span>
 <span>{faq.q}</span>
 </h3>
 <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed pl-6">
 {faq.a}
 </p>
 </div>
 ))}
 </div>
 </section>

 {/* ── BOTTOM CTA BANNER ── */}
 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center">
 <div className="bg-[#1d1d1f] text-white rounded-[32px] p-8 sm:p-14 shadow-xl relative overflow-hidden">
 <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
 Ready to bring your food hall into the future?
 </h2>
 <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl mx-auto">
 Zero setup fees. Zero monthly subscriptions. Activate your food hall today in under 15 minutes.
 </p>

 <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
 <Link
 href={'/apply' as any}
 className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-lg"
 >
 Get Started for Free
 </Link>
 <Link
 href="/"
 className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 text-white "
 >
 Return to Homepage
 </Link>
 </div>
 </div>
 </section>
 </div>
 );
}
