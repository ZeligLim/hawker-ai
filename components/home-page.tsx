'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Locate,
  QrCode,
  Search,
  Snowflake,
  Star,
  Store,
  X,
} from 'lucide-react';
import { HawkerMap } from '@/components/hawker-map';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';
import { getStoredTableSession, type CurrentTableSession } from '@/lib/table-session';

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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingMode, setRankingMode] = useState<RankingMode>('distance');
  const [airconOnly, setAirconOnly] = useState(false);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [tableSession, setTableSession] = useState<CurrentTableSession | null>(null);

  // Default coordinate: Kuala Lumpur City Centre
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 3.1440,
    lng: 101.6990,
  });

  // Touch gesture tracking for bottom sheet swipe-up / swipe-down
  const touchStartY = useRef<number | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Check for active table session
  useEffect(() => {
    try {
      const session = getStoredTableSession();
      if (session?.tableNumber) {
        const timeout = setTimeout(() => {
          setTableSession(session);
        }, 0);
        return () => clearTimeout(timeout);
      }
    } catch {
      // ignore table session read error
    }
  }, []);

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
      } finally {
        if (active) setIsLoading(false);
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
        console.warn('Geolocation unavailable:', err.message);
        setIsLocating(false);
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

  // Apply search query and aircon filter
  const filteredCentres = useMemo(() => {
    let result = rankedCentres;

    if (airconOnly) {
      result = result.filter((c) => Boolean(c.hasAircon));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [rankedCentres, searchQuery, airconOnly]);

  const topRankedCentre = filteredCentres[0] ?? null;

  // Touch gesture handlers for swipe up/down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (!isExpanded && deltaY < -25) {
      setIsExpanded(true);
      touchStartY.current = null;
    } else if (isExpanded && deltaY > 35 && listContainerRef.current?.scrollTop === 0) {
      setIsExpanded(false);
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleSelectCentre = (centre: HawkerCentreSummary) => {
    setSelectedCentreId(centre.id);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#f5f5f7]">
      {/* 1. Full-Screen Interactive Map */}
      <HawkerMap
        fullScreen={true}
        userLocation={userLocation}
        centres={filteredCentres}
        selectedCentreId={selectedCentreId}
        onSelectCentre={handleSelectCentre}
      />

      {/* 2. Floating Top Search & Quick Actions Bar */}
      <div className="fixed top-3.5 inset-x-3.5 sm:inset-x-4 max-w-lg mx-auto z-20 flex flex-col gap-2">
        {/* Active Table Session Banner */}
        {tableSession?.tableNumber && (
          <Link
            href={
              tableSession.centreSlug
                ? (`/${tableSession.centreSlug}/home` as any)
                : ('/home' as any)
            }
            className="flex items-center justify-between rounded-full bg-[#1d1d1f]/90 backdrop-blur-xl px-3.5 py-1.5 text-xs text-white shadow-xs border border-white/10 hover:bg-black transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-medium truncate">
                Table {tableSession.tableNumber}
                {tableSession.centreName ? ` • ${tableSession.centreName}` : ''}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-300 shrink-0 ml-2">
              Resume →
            </span>
          </Link>
        )}

        {/* Minimal Search Pill */}
        <div className="relative flex items-center h-11 rounded-full bg-white/90 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/[0.08] focus-within:border-black/20 transition-all">
          <Search className="absolute left-3.5 h-4 w-4 text-[#86868b] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hawker centres"
            className="w-full h-full pl-10 pr-20 bg-transparent text-sm text-[#1d1d1f] placeholder-[#86868b] outline-none font-normal"
          />

          <div className="absolute right-2 flex items-center gap-0.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => pollLocation()}
                disabled={isLocating}
                title="Recenter location"
                aria-label="Recenter location"
                className="p-1.5 rounded-full text-[#0071e3] hover:bg-blue-50/60 transition-colors"
              >
                <Locate className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            )}

            <Link
              href="/scan"
              title="Scan QR"
              aria-label="Scan QR"
              className="p-1.5 rounded-full text-[#1d1d1f] hover:bg-black/5 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Swipe-Up Bottom Sheet Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-xl rounded-t-3xl bg-white/90 backdrop-blur-2xl border-t border-black/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'h-[76vh] sm:h-[78vh]' : 'h-[124px]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull Handle */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full flex justify-center pt-2.5 pb-1.5 cursor-pointer group select-none"
        >
          <div className="h-1 w-9 rounded-full bg-black/20 group-hover:bg-black/35 transition-colors" />
        </div>

        {/* Minimal Unified Header Bar */}
        <div className="px-4 pb-2 flex items-center justify-between gap-2 border-b border-black/[0.04] select-none">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">
              Hawker centres
            </h2>
            <span className="text-xs text-[#86868b] font-normal">
              ({filteredCentres.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Segmented Ranking Toggle */}
            <div className="flex items-center bg-black/[0.05] p-0.5 rounded-full text-xs font-medium">
              <button
                type="button"
                onClick={() => setRankingMode('distance')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all ${
                  rankingMode === 'distance'
                    ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                Distance
              </button>

              <button
                type="button"
                onClick={() => setRankingMode('rating')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all ${
                  rankingMode === 'rating'
                    ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                Rating
              </button>
            </div>

            {/* Aircon Quick Filter Button */}
            <button
              type="button"
              onClick={() => setAirconOnly((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded-full border transition-all ${
                airconOnly
                  ? 'bg-cyan-600 text-white border-cyan-600 font-semibold shadow-xs'
                  : 'bg-transparent text-[#86868b] border-black/[0.08] hover:text-[#1d1d1f]'
              }`}
            >
              <Snowflake className="h-3 w-3" />
              <span>Aircon</span>
            </button>

            {/* Expand / Collapse Chevron */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsed Peek Summary */}
        {!isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2.5 flex items-center justify-between text-xs text-[#86868b] cursor-pointer hover:bg-black/[0.01] transition-colors"
          >
            <span className="truncate max-w-[280px]">
              {topRankedCentre
                ? rankingMode === 'distance'
                  ? `${topRankedCentre.name} • ${
                      topRankedCentre.distanceKm !== null
                        ? topRankedCentre.distanceKm < 1
                          ? `${Math.round(topRankedCentre.distanceKm * 1000)} m`
                          : `${topRankedCentre.distanceKm} km`
                        : 'Nearest'
                    }`
                  : `${topRankedCentre.name} • ★ ${topRankedCentre.rating.toFixed(1)}`
                : 'Swipe up to explore'}
            </span>
            <span className="text-[11px] font-semibold text-[#1d1d1f] flex items-center gap-0.5 shrink-0 ml-2">
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}

        {/* Scrollable Hawker Centre Cards List */}
        <div
          ref={listContainerRef}
          className={`flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-2.5 ${
            isExpanded ? 'block' : 'hidden'
          }`}
        >
          {isLoading ? (
            <div className="space-y-2.5 py-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="rounded-2xl bg-black/[0.02] p-8 text-center border border-black/[0.04]">
              <Store className="mx-auto h-7 w-7 text-[#86868b]" />
              <p className="mt-2 text-sm font-semibold text-[#1d1d1f]">No hawker centres found</p>
              <p className="mt-1 text-xs text-[#86868b]">
                Try adjusting your search or filters.
              </p>
              {(searchQuery || airconOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setAirconOnly(false);
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] px-3 py-1 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            filteredCentres.map((centre, index) => {
              const isSelected = centre.id === selectedCentreId;
              const rankNumber = index + 1;

              return (
                <Link
                  key={centre.id}
                  href={`/${centre.slug}/home` as any}
                  onClick={() => setSelectedCentreId(centre.id)}
                  className={`block rounded-2xl p-3.5 bg-white border transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#1d1d1f] ring-1 ring-[#1d1d1f] shadow-xs'
                      : 'border-black/[0.06] hover:border-black/20 shadow-xs'
                  }`}
                >
                  {/* Top Row: Rank, Name, Aircon Badge, Open Tag, Primary Metric */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/[0.05] text-[10px] font-semibold text-[#1d1d1f] shrink-0">
                          {rankNumber}
                        </span>

                        <h3 className="text-sm font-semibold text-[#1d1d1f] truncate">
                          {centre.name}
                        </h3>

                        {centre.hasAircon && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full bg-cyan-50 border border-cyan-200/80 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-800 shrink-0"
                            title="Aircon"
                          >
                            <Snowflake className="h-2.5 w-2.5 text-cyan-600" />
                            <span>Aircon</span>
                          </span>
                        )}

                        <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 text-[9px] font-medium text-emerald-800 shrink-0">
                          Open
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#86868b] truncate">
                        {centre.address}
                      </p>
                    </div>

                    {/* Metric Column */}
                    <div className="text-right shrink-0 flex flex-col items-end">
                      {rankingMode === 'distance' && centre.distanceKm !== null ? (
                        <>
                          <span className="text-xs font-semibold text-[#0071e3]">
                            {centre.distanceKm < 1
                              ? `${Math.round(centre.distanceKm * 1000)} m`
                              : `${centre.distanceKm} km`}
                          </span>
                          {centre.walkMins && (
                            <span className="text-[10px] text-[#86868b]">
                              ~{centre.walkMins} min walk
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-amber-700 flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {centre.rating.toFixed(1)}
                          </span>
                          {centre.distanceKm !== null && (
                            <span className="text-[10px] text-[#86868b]">
                              {centre.distanceKm < 1
                                ? `${Math.round(centre.distanceKm * 1000)} m`
                                : `${centre.distanceKm} km`}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Stalls count & Arrow */}
                  <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#86868b]">
                    <span className="flex items-center gap-1">
                      <Store className="h-3.5 w-3.5 text-[#86868b]" />
                      <span>{centre.stallsCount} stalls</span>
                      {centre.specialties.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[180px] sm:max-w-xs">
                            {centre.specialties.slice(0, 3).join(', ')}
                          </span>
                        </>
                      )}
                    </span>

                    <div className="flex items-center gap-0.5 text-[#1d1d1f] font-medium text-[11px]">
                      <span>View</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#86868b]" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
