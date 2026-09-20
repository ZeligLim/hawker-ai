'use client';

import { LogOut, Store, Clock, ShieldAlert, Settings, Save, X, Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';
import { OperatingScheduleModal } from '@/components/operating-schedule-modal';
import type { OperatingSchedule } from '@/lib/schedule/operating-hours';
import { authenticatedFetch } from '@/lib/supabase/client';
import { SaveCancelButtons } from '@/components/save-cancel-buttons';
import { RentInvoices } from '@/components/rent-invoices';

export default function OwnerProfilePage() {
  const { profile, signOut, roles } = useAuth();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const currentBooth = roles.booths?.[0];
  const primaryStall = currentBooth?.name ?? 'Assigned Stall';

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);
  
  const handleToggleStallOpen = async () => {
    if (!currentBooth?.id) return;
    
    const nextOpen = currentBooth.isActive !== false ? false : true;
    
    if (nextOpen === false) {
      if (!window.confirm('Are you sure you want to put this stall inactive? It will no longer be visible to customers.')) return;
    } else {
      if (!window.confirm('Are you sure you want to activate this stall?')) return;
    }

    setIsTogglingOpen(true);
    
    try {
      const res = await authenticatedFetch(`/api/owner/booths/${currentBooth.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextOpen }),
      });
      if (!res.ok) throw new Error('Failed to update stall status');
      window.location.reload();
    } catch (err) {
      alert('Failed to update stall status');
    } finally {
      setIsTogglingOpen(false);
    }
  };

  const handleSaveStallSchedule = async (schedule: OperatingSchedule) => {
    if (!currentBooth?.id) return;
    const res = await authenticatedFetch(`/api/owner/booths/${currentBooth.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule }),
    });
    if (!res.ok) throw new Error('Failed to save schedule');
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <section className="rounded-[26px] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">
                {profile?.displayName?.slice(0, 1).toUpperCase() ?? 'H'}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile?.displayName ?? 'Stall Operator'}</h2>
                <p className="mt-1 text-sm text-[#6e6e73]">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSignOutDialogOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-neutral-200 transition-colors shadow-xs"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-4">
            <Store className="h-5 w-5 text-[#0071e3]" />
            <div>
              <p className="text-sm font-semibold">Your Stall Kitchen</p>
              <p className="mt-1 text-xs text-[#6e6e73] font-medium">{primaryStall}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Stall Operations</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f5f5f7] px-4 text-xs font-semibold text-[#1d1d1f] hover:bg-neutral-200 transition-colors shadow-xs"
            >
              <Clock className="h-4 w-4 text-[#1d1d1f]" />
              Stall Hours
            </button>
            <button
              type="button"
              disabled={isTogglingOpen}
              onClick={handleToggleStallOpen}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 ${
                currentBooth?.isActive !== false
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              {currentBooth?.isActive !== false ? 'Put Inactive' : 'Activate Stall'}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Payment & Payouts</h3>
          <p className="mb-4 text-xs text-[#6e6e73]">
            Connect your Airwallex account to receive payouts from online orders.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="airwallex_account_id" className="text-xs font-semibold text-[#1d1d1f]">
                Airwallex Connected Account ID
              </label>
              <input
                id="airwallex_account_id"
                type="text"
                placeholder="e.g. acct_..."
                defaultValue={currentBooth?.airwallex_account_id || ''}
                className="w-full rounded-xl bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                onBlur={async (e) => {
                  const val = e.target.value.trim() || null;
                  if (val === currentBooth?.airwallex_account_id) return;
                  if (!currentBooth?.id) return;
                  try {
                    const res = await authenticatedFetch(`/api/owner/booths/${currentBooth.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ airwallex_account_id: val }),
                    });
                    if (!res.ok) throw new Error('Failed to update Airwallex account');
                    window.location.reload();
                  } catch (err) {
                    alert('Failed to update Airwallex account ID');
                  }
                }}
              />
            </div>
          </div>
        </section>

        {currentBooth?.id && <RentInvoices boothId={currentBooth.id} />}

        <div className="mt-6">
          <RoleModeSwitcher currentMode="booth" />
        </div>

        <OperatingScheduleModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          title={`${primaryStall} Hours`}
          description="Operating hours for this stall."
          initialSchedule={currentBooth?.schedule}
          onSave={handleSaveStallSchedule}
        />

        {isSignOutDialogOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" role="presentation">
            <div role="dialog" aria-modal="true" aria-labelledby="owner-sign-out-title" className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
              <h2 id="owner-sign-out-title" className="text-xl font-semibold tracking-[-0.04em]">Sign out?</h2>
              <p className="mt-2 text-sm text-[#6e6e73]">You can sign in again anytime to manage your stall.</p>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => setIsSignOutDialogOpen(false)} className="flex-1 rounded-full bg-[#f5f5f7] px-4 py-3 text-sm font-semibold text-[#1d1d1f]">
                  Cancel
                </button>
                <button type="button" onClick={() => void signOut()} className="flex-1 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
