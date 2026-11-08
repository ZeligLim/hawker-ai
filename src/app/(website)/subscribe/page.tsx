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
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';

const platformGuarantees = [
 'QR menus and order submission with payment at the counter',
 'Unlimited stalls & QR table codes',
 'Multi-stall order routing',
 'Real-time mobile Kitchen Display System (KDS)',
 'Single-click cryptographic booth invite keys',
 'No bank or settlement details required for Level 1',
];

function LaunchpadContent() {
 const { user, status, profile, refreshRoles } = useAuth();
 const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submissionError, setSubmissionError] = useState<string | null>(null);

 // Form states - Step 1: Venue Profile
 const [venueName, setVenueName] = useState('');
 const [operatorName, setOperatorName] = useState(() => profile?.displayName || user?.user_metadata?.full_name || '');
 const [email, setEmail] = useState(() => user?.email || '');
 const [phone, setPhone] = useState('');
 const [city, setCity] = useState('Kuala Lumpur');
 const [stallCount, setStallCount] = useState('6-15 stalls');

 // Form states - Step 3: Booth Token Generation
 const [firstStallSlot, setFirstStallSlot] = useState('Slot #01');
 const [slotLocation, setSlotLocation] = useState('Main Floor - Counter 01');

 // Step 4: Generated Invite Code
 const [copiedCode, setCopiedCode] = useState(false);
 const [copiedLink, setCopiedLink] = useState(false);
 const [generatedInviteToken, setGeneratedInviteToken] = useState<string | null>(null);
 const generatedCode = generatedInviteToken || '';

 const handleCopyInvite = () => {
 if (!generatedCode) return;
 navigator.clipboard?.writeText(generatedCode);
 setCopiedCode(true);
 setTimeout(() => setCopiedCode(false), 2200);
 };

 const handleCopyLink = () => {
 if (!generatedCode) return;
 const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
 navigator.clipboard?.writeText(`${origin}/booths/join?token=${generatedCode}`);
 setCopiedLink(true);
 setTimeout(() => setCopiedLink(false), 2200);
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

 // 2. Create the first booth slot
 const boothRes = await fetch('/api/owner/booths', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${session.access_token}`,
 },
 body: JSON.stringify({
 restaurantId: shopId,
 name: firstStallSlot.trim() || 'Slot #01',
 }),
 });

 const boothData = await boothRes.json().catch(() => ({}));
 if (!boothRes.ok || !boothData.booth?.id) {
 throw new Error(boothData.error || 'Failed to provision initial booth slot.');
 }

 const boothId = boothData.booth.id;

 // 3. Generate cryptographic invite code
 const inviteRes = await fetch(`/api/owner/booths/${boothId}/invite`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${session.access_token}`,
 },
 });

 const inviteData = await inviteRes.json().catch(() => ({}));
 if (!inviteRes.ok || !inviteData.token) {
 throw new Error(inviteData.error || 'Failed to generate cryptographic invite token.');
 }

 setGeneratedInviteToken(inviteData.token);
 await refreshRoles();
 if (typeof window !== 'undefined') {
 window.localStorage.setItem('hawker-active-mode', 'shop_owner');
 window.localStorage.setItem('hawker-shop-owner-mode', 'true');
 }
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
 <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#f5f5f7]/85">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
 <Link href="/" className="flex items-center gap-2.5 group">
 <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] text-white flex items-center justify-center font-black text-xs tracking-tighter group-hover:scale-105 -transform">
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
 className="text-[#6e6e73] hover:text-[#1d1d1f] px-2 py-1"
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
 className="px-3.5 py-1.5 rounded-full bg-white hover:bg-black/[0.04] text-[#1d1d1f] text-xs font-semibold"
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
 className={`p-3 rounded-2xl ${ currentStep === 1 ? '] bg-[#0071e3]/5 text-[#0071e3]' : currentStep > 1 ? ' bg-[#30d158]/5 text-[#30d158]' : ' bg-white text-[#86868b]' }`}
 >
 <div className="flex items-center gap-2">
 <span
 className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${ currentStep > 1 ? 'bg-[#30d158] text-white' : currentStep === 1 ? 'bg-[#0071e3] text-white' : 'bg-black/10 text-[#86868b]' }`}
 >
 {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
 </span>
 <span className="font-semibold truncate">1. Venue Profile</span>
 </div>
 </div>

 <div
 className={`p-3 rounded-2xl ${ currentStep === 2 ? '] bg-[#0071e3]/5 text-[#0071e3]' : currentStep > 2 ? ' bg-[#30d158]/5 text-[#30d158]' : ' bg-white text-[#86868b]' }`}
 >
 <div className="flex items-center gap-2">
 <span
 className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${ currentStep > 2 ? 'bg-[#30d158] text-white' : currentStep === 2 ? 'bg-[#0071e3] text-white' : 'bg-black/10 text-[#86868b]' }`}
 >
 {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
 </span>
 <span className="font-semibold truncate">2. Order Plan</span>
 </div>
 </div>

 <div
 className={`p-3 rounded-2xl ${ currentStep === 3 ? '] bg-[#0071e3]/5 text-[#0071e3]' : currentStep > 3 ? ' bg-[#30d158]/5 text-[#30d158]' : ' bg-white text-[#86868b]' }`}
 >
 <div className="flex items-center gap-2">
 <span
 className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${ currentStep > 3 ? 'bg-[#30d158] text-white' : currentStep === 3 ? 'bg-[#0071e3] text-white' : 'bg-black/10 text-[#86868b]' }`}
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
 <div className="bg-white rounded-[32px] p-6 sm:p-10 ">
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
 className="w-full h-[46px] rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:] focus: focus: placeholder:text-[#86868b]"
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
 className="w-full h-[46px] rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:] focus: focus: placeholder:text-[#86868b]"
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
 className="w-full h-[46px] rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:] focus: focus: placeholder:text-[#86868b]"
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
 className="w-full h-[46px] rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:] focus: focus: placeholder:text-[#86868b]"
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
 className="w-full h-[46px] appearance-none rounded-2xl bg-white px-4 pr-10 text-sm text-[#1d1d1f] focus:] focus: focus: cursor-pointer"
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
 className={`py-2.5 px-3 rounded-xl text-xs font-medium text-center ${ stallCount === opt ? '] bg-[#0071e3]/10 text-[#0071e3] font-semibold' : ' bg-white text-[#1d1d1f] hover:bg-black/[0.02]' }`}
 >
 {opt}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="pt-4 flex items-center justify-between">
 <span className="text-xs text-[#86868b]">Zero software bills &bull; RM 0 today</span>
 <button
 onClick={handleNext}
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] "
 >
 Continue to Order Plan
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 )}

 {/* ── STEP 2: ORDER PLAN ── */}
 {currentStep === 2 && (
 <div className="space-y-6">
 <div>
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
 <BadgePercent className="w-3.5 h-3.5" />
 Stage 2 of 3 &bull; Ordering Tier
 </div>
 <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
 Start with Level 1 ordering.
 </h2>
 <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
 Level 1 lets customers order from your QR menu and pay at the stall counter. It does not collect online payments or require settlement account details.
 </p>
 </div>

 <div className="rounded-2xl border border-[#0071e3]/15 bg-[#0071e3]/5 p-5">
 <p className="text-sm font-semibold text-[#1d1d1f]">Level 1 · Order now, pay at the counter</p>
 <p className="mt-1 text-xs leading-relaxed text-[#6e6e73]">
 Level 2 online payments are planned for a later release and will only be enabled after a payment provider is integrated. No payment gateway or automatic settlement is active today.
 </p>
 </div>

 <div className="pt-4 flex items-center justify-between">
 <button
 onClick={handleBack}
 className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] "
 >
 <ArrowLeft className="w-3.5 h-3.5" /> Back
 </button>
 <button
 onClick={handleNext}
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] "
 >
 Generate Booth Token
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 )}

 {/* ── STEP 3: BOOTH TOKEN GENERATION & VENUE LAUNCH ── */}
 {currentStep === 3 && (
 <div className="space-y-6">
 <div>
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-3">
 <KeyRound className="w-3.5 h-3.5" />
 Stage 3 of 3 &bull; Generate Booth Token
 </div>
 <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
 Generate your first booth token.
 </h2>
 <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">
 Food hall operators do not set up individual stall brands or menus. You only generate the invitation token for a booth slot. When your vendor redeems the token link, they will name their stall and configure their live kitchen.
 </p>
 </div>

 <div className="space-y-4 pt-2">
 <div className="grid sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
 Booth Slot Identifier
 </label>
 <input
 type="text"
 value={firstStallSlot}
 onChange={(e) => setFirstStallSlot(e.target.value)}
 placeholder="e.g. Slot #01"
 className="w-full h-[46px] rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:] focus: focus: placeholder:text-[#86868b]"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
 Location / Counter (Optional)
 </label>
 <input
 type="text"
 value={slotLocation}
 onChange={(e) => setSlotLocation(e.target.value)}
 placeholder="e.g. Counter 1, Ground Floor"
 className="w-full h-[46px] rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:] focus: focus: placeholder:text-[#86868b]"
 />
 </div>
 </div>

 {/* Informational Callout */}
 <div className="p-4 rounded-2xl bg-[#f5f5f7] flex items-start gap-3">
 <Sparkles className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
 <p className="text-xs text-[#6e6e73] leading-relaxed">
 Launching will generate a 1-click invitation link. You can send it directly to your stall holder via WhatsApp, message, or QR code.
 </p>
 </div>
 </div>

 {submissionError && (
 <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700">
 {submissionError}
 </div>
 )}

 <div className="pt-4 flex items-center justify-between">
 <button
 onClick={handleBack}
 disabled={isSubmitting}
 className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] disabled:opacity-50"
 >
 <ArrowLeft className="w-3.5 h-3.5" /> Back
 </button>
 <button
 onClick={handleNext}
 disabled={isSubmitting}
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-70"
 >
 {isSubmitting ? (
 <>
 <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
 Generating Token & Launching...
 </>
 ) : (
 <>
 Launch Venue & Generate Token
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
 <strong className="text-[#1d1d1f]">{venueName}</strong> has been initialized. Your invitation token for <strong className="text-[#1d1d1f]">{firstStallSlot}</strong> has been generated and is ready to share with your stall vendor.
 </p>
 </div>

 {/* Generated Invitation Token Card */}
 <div className="p-5 sm:p-6 rounded-2xl bg-[#f5f5f7] space-y-4">
 <div className="flex items-center justify-between text-xs">
 <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
 <KeyRound className="w-4 h-4 text-[#0071e3]" /> Booth Invitation Token
 </span>
 <span className="text-[#30d158] font-semibold text-[11px]">Valid for 48 Hours</span>
 </div>

 <div className="bg-white p-4 rounded-xl flex items-center justify-between gap-4">
 <div>
 <p className="text-xs text-[#86868b] font-semibold">
 {firstStallSlot} &bull; Invitation code
 </p>
 <p className="text-2xl font-mono font-bold tracking-widest text-[#1d1d1f] mt-0.5">
 {generatedCode}
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={handleCopyInvite}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#1d1d1f] hover:bg-black/[0.04] shrink-0"
 >
 {copiedCode ? (
 <>
 <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" /> Copied
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5" /> Copy Code
 </>
 )}
 </button>
 <button
 onClick={handleCopyLink}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] shrink-0"
 >
 {copiedLink ? (
 <>
 <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Link Copied
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5" /> Copy Link
 </>
 )}
 </button>
 </div>
 </div>

 <p className="text-xs text-[#6e6e73] leading-relaxed">
 Share this invitation link with your stall vendor. When they open it, they can name their stall, configure dishes, and immediately launch their live Kitchen Display System (KDS).
 </p>
 </div>

 {/* Next Action Buttons */}
 <div className="pt-2 space-y-3">
 <Link
 href={'/shop-owner/booths' as any}
 className="w-full inline-flex items-center justify-center py-3.5 rounded-full text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black gap-2"
 >
 Open Food Hall Operator Dashboard
 <ArrowRight className="w-4 h-4" />
 </Link>

 <div className="grid sm:grid-cols-2 gap-3">
 <Link
 href={`/booths/join?token=${encodeURIComponent(generatedCode)}` as any}
 className="inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold bg-white text-[#1d1d1f] hover:bg-black/[0.04] "
 >
 Test Stall Redemption Flow
 </Link>
 <Link
 href="/"
 className="inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold bg-white text-[#1d1d1f] hover:bg-black/[0.04] "
 >
 Return to Homepage
 </Link>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* RIGHT: LEVEL 1 SUMMARY */}
 <aside className="bg-white rounded-[32px] p-6 sm:p-8 space-y-6 lg:sticky lg:top-20">
 <div>
 <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/5 text-[#86868b] text-xs font-semibold mb-2">
 Level 1 · Ordering
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
 Digital ordering, no online payment.
 </h3>
 <p className="text-sm font-semibold text-[#0071e3] mt-0.5">
 Customer pays the stall at the counter.
 </p>
 <p className="text-xs text-[#6e6e73] mt-1.5 leading-relaxed">
 Orders are submitted to stalls through the QR menu and managed in the live order interface.
 </p>
 </div>

 {/* Level 1 summary */}
 <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-2.5 text-xs">
 <div className="flex items-center justify-between text-[#6e6e73]">
 <span>Online payment collection</span>
 <span className="font-semibold text-[#1d1d1f]">Not included</span>
 </div>
 <div className="flex items-center justify-between text-[#6e6e73]">
 <span>Payment at checkout</span>
 <span className="font-semibold text-[#1d1d1f]">None</span>
 </div>
 <div className="flex items-center justify-between text-[#6e6e73]">
 <span>Customer payment</span>
 <span className="font-semibold text-[#0071e3]">At stall counter</span>
 </div>
 <div className="flex items-center justify-between text-[#6e6e73]">
 <span>Settlement details</span>
 <span className="font-semibold text-[#1d1d1f]">Not required</span>
 </div>
 <div className="pt-2 flex items-center justify-between font-bold text-sm text-[#1d1d1f]">
 <span>Online payment fees</span>
 <span className="text-[#0071e3]">None</span>
 </div>
 </div>

 {/* Core Guarantees */}
 <div>
 <p className="text-xs font-semibold text-[#1d1d1f] mb-3">Level 1 includes:</p>
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
 <div className="pt-4 space-y-2 text-[11px] text-[#86868b]">
 <div className="flex items-center gap-2">
 <ShieldCheck className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
 <span>QR ordering &bull; Pay at the counter</span>
 </div>
 <div className="flex items-center gap-2">
 <Clock className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
 <span>Online payment processing is not active</span>
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
 <LoaderCircle className="w-4 h-4 text-[#0071e3] animate-spin" />
 <span>Loading Hawker Launchpad...</span>
 </div>
 </div>
 }
 >
 <LaunchpadContent />
 </Suspense>
 );
}
