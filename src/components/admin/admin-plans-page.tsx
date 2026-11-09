'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, LoaderCircle, Save } from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { authenticatedFetch } from '@/lib/supabase/client';

type PlatformPlan = {
  planKey: 'ordering' | 'online_payments';
  name: string;
  description: string;
  monthlyPrice: number;
  isActive: boolean;
  onlinePaymentsEnabled: boolean;
  features: string[];
};

type PlanRow = {
  plan_key: PlatformPlan['planKey'];
  name: string;
  description: string;
  monthly_price: number;
  is_active: boolean;
  online_payments_enabled: boolean;
  features: string[];
};

function fromRow(row: PlanRow): PlatformPlan {
  return {
    planKey: row.plan_key,
    name: row.name,
    description: row.description,
    monthlyPrice: Number(row.monthly_price),
    isActive: row.is_active,
    onlinePaymentsEnabled: row.online_payments_enabled,
    features: row.features ?? [],
  };
}

export function AdminPlansPage() {
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/admin/plans');
      const payload = (await response.json()) as { plans?: PlanRow[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to load plans.');
      setPlans((payload.plans ?? []).map(fromRow));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load plans.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const updatePlan = (planKey: PlatformPlan['planKey'], changes: Partial<PlatformPlan>) => {
    setSaved(false);
    setPlans((current) => current.map((plan) => plan.planKey === planKey ? { ...plan, ...changes } : plan));
  };

  const savePlans = async () => {
    setIsSaving(true);
    setSaved(false);
    setError('');
    try {
      const response = await authenticatedFetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      });
      const payload = (await response.json()) as { plans?: PlanRow[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to save plans.');
      setPlans((payload.plans ?? []).map(fromRow));
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save plans.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader text="Loading plans" fullHeight={false} variant="plans" />;

  return (
    <main className="mx-auto max-w-4xl space-y-5">
      {error && <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      {plans.length === 0 && !error ? (
        <div className="rounded-[26px] bg-white p-6 text-sm text-[#6e6e73]">No plans are configured.</div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <section key={plan.planKey} className="space-y-5 rounded-[26px] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#86868b]">{plan.planKey === 'ordering' ? 'Ordering plan' : 'Online payments plan'}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#1d1d1f]">{plan.name}</h2>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={plan.isActive}
                  onClick={() => updatePlan(plan.planKey, { isActive: !plan.isActive })}
                  className={`relative h-7 w-12 rounded-full transition-colors ${plan.isActive ? 'bg-[#1d1d1f]' : 'bg-[#d1d1d6]'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${plan.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  <span className="sr-only">{plan.isActive ? 'Plan available' : 'Plan unavailable'}</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#6e6e73]">
                  Plan name
                  <input
                    value={plan.name}
                    maxLength={80}
                    onChange={(event) => updatePlan(plan.planKey, { name: event.target.value })}
                    className="mt-1.5 w-full px-3.5 py-3 text-sm font-medium text-[#1d1d1f]"
                  />
                </label>
                <label className="block text-xs font-semibold text-[#6e6e73]">
                  Monthly price (MYR)
                  <div className="mt-1.5 flex items-center rounded-[14px] bg-[#f5f5f7] px-3.5">
                    <span className="text-sm text-[#86868b]">RM</span>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      step="0.01"
                      value={plan.monthlyPrice}
                      onChange={(event) => updatePlan(plan.planKey, { monthlyPrice: Number(event.target.value) })}
                      className="w-full bg-transparent px-2 py-3 text-sm font-medium text-[#1d1d1f]"
                    />
                  </div>
                </label>
              </div>

              <label className="block text-xs font-semibold text-[#6e6e73]">
                Description
                <textarea
                  value={plan.description}
                  maxLength={300}
                  rows={2}
                  onChange={(event) => updatePlan(plan.planKey, { description: event.target.value })}
                  className="mt-1.5 w-full resize-y px-3.5 py-3 text-sm font-medium text-[#1d1d1f]"
                />
              </label>

              <label className="block text-xs font-semibold text-[#6e6e73]">
                Included features <span className="font-normal text-[#86868b]">(one per line)</span>
                <textarea
                  value={plan.features.join('\n')}
                  rows={Math.max(3, Math.min(6, plan.features.length + 1))}
                  onChange={(event) => updatePlan(plan.planKey, { features: event.target.value.split('\n') })}
                  className="mt-1.5 w-full resize-y px-3.5 py-3 text-sm font-medium text-[#1d1d1f]"
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] p-4 text-sm text-[#1d1d1f]">
                <input
                  type="checkbox"
                  checked={plan.onlinePaymentsEnabled}
                  onChange={(event) => updatePlan(plan.planKey, { onlinePaymentsEnabled: event.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[#1d1d1f]"
                />
                <span>
                  <span className="block font-semibold">Online payment capability</span>
                  <span className="mt-0.5 block text-xs font-normal text-[#6e6e73]">This setting describes plan capability; it does not activate a payment provider.</span>
                </span>
              </label>
            </section>
          ))}
        </div>
      )}

      {plans.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {saved && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" /> Changes saved</span>}
          <button
            type="button"
            onClick={() => void savePlans()}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save plans
          </button>
        </div>
      )}
    </main>
  );
}
