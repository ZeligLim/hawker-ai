'use client';

import React, { useEffect, useState } from 'react';
import { CentreDinerPage } from '@/components/centre-diner-page';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';
import { getStoredTableSession } from '@/lib/table-session';
import { LoaderCircle, Store } from 'lucide-react';

/**
 * Customer Home Page (Deprecated multi-centre map view).
 * Customers now land directly within the isolated context of their active hawker centre.
 */
export function HomePage() {
  const [centre, setCentre] = useState<HawkerCentreSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadActiveCentre = async () => {
      try {
        const session = getStoredTableSession();
        const res = await fetch('/api/hawker-centres');
        if (!res.ok) return;
        const data = await res.json();
        const centres: HawkerCentreSummary[] = data.hawkerCentres || [];

        if (centres.length === 0) return;

        // Resolve active centre based on table session, or default to the primary active venue
        let target = centres.find(
          (c) => session?.centreSlug && c.slug.toLowerCase() === session.centreSlug.toLowerCase()
        );
        if (!target && session?.centreId) {
          target = centres.find((c) => c.id === session.centreId);
        }
        if (!target) {
          target = centres.find((c) => c.isActive !== false) || centres[0];
        }

        if (active && target) {
          setCentre(target);
        }
      } catch (err) {
        console.error('Failed to resolve active hawker centre:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadActiveCentre();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-[#6e6e73]">
        <LoaderCircle className="h-6 w-6 animate-spin text-[#111827] mb-3" />
        <p className="text-xs font-medium">Entering your dining hall…</p>
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="mx-auto max-w-md p-6 text-center text-[#1d1d1f]">
        <Store className="h-10 w-10 text-[#86868b] mx-auto mb-3" />
        <h2 className="text-lg font-bold">No Venue Connected</h2>
        <p className="mt-1 text-xs text-[#6e6e73]">
          Scan your table QR code to view the menu and stalls for your food court.
        </p>
      </div>
    );
  }

  return <CentreDinerPage centre={centre} />;
}
