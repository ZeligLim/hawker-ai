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
 QrCode,
 Smartphone,
 CheckCircle2,
 XCircle,
} from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type PublicPlan = {
 plan_key: 'ordering' | 'online_payments';
 name: string;
 description: string;
 monthly_price: number;
 is_active: boolean;
 online_payments_enabled: boolean;
 features: string[];
};

const comparisonRows = [
 {
 feature: 'Ordering',
 hawker: 'QR menu and order submission',
 legacy: 'QR ordering with online payment when a gateway is enabled',
 highlight: true,
 },
 {
 feature: 'Payment',
 hawker: 'Pay at the counter; no online payment',
 legacy: 'Online payment processing (gateway setup required)',
 highlight: true,
 },
 {
 feature: 'Order management',
 hawker: 'Live order status and stall routing',
 legacy: 'Live order status, stall routing, and payment status',
 highlight: false,
 },
 {
 feature: 'Refunds',
 hawker: 'No online payments to refund',
 legacy: 'Online refunds depend on configured gateway support',
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
 title: 'Pay-at-Counter Orders',
 desc: 'Customers place orders from the table QR menu and pay the stall directly at the counter.',
 },
 {
 icon: ShieldCheck,
 title: 'Order & Revenue Reporting',
 desc: 'Review incoming orders and recorded sales without collecting online payments.',
 },
];

const faqs = [
 {
 q: 'What does the ordering plan include?',
 a: 'It includes QR-based menus, order submission, and stall order management. Customers pay at the stall counter.',
 },
 {
 q: 'What does the online payments plan add?',
 a: 'It adds online payment processing after a payment provider is integrated and configured.',
 },
 {
 q: 'Are online payments or refunds enabled today?',
 a: 'Online payment processing and online refunds require a configured payment provider.',
 },
 {
 q: 'Do customers need to pay online to place an order?',
 a: 'No online payment is taken when the order is submitted. The customer pays the stall at the counter.',
 },
];

export default async function PlansPage() {
 const database = createAdminClient();
 let configuredPlans: PublicPlan[] = [];
 if (database) {
  const { data, error } = await database
   .from('platform_plans')
   .select('plan_key, name, description, monthly_price, is_active, online_payments_enabled, features')
   .order('display_order', { ascending: true });
  if (!error && data) configuredPlans = data as PublicPlan[];
 }
 const fallbackPlans: PublicPlan[] = [
  { plan_key: 'ordering', name: 'Level 1 · Ordering', description: 'QR menus and order submission with payment at the stall counter.', monthly_price: 0, is_active: true, online_payments_enabled: false, features: ['Centre QR menus and order submission', 'Live stall order management', 'Pay at the stall counter'] },
  { plan_key: 'online_payments', name: 'Level 2 · Online payments', description: 'Online checkout and payment status after a payment provider is integrated.', monthly_price: 0, is_active: false, online_payments_enabled: true, features: ['Online checkout through a configured provider', 'Payment status and provider-dependent refunds'] },
 ];
 const plans = configuredPlans.length ? configuredPlans : fallbackPlans;
 const orderingPlan = plans.find((plan) => plan.plan_key === 'ordering') ?? plans[0];
 const onlinePaymentsPlan = plans.find((plan) => plan.plan_key === 'online_payments') ?? plans[1];
 return (
 <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3] selection:text-white">
 {/* ── Apple Breadcrumb Navigation Header (Auth-Aware) ── */}
 <MarketingNav currentPath="/pricing" />

 {/* ── HERO BANNER ── */}
 <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
 <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-6">
 <Zap className="w-3.5 h-3.5" />
 <span>Plans for food halls</span>
 </div>

 <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08]">
 Choose a plan that fits your food hall.
 <br />
 <span className="text-[#0071e3]">Clear features and pricing.</span>
 </h1>

 <p className="mt-5 text-base sm:text-xl text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
 Plan prices, availability, and included features are managed by the platform administrator.
 </p>
 </section>

 {/* ── ORDERING TIERS ── */}
 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
 <div className="grid md:grid-cols-2 gap-5">
 {plans.map((plan, index) => (
 <article key={plan.plan_key} className={`rounded-[32px] p-8 ${index === 0 ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#1d1d1f]'}`}>
 <p className={`text-xs font-semibold uppercase tracking-wide ${index === 0 ? 'text-[#30d158]' : 'text-[#0071e3]'}`}>{plan.is_active ? 'Available' : 'Not available'}</p>
 <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
 <p className={`mt-2 text-sm leading-relaxed ${index === 0 ? 'text-white/70' : 'text-[#6e6e73]'}`}>{plan.description}</p>
 <p className="mt-5 text-2xl font-semibold">{plan.monthly_price === 0 ? 'No monthly fee' : `RM ${Number(plan.monthly_price).toFixed(2)}`}<span className={`ml-1 text-xs font-normal ${index === 0 ? 'text-white/60' : 'text-[#86868b]'}`}>{plan.monthly_price === 0 ? '' : '/ month'}</span></p>
 <ul className={`mt-6 space-y-3 text-sm ${index === 0 ? 'text-white/85' : 'text-[#515154]'}`}>
 {plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className={`h-4 w-4 shrink-0 ${index === 0 ? 'text-[#30d158]' : 'text-[#0071e3]'}`} />{feature}</li>)}
 </ul>
 {plan.plan_key === 'ordering' && plan.is_active ? (
  <Link href={'/shop-owner/profile' as any} className="mt-8 inline-flex items-center rounded-full bg-[#0071e3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ed]">
   Get started <ArrowRight className="ml-2 h-4 w-4" />
  </Link>
 ) : plan.online_payments_enabled ? (
  <p className="mt-8 rounded-2xl bg-[#f5f5f7] p-4 text-xs leading-relaxed text-[#6e6e73]">Online checkout still requires a configured payment provider.</p>
 ) : null}
 </article>
 ))}
 </div>
 </section>

 {/* ── ALL FEATURES UNLOCKED ── */}
 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="max-w-2xl mx-auto text-center mb-12">
 <p className="text-xs font-semibold text-[#0071e3] mb-2">
 Included platform features
 </p>
 <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
 Order without online payment.
 </h2>
 <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
 QR ordering, kitchen management, venue tools, and customer discovery in one platform.
 </p>
 </div>

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {includedFeatures.map((item, idx) => {
 const Icon = item.icon;
 return (
 <div
 key={idx}
 className="bg-white p-6 sm:p-7 rounded-[28px]"
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

 {/* ── TIER COMPARISON ── */}
 <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="max-w-2xl mx-auto text-center mb-12">
 <p className="text-xs font-semibold text-[#0071e3] mb-2">
 Plan comparison
 </p>
 <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
 Compare plan features
 </h2>
 <p className="text-sm sm:text-base text-[#6e6e73] mt-2">
 Plan availability and features are managed by the platform administrator.
 </p>
 </div>

 <div className="bg-white rounded-[32px] overflow-hidden">
 <div className="grid grid-cols-[1.2fr_1fr_1fr] p-5 sm:p-6 bg-[#f5f5f7] text-xs font-semibold text-[#86868b]">
 <div>Feature</div>
 <div className="text-[#0071e3]">{orderingPlan?.name ?? 'Ordering'}</div>
 <div className="text-[#86868b]">{onlinePaymentsPlan?.name ?? 'Online payments'}</div>
 </div>

 <div className=" text-xs sm:text-sm">
 {comparisonRows.map((row, idx) => (
 <div
 key={idx}
 className={`grid grid-cols-[1.2fr_1fr_1fr] p-4 sm:p-5 items-center ${ row.highlight ? 'bg-[#0071e3]/[0.02]' : 'hover:bg-black/[0.01]' }`}
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
 className="bg-white p-6 rounded-2xl space-y-2"
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
 <div className="bg-[#1d1d1f] text-white rounded-[32px] p-8 sm:p-14 relative overflow-hidden">
 <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
 Ready to bring your food hall into the future?
 </h2>
 <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl mx-auto">
 Review the available plans above and start setting up your food hall.
 </p>

 <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
 <Link
 href={'/shop-owner/profile' as any}
 className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] "
 >
 Get Started
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
