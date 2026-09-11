'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp, Locate, MapPin, Navigation, Search, Store, X } from 'lucide-react';
import { HawkerMap } from '@/components/hawker-map';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';

// Haversine formula to calculate distance in kilometres
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function HomePage() {
  const [centres, setCentres] = useState<HawkerCentreSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 3.1440,
    lng: 101.6990,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Touch gesture state for swipe-up / swipe-down
  const touchStartY = useRef<number | null>(null);

  // Fetch real hawker centres
  useEffect(() => {
    let active = true;
    const fetchCentres = async () => {
      try {
        const res = await fetch('/api/hawker-centres');
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.hawkerCentres)) {
          setCentres(data.hawkerCentres);
          if (data.hawkerCentres.length > 0) {
            setSelectedCentreId(data.hawkerCentres[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load hawker centres:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchCentres();
    return () => {
      active = false;
    };
  }, []);

  // Location Polling: Poll navigator.geolocation every 5 minutes with visibility guard
  const pollLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error / denied:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    // Initial geolocation poll on mount
    pollLocation();

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          pollLocation();
        }
      }, 5 * 60 * 1000); // Poll every 5 minutes
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Trigger refresh immediately on active focus
        pollLocation();
        startTimer();
      } else {
        // Pause timer via document.visibilityState when tab is hidden
        stopTimer();
      }
    };

    if (document.visibilityState === 'visible') {
      startTimer();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollLocation]);

  // Rank list items and map markers strictly by shortest distance first
  // Recalculates on every location update
  const rankedCentres = useMemo(() => {
    return centres
      .map((c) => {
        let distanceKm: number | null = null;
        let walkMins: number | null = null;

        if (c.lat && c.lng) {
          distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
          walkMins = Math.max(1, Math.round(distanceKm * 13));
        }

        return {
          ...c,
          distanceKm,
          walkMins,
        };
      })
      .sort((a, b) => {
        const distA = a.distanceKm ?? 99999;
        const distB = b.distanceKm ?? 99999;
        return distA - distB;
      });
  }, [centres, userLocation]);

  // Search filtering while strictly preserving shortest distance ranking
  const filteredCentres = useMemo(() => {
    if (!searchQuery.trim()) return rankedCentres;
    const q = searchQuery.toLowerCase().trim();
    return rankedCentres.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }, [rankedCentres, searchQuery]);

  const nearestCentre = filteredCentres[0] ?? null;

  // Touch handlers for bottom sheet swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.touches[0].clientY;
    if (deltaY > 40 && !isExpanded) {
      setIsExpanded(true);
      touchStartY.current = null;
    } else if (deltaY < -40 && isExpanded) {
      setIsExpanded(false);
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 1. Map: Full viewport (100vw x 100vh), fixed background layer (z-index: 0) */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <HawkerMap
          fullScreen
          userLocation={userLocation}
          centres={filteredCentres}
          selectedCentreId={selectedCentreId}
          onSelectCentre={(c) => {
            setSelectedCentreId(c.id);
            setIsExpanded(true);
          }}
        />
      </div>

      {/* 2. Search: Floating top bar (top: 16px, centered, z-index: 10). Keep input simple. */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-10">
        <div className="relative flex items-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hawker centre or food..."
            className="h-11 w-full rounded-full bg-white/95 backdrop-blur-md pl-10 pr-10 text-xs sm:text-sm font-medium text-[#1d1d1f] placeholder-[#86868b] border border-black/10 outline-none focus:border-black/30 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#86868b] hover:text-[#1d1d1f]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => pollLocation()}
              disabled={isLocating}
              title="Recalculate location"
              aria-label="Recalculate location"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* 3. List: Swipe-up bottom sheet over the map. Default collapsed; swipe up to view full scrollable list. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-2xl rounded-t-[28px] bg-white/95 backdrop-blur-xl border-t border-black/10 shadow-[0_-12px_36px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'h-[75vh]' : 'h-32'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle & Header */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full pt-2.5 pb-2 px-5 text-left flex flex-col items-center cursor-pointer select-none shrink-0"
          aria-label={isExpanded ? 'Collapse list' : 'Expand full list'}
        >
          {/* Drag Handle Bar */}
          <div className="h-1.5 w-11 rounded-full bg-black/20 mb-2.5 transition-colors group-hover:bg-black/30" />

          <div className="w-full flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Nearby Food Halls
                </span>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-[#6e6e73]">
                  {filteredCentres.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#6e6e73] truncate">
                {nearestCentre
                  ? `Closest: ${nearestCentre.name} • ${
                      nearestCentre.distanceKm !== null
                        ? nearestCentre.distanceKm < 1
                          ? `${Math.round(nearestCentre.distanceKm * 1000)} m`
                          : `${nearestCentre.distanceKm} km`
                        : ''
                    }`
                  : 'Finding nearest centres...'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] shrink-0 bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full transition-colors">
              <span>{isExpanded ? 'Collapse' : 'View All'}</span>
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </div>
          </div>
        </button>

        {/* Scrollable list when expanded */}
        <div className={`flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-3 ${isExpanded ? 'block' : 'hidden'}`}>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-[20px] bg-black/5 animate-pulse" />
              ))}
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="rounded-[22px] bg-black/5 p-8 text-center">
              <Store className="mx-auto h-8 w-8 text-[#9ca3af]" />
              <p className="mt-2 text-sm font-semibold text-[#1d1d1f]">No hawker centres found</p>
              <p className="mt-1 text-xs text-[#6e6e73]">Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredCentres.map((centre) => {
              const isSelected = centre.id === selectedCentreId;

              return (
                <article
                  key={centre.id}
                  onClick={() => setSelectedCentreId(centre.id)}
                  className={`rounded-[22px] p-4 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-black/[0.03] border-[#111827] ring-1 ring-[#111827]'
                      : 'bg-white border-black/10 hover:border-black/20 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#1d1d1f] truncate">{centre.name}</h3>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                          Open
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#6e6e73] truncate">
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{centre.address}</span>
                      </p>
                    </div>

                    {centre.distanceKm !== null && (
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                          <Navigation className="h-3 w-3" />
                          {centre.distanceKm < 1
                            ? `${Math.round(centre.distanceKm * 1000)} m`
                            : `${centre.distanceKm} km`}
                        </span>
                        {centre.walkMins && (
                          <p className="mt-0.5 text-[10px] text-[#6e6e73]">
                            ~{centre.walkMins} min walk
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {centre.specialties.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {centre.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-[#6e6e73]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-black/5">
                    <span className="text-xs text-[#6e6e73] font-medium">
                      {centre.stallsCount} Food Stalls • ★ {centre.rating}
                    </span>

                    <Link
                      href={`/stall?centre=${encodeURIComponent(centre.slug)}` as any}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-black transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Enter & Order</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
