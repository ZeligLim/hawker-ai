'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Locate,
  MapPin,
  Navigation,
  Search,
  Snowflake,
  Star,
  Store,
  Wind,
  X,
  QrCode,
} from 'lucide-react';
import { HawkerMap } from '@/components/hawker-map';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';
import { getStoredTableSession, type CurrentTableSession } from '@/lib/table-session';

type RankingMode = 'distance' | 'rating';

// Haversine formula to calculate geographic distance in kilometres
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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
        console.warn('Geolocation unavailable / denied:', err.message);
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
        // Tie-breaker: distance
        return (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999);
      }

      // Default: distance ranking
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

    // If scrolling upwards from collapsed state, expand
    if (!isExpanded && deltaY < -25) {
      setIsExpanded(true);
      touchStartY.current = null;
    }
    // If pulling down when list is at top, collapse
    else if (isExpanded && deltaY > 35 && listContainerRef.current?.scrollTop === 0) {
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#f4f4f6]">
      {/* 1. Full-Screen Interactive Map */}
      <HawkerMap
        fullScreen={true}
        userLocation={userLocation}
        centres={filteredCentres}
        selectedCentreId={selectedCentreId}
        onSelectCentre={handleSelectCentre}
      />

      {/* 2. Floating Top Search & Header Bar */}
      <div className="fixed top-4 inset-x-4 max-w-md mx-auto z-20 flex flex-col gap-2">
        {/* Active Table Session Banner Shortcut */}
        {tableSession?.tableNumber && (
          <Link
            href={
              tableSession.centreSlug
                ? (`/${tableSession.centreSlug}/home` as any)
                : ('/home' as any)
            }
            className="flex items-center justify-between rounded-full bg-[#111827]/95 backdrop-blur-md px-3.5 py-1.5 text-xs text-white shadow-lg border border-white/10 hover:bg-black transition-all animate-fade-in"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold truncate">
                Active Table {tableSession.tableNumber}
                {tableSession.centreName ? ` • ${tableSession.centreName}` : ''}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-300 underline shrink-0 ml-2">
              Resume Order →
            </span>
          </Link>
        )}

        {/* Floating Search Pill */}
        <div className="relative flex items-center rounded-full bg-white/95 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-black/10 transition-all focus-within:ring-2 focus-within:ring-[#111827]">
          <Search className="absolute left-3.5 h-4 w-4 text-[#86868b] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hawker centre or food..."
            className="w-full h-11 pl-10 pr-20 bg-transparent text-sm font-medium text-[#1d1d1f] placeholder-[#86868b] outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => pollLocation()}
                disabled={isLocating}
                title="Recenter GPS location"
                aria-label="Recenter GPS location"
                className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            )}

            <Link
              href="/scan"
              title="Scan Table QR Code"
              aria-label="Scan Table QR Code"
              className="p-1.5 rounded-full text-[#1d1d1f] hover:bg-black/5 transition-colors"
            >
              <QrCode className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Swipe-Up Bottom Sheet Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-2xl rounded-t-[28px] bg-white/95 backdrop-blur-2xl border-t border-black/10 shadow-[0_-12px_36px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'h-[80vh] sm:h-[82vh]' : 'h-[160px] sm:h-[168px]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sheet Drag Handle & Controls Bar */}
        <div className="pt-2.5 pb-2 px-4 sm:px-5 shrink-0 border-b border-black/5 select-none">
          {/* Pull Handle Bar */}
          <div
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full flex justify-center py-1 cursor-pointer group"
          >
            <div className="h-1.5 w-12 rounded-full bg-black/25 group-hover:bg-black/40 transition-colors" />
          </div>

          {/* Row 1: Title, Count, and Ranking Mode Segmented Toggle */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
                Hawker Centres
              </h2>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-[#6e6e73]">
                {filteredCentres.length}
              </span>
            </div>

            {/* Ranking Mode Segmented Control: Rating vs Distance */}
            <div className="flex items-center bg-black/[0.06] p-0.5 rounded-full text-xs font-medium">
              <button
                type="button"
                onClick={() => setRankingMode('distance')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  rankingMode === 'distance'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
                title="Rank by shortest distance"
              >
                <Navigation className="h-3 w-3" />
                <span>Distance</span>
              </button>

              <button
                type="button"
                onClick={() => setRankingMode('rating')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  rankingMode === 'rating'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
                title="Rank by highest customer rating"
              >
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>Rating</span>
              </button>
            </div>
          </div>

          {/* Row 2: Aircon Filter Chip & Summary or Expand Toggle */}
          <div className="mt-2 flex items-center justify-between gap-2">
            {/* Aircon Quick Toggle Filter */}
            <button
              type="button"
              onClick={() => setAirconOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-all ${
                airconOnly
                  ? 'bg-cyan-500 text-white border-cyan-600 shadow-xs'
                  : 'bg-white text-[#6e6e73] border-black/10 hover:border-black/20'
              }`}
            >
              <Snowflake className={`h-3 w-3 ${airconOnly ? 'text-white' : 'text-cyan-600'}`} />
              <span>Aircon Only</span>
            </button>

            {/* Closest/Top Rated Summary Pill or Expand/Collapse */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-semibold text-[#1d1d1f] hover:text-black py-0.5 px-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <span className="truncate max-w-[170px] sm:max-w-xs text-[11px] text-[#6e6e73]">
                {isExpanded
                  ? 'Collapse List'
                  : topRankedCentre
                    ? rankingMode === 'distance'
                      ? `Nearest: ${topRankedCentre.name}`
                      : `Top Rated: ${topRankedCentre.name} (★${topRankedCentre.rating})`
                    : 'Pull up to view'}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-[#1d1d1f]" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5 text-[#1d1d1f]" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Hawker Centre Cards List */}
        <div
          ref={listContainerRef}
          className={`flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-3 ${
            isExpanded ? 'block' : 'hidden'
          }`}
        >
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-[22px] bg-black/5 animate-pulse" />
              ))}
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="rounded-[22px] bg-black/[0.03] p-8 text-center border border-black/5">
              <Store className="mx-auto h-8 w-8 text-[#9ca3af]" />
              <p className="mt-2 text-sm font-semibold text-[#1d1d1f]">No hawker centres found</p>
              <p className="mt-1 text-xs text-[#6e6e73]">
                Try adjusting your search query or turning off the aircon filter.
              </p>
              {(searchQuery || airconOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setAirconOnly(false);
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#111827] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            filteredCentres.map((centre, index) => {
              const isSelected = centre.id === selectedCentreId;
              const rankNumber = index + 1;

              return (
                <article
                  key={centre.id}
                  onClick={() => setSelectedCentreId(centre.id)}
                  className={`rounded-[22px] p-4 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-black/[0.02] border-[#111827] ring-1 ring-[#111827]'
                      : 'bg-white border-black/10 hover:border-black/20 shadow-xs'
                  }`}
                >
                  {/* Card Header: Rank, Name, Aircon Badge, Open Tag, Rating/Distance */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        {/* Rank Badge */}
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-[10px] font-bold text-white shrink-0">
                          {rankNumber}
                        </span>

                        <h3 className="text-base font-bold text-[#1d1d1f] truncate">
                          {centre.name}
                        </h3>

                        {/* Aircon Indicator Badge */}
                        {centre.hasAircon ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-200/90 px-2 py-0.5 text-[10px] font-bold text-cyan-800 shrink-0"
                            title="Air-Conditioned Indoor Dining"
                          >
                            <Snowflake className="h-3 w-3 text-cyan-600" />
                            <span>Aircon</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-[#6e6e73] shrink-0"
                            title="Naturally Ventilated / Open-Air Dining"
                          >
                            <Wind className="h-3 w-3 text-stone-500" />
                            <span>Open-Air</span>
                          </span>
                        )}

                        <span className="rounded-full bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                          Open
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-xs text-[#6e6e73] truncate">
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{centre.address}</span>
                      </p>
                    </div>

                    {/* Primary Ranking Highlight Metric (Distance or Rating) */}
                    <div className="text-right shrink-0 flex flex-col items-end">
                      {rankingMode === 'distance' && centre.distanceKm !== null ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                            <Navigation className="h-3 w-3" />
                            {centre.distanceKm < 1
                              ? `${Math.round(centre.distanceKm * 1000)} m`
                              : `${centre.distanceKm} km`}
                          </span>
                          {centre.walkMins && (
                            <span className="mt-0.5 text-[10px] text-[#6e6e73]">
                              ~{centre.walkMins} min walk
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ★ {centre.rating.toFixed(1)}
                          </span>
                          {centre.distanceKm !== null && (
                            <span className="mt-0.5 text-[10px] text-[#6e6e73]">
                              {centre.distanceKm < 1
                                ? `${Math.round(centre.distanceKm * 1000)} m`
                                : `${centre.distanceKm} km`}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Food Specialties Tags */}
                  {centre.specialties.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {centre.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-[#6e6e73] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: Stalls Count & Actions */}
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-black/5">
                    <span className="text-xs text-[#6e6e73] font-medium flex items-center gap-1">
                      <Store className="h-3.5 w-3.5 text-amber-600" />
                      {centre.stallsCount} Food Stalls • ★ {centre.rating.toFixed(1)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCentreId(centre.id);
                        }}
                        className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/10 transition-colors"
                      >
                        Locate
                      </button>

                      <Link
                        href={`/${centre.slug}/home` as any}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-black transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Enter & Order</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
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
