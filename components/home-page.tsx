'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  QrCode,
  Snowflake,
  Star,
  Store,
} from 'lucide-react';
import { HawkerMap } from '@/components/hawker-map';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';

type RankingMode = 'distance' | 'rating';

// Haversine formula to calculate geographic distance in kilometres
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
  const [rankingMode, setRankingMode] = useState<RankingMode>('distance');
  const [airconOnly, setAirconOnly] = useState(false);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Default coordinate: Kuala Lumpur City Centre
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 3.1440,
    lng: 101.6990,
  });

  // Touch gesture tracking for mobile swipe-up / swipe-down
  const touchStartY = useRef<number | null>(null);
  const sheetContentRef = useRef<HTMLDivElement>(null);

  // Fetch real hawker centres from API
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
      }
    };

    void fetchCentres();
    return () => {
      active = false;
    };
  }, []);

  // Geolocation polling
  const pollLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Geolocation unavailable:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      pollLocation();
    }, 0);

    let timer: NodeJS.Timeout | null = null;
    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          pollLocation();
        }
      }, 5 * 60 * 1000);
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollLocation();
        startTimer();
      } else {
        stopTimer();
      }
    };

    if (document.visibilityState === 'visible') {
      startTimer();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(initialTimer);
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollLocation]);

  // Compute distances and sort by chosen ranking mode
  const rankedCentres = useMemo(() => {
    const listWithDistance = centres.map((c) => {
      let distanceKm: number | null = null;
      let walkMins: number | null = null;

      if (c.lat && c.lng && userLocation.lat && userLocation.lng) {
        distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
        walkMins = Math.max(1, Math.round(distanceKm * 15));
      }

      return {
        ...c,
        distanceKm,
        walkMins,
      };
    });

    return listWithDistance.sort((a, b) => {
      if (rankingMode === 'rating') {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (Math.abs(ratingDiff) > 0.01) return ratingDiff;
        return (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999);
      }

      const distA = a.distanceKm ?? 999999;
      const distB = b.distanceKm ?? 999999;
      return distA - distB;
    });
  }, [centres, userLocation, rankingMode]);

  // Filter centres if Aircon filter is enabled
  const filteredCentres = useMemo(() => {
    if (!airconOnly) return rankedCentres;
    return rankedCentres.filter((c) => Boolean(c.hasAircon));
  }, [rankedCentres, airconOnly]);

  const handleSelectCentre = useCallback((c: HawkerCentreSummary) => {
    setSelectedCentreId(c.id);
  }, []);

  // Gesture handling for mobile swipe-up / swipe-down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Swiping UP: expand bottom sheet
    if (!isExpanded && deltaY < -20) {
      setIsExpanded(true);
      touchStartY.current = null;
    }
    // Swiping DOWN: collapse bottom sheet (only when scroll position is at the top)
    else if (
      isExpanded &&
      deltaY > 25 &&
      (!sheetContentRef.current || sheetContentRef.current.scrollTop <= 5)
    ) {
      setIsExpanded(false);
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white">
      {/* 1. Full-Screen Interactive Black & White Map (0 borders, 0 watermarks) */}
      <HawkerMap
        fullScreen={true}
        userLocation={userLocation}
        centres={filteredCentres}
        selectedCentreId={selectedCentreId}
        onSelectCentre={handleSelectCentre}
      />

      {/* 2. Floating Top Controls (Mobile-First, no Table 04 button) */}
      <div className="fixed top-3.5 inset-x-3.5 sm:inset-x-4 max-w-lg mx-auto z-20 flex items-center justify-between pointer-events-none">
        {/* Quick Aircon Filter Pill (White when unactive, Black when active, h-11, 0 border) */}
        <button
          type="button"
          onClick={() => setAirconOnly((prev) => !prev)}
          className={`pointer-events-auto flex h-11 items-center gap-2 rounded-full px-5 text-xs font-semibold shadow-md transition-colors active:scale-95 ${
            airconOnly
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Snowflake className="h-4 w-4" />
          <span>Aircon</span>
        </button>

        {/* Quick Scan QR Button (White, h-11, 0 border) */}
        <Link
          href="/scan"
          title="Scan QR"
          aria-label="Scan table QR code"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-neutral-100 active:scale-95 transition-colors"
        >
          <QrCode className="h-4 w-4" />
        </Link>
      </div>

      {/* 3. Mobile-First Bottom Sheet List (Answers Swipe Up, Fills Bottom Width, 0 Borders) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed inset-x-0 bottom-0 z-30 w-full rounded-t-[28px] bg-white text-black shadow-[0_-12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'h-[80vh]' : 'h-36 pb-16'
        }`}
      >
        {/* Pull Handle & Header Bar */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full shrink-0 px-4 pt-3 pb-2 cursor-pointer select-none"
        >
          {/* Pull Indicator Pill */}
          <div className="mx-auto h-1 w-10 rounded-full bg-neutral-300 mb-3" />

          {/* Controls Row: Venue Count & Guideline-Compliant h-11 Distance/Rating Toggles */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">
                {filteredCentres.length} {filteredCentres.length === 1 ? 'centre' : 'centres'}
              </span>
              <button
                type="button"
                className="text-neutral-400 hover:text-black transition-colors"
                aria-label={isExpanded ? 'Collapse list' : 'Expand list'}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>

            {/* Distance & Rating Toggles: Strictly h-11 (44px) Apple Guideline, Rounded-Full, 0 Border */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-neutral-100 p-1 rounded-full shrink-0"
            >
              <button
                type="button"
                onClick={() => setRankingMode('distance')}
                className={`flex h-11 items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors ${
                  rankingMode === 'distance'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-black hover:bg-neutral-50'
                }`}
              >
                Distance
              </button>
              <button
                type="button"
                onClick={() => setRankingMode('rating')}
                className={`flex h-11 items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors ${
                  rankingMode === 'rating'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-black hover:bg-neutral-50'
                }`}
              >
                Rating
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Hawker Centres List (Full Bottom Width, 0 Borders, Pure Black/White) */}
        <div
          ref={sheetContentRef}
          className="flex-1 overflow-y-auto px-4 pb-20 pt-2 space-y-3"
        >
          {filteredCentres.map((centre) => {
            const isSelected = centre.id === selectedCentreId;

            return (
              <div
                key={centre.id}
                onClick={() => {
                  setSelectedCentreId(centre.id);
                  if (centre.lat && centre.lng) {
                    setUserLocation({ lat: centre.lat, lng: centre.lng });
                  }
                }}
                className={`w-full rounded-2xl p-4 text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-neutral-100' : 'bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-black truncate">{centre.name}</h4>
                      {centre.hasAircon && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black shrink-0">
                          <Snowflake className="h-3 w-3" />
                          <span>Aircon</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 truncate">{centre.address}</p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                      <span className="flex items-center gap-0.5 font-semibold text-black">
                        <Star className="h-3 w-3 fill-black text-black" />
                        <span>{centre.rating.toFixed(1)}</span>
                      </span>
                      <span>•</span>
                      <span>{centre.stallsCount} stalls</span>
                      {centre.distanceKm !== null && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-black">{centre.distanceKm} km</span>
                          {centre.walkMins !== null && (
                            <span className="text-neutral-400">({centre.walkMins}m walk)</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Link: Strictly h-11, Pure Black, 0 Border */}
                  <Link
                    href={`/stall?centre=${encodeURIComponent(centre.slug)}` as any}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-11 px-4 items-center justify-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs shrink-0 active:scale-95 transition-all"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
