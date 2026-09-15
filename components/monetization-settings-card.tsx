'use client';

import { useState } from 'react';
import { Percent, DollarSign, Save, Check, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';

export type MonetizationSettingsCardProps = {
  shopId: string;
  initialFeeMode?: 'percentage' | 'fixed' | 'mixed';
  initialFeePayer?: 'CUSTOMER' | 'MERCHANT';
  initialPlatformFeePercent?: number; // e.g. 5.0 for 5.0%
  initialPlatformFeeFixed?: number; // e.g. 0.50 for RM 0.50
  onUpdated?: () => void;
};

/**
 * Restricted Platform Configuration Component: Monetization & Charge Settings.
 * STRICTLY GUARDS rendering to users with SaaS superadmin or platform owner roles.
 * Returns null if the authenticated user lacks platform administration privileges.
 */
export function MonetizationSettingsCard({
  shopId,
  initialFeeMode = 'percentage',
  initialFeePayer = 'CUSTOMER',
  initialPlatformFeePercent = 5.0,
  initialPlatformFeeFixed = 0.50,
  onUpdated,
}: MonetizationSettingsCardProps) {
  const { roles } = useAuth();

  // 1. Frontend In-App Role Guard:
  // Render ONLY for platform superadmin or SaaS platform owner
  const isAuthorizedAdmin = roles.isSuperAdmin || roles.isSaasOwner;

  const [feeMode, setFeeMode] = useState<'percentage' | 'fixed' | 'mixed'>(initialFeeMode);
  const [feePayer, setFeePayer] = useState<'CUSTOMER' | 'MERCHANT'>(initialFeePayer);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(initialPlatformFeePercent);
  const [platformFeeFixed, setPlatformFeeFixed] = useState<number>(initialPlatformFeeFixed);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If unauthorized, do not render component to DOM
  if (!isAuthorizedAdmin) {
    return null;
  }

  // Live calculation preview values for RM 20.00 sample order
  const simulatedPercent = feeMode === 'fixed' ? 0 : platformFeePercent / 100;
  const simulatedFixed = feeMode === 'percentage' ? 0 : platformFeeFixed;
  const sampleFee = 20.0 * simulatedPercent + simulatedFixed;
  const sampleCustomerTotal = feePayer === 'CUSTOMER' ? 20.0 + sampleFee : 20.0;
  const sampleStallPayout = feePayer === 'MERCHANT' ? Math.max(0, 20.0 - sampleFee) : 20.0;

  const handleSaveMonetization = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const feePercentDecimal =
        feeMode === 'fixed' ? 0.0 : Number((platformFeePercent / 100).toFixed(4));
      const feeFixedAmount =
        feeMode === 'percentage' ? 0.0 : Number(platformFeeFixed.toFixed(2));

      const response = await authenticatedFetch(`/api/owner/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_payer: feePayer,
          platform_fee_fixed: feeFixedAmount,
          platform_fee_percent: feePercentDecimal,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to update monetization settings.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      onUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message ?? 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[26px] bg-white p-5 sm:p-6 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-amber-500/20">
      {/* Superadmin Authorization Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Monetization & Charge Settings</h2>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          Platform Admin Only
        </div>
      </div>

      <p className="mt-3 text-xs text-[#6e6e73]">
        Configures global or venue-specific platform commission rates. This configuration is
        restricted exclusively to SaaS superadmins and platform owners.
      </p>

      <div className="mt-5 space-y-4">
        {/* Charge Mode Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6e6e73] mb-2">
            Charge Model
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFeeMode('percentage')}
              className={`flex flex-col items-center justify-center rounded-[16px] p-3 text-xs font-semibold border transition-all ${
                feeMode === 'percentage'
                  ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                  : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              <Percent className="h-4 w-4 mb-1" />
              Percentage
            </button>
            <button
              type="button"
              onClick={() => setFeeMode('fixed')}
              className={`flex flex-col items-center justify-center rounded-[16px] p-3 text-xs font-semibold border transition-all ${
                feeMode === 'fixed'
                  ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                  : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              <DollarSign className="h-4 w-4 mb-1" />
              Flat Fee
            </button>
            <button
              type="button"
              onClick={() => setFeeMode('mixed')}
              className={`flex flex-col items-center justify-center rounded-[16px] p-3 text-xs font-semibold border transition-all ${
                feeMode === 'mixed'
                  ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                  : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              <span className="text-[11px] font-bold mb-1">% + RM</span>
              Mixed
            </button>
          </div>
        </div>

        {/* Percentage Input */}
        {feeMode === 'percentage' || feeMode === 'mixed' ? (
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6e6e73]">
                Percentage Charge (%)
              </label>
              <span className="text-xs font-semibold text-amber-700">
                {platformFeePercent}% per order
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 text-base font-semibold text-[#1d1d1f] outline-none"
                placeholder="5.0"
              />
              <span className="text-sm font-bold text-[#6e6e73]">%</span>
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[2.5, 3.0, 5.0, 8.0, 10.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPlatformFeePercent(pct)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                    platformFeePercent === pct
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-black/5 bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Flat Fee Input */}
        {feeMode === 'fixed' || feeMode === 'mixed' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6e6e73] mb-2">
              Flat Fee Amount (RM)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#6e6e73]">RM</span>
              <input
                type="number"
                step="0.10"
                min="0"
                max="10"
                value={platformFeeFixed}
                onChange={(e) => setPlatformFeeFixed(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 text-base font-semibold text-[#1d1d1f] outline-none"
                placeholder="0.50"
              />
            </div>
          </div>
        ) : null}

        {/* Fee Payer */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6e6e73] mb-2">
            Fee Payer Model
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFeePayer('CUSTOMER')}
              className={`rounded-[16px] p-3 text-left border transition-all ${
                feePayer === 'CUSTOMER'
                  ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                  : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              <p className="text-xs font-bold">Diner Pays Fee</p>
              <p className={`mt-0.5 text-[11px] ${feePayer === 'CUSTOMER' ? 'text-white/80' : 'text-[#6e6e73]'}`}>
                Added to diner bill as platform fee
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFeePayer('MERCHANT')}
              className={`rounded-[16px] p-3 text-left border transition-all ${
                feePayer === 'MERCHANT'
                  ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                  : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
              }`}
            >
              <p className="text-xs font-bold">Stall Pays Commission</p>
              <p className={`mt-0.5 text-[11px] ${feePayer === 'MERCHANT' ? 'text-white/80' : 'text-[#6e6e73]'}`}>
                Deducted from vendor payout
              </p>
            </button>
          </div>
        </div>

        {/* Live Calculation Preview Box */}
        <div className="rounded-[18px] bg-[#f9fafb] border border-black/5 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d1d1f]">
            <Info className="h-3.5 w-3.5 text-blue-600" />
            Live Preview (Sample RM 20.00 Order)
          </div>
          <div className="mt-2 space-y-1 text-xs text-[#6e6e73]">
            <div className="flex justify-between">
              <span>Food Subtotal:</span>
              <span className="font-medium text-[#1d1d1f]">RM 20.00</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>
                Charge ({feeMode === 'percentage' ? `${platformFeePercent}%` : feeMode === 'fixed' ? 'Fixed' : `${platformFeePercent}% + RM${platformFeeFixed}`}):
              </span>
              <span className="font-semibold">RM {sampleFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-black/5 font-semibold text-[#1d1d1f]">
              <span>Customer Pays:</span>
              <span>RM {sampleCustomerTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Stall Receives:</span>
              <span className="font-semibold">RM {sampleStallPayout.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSaveMonetization()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-70 transition-all"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving changes…' : 'Save monetization rates'}
        </button>
        {saveSuccess ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
            <Check className="h-4 w-4" /> Monetization rates updated
          </span>
        ) : null}
      </div>
    </section>
  );
}
