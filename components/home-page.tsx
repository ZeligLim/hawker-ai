'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Locate, MapPin, Navigation, Search, Sparkles, Store, Utensils } from 'lucide-react';
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
  const [locationName, setLocationName] = useState('Chinatown, Kuala Lumpur');
  const [isLocating, setIsLocating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'popular'>('all');

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

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationName('Your Current GPS Location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Calculate distance & sort by proximity
  const centresWithDistance = useMemo(() => {
    return centres.map((c) => {
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
    });
  }, [centres, userLocation]);

  // Filtered and sorted centres list
  const filteredCentres = useMemo(() => {
    let list = centresWithDistance;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (activeFilter === 'nearby') {
      list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (activeFilter === 'popular') {
      list = [...list].sort((a, b) => b.stallsCount - a.stallsCount);
    } else {
      list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return list;
  }, [centresWithDistance, searchQuery, activeFilter]);

  const scrollToMapAndSelect = (c: HawkerCentreSummary) => {
    setSelectedCentreId(c.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] pb-32 text-[#1d1d1f]">
      {/* Top Header */}
      <div className="bg-white border-b border-black/5">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#1d1d1f]">
                  Nearby Hawker Centres
                </h1>
                <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  Live Map
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#6e6e73]">
                Discover authentic Malaysian food halls around you. Select a centre to browse stalls and order to your table.
              </p>
            </div>

            {/* Geolocation Detection Pill */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] border border-black/5 px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/5 transition-colors self-start sm:self-auto"
            >
              <Locate className={`h-3.5 w-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="truncate max-w-[180px]">{locationName}</span>
              <span className="text-[10px] text-blue-600 underline ml-0.5">Detect GPS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hawker centre name, area, or dishes (e.g. 888, Curry Mee, Lim)…"
            className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-sm font-medium text-[#1d1d1f] placeholder-[#86868b] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/5 outline-none focus:border-black/20 transition-all"
          />
        </div>

        {/* Interactive Map Component */}
        <section aria-label="Hawker Centres Map" className="w-full">
          <HawkerMap
            userLocation={userLocation}
            centres={centres}
            selectedCentreId={selectedCentreId}
            onSelectCentre={(c) => setSelectedCentreId(c.id)}
          />
        </section>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all ${
              activeFilter === 'all'
                ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                : 'border-black/5 bg-white text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            All Centres ({centres.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('nearby')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all ${
              activeFilter === 'nearby'
                ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                : 'border-black/5 bg-white text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Closest First
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('popular')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all ${
              activeFilter === 'popular'
                ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                : 'border-black/5 bg-white text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Most Stalls
          </button>
        </div>

        {/* Nearby Centres Listing */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1d1d1f]">
              Hawker Centres Directory
            </h2>
            <span className="text-xs text-[#6e6e73]">
              {filteredCentres.length} {filteredCentres.length === 1 ? 'location' : 'locations'}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-[24px] bg-white animate-pulse border border-black/5" />
              ))}
            </div>
          ) : filteredCentres.length === 0 ? (
            <div className="rounded-[24px] bg-white p-8 text-center border border-black/5 shadow-sm">
              <Store className="mx-auto h-8 w-8 text-[#9ca3af]" />
              <p className="mt-3 text-sm font-semibold text-[#1d1d1f]">No hawker centres found</p>
              <p className="mt-1 text-xs text-[#6e6e73]">Try adjusting your search query.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCentres.map((centre) => {
                const isSelected = centre.id === selectedCentreId;

                return (
                  <article
                    key={centre.id}
                    className={`rounded-[24px] bg-white p-4 sm:p-5 border transition-all shadow-[0_4px_16px_rgba(0,0,0,0.02)] ${
                      isSelected
                        ? 'border-[#111827] ring-1 ring-[#111827]'
                        : 'border-black/5 hover:border-black/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                            {centre.name}
                          </h3>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Open
                          </span>
                        </div>

                        <p className="mt-1 flex items-center gap-1 text-xs text-[#6e6e73]">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span className="line-clamp-1">{centre.address}</span>
                        </p>
                      </div>

                      {/* Distance Badge */}
                      {centre.distanceKm !== null && (
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
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

                    {/* Stats & Info */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-[#6e6e73]">
                      <span className="font-semibold text-[#1d1d1f] flex items-center gap-1">
                        <Store className="h-3.5 w-3.5 text-amber-600" />
                        {centre.stallsCount} Food Stalls
                      </span>
                      <span>•</span>
                      <span>{centre.dishesCount} Menu Dishes</span>
                    </div>

                    {/* Specialties Tags */}
                    {centre.specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {centre.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[10px] font-medium text-[#6e6e73]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-black/5">
                      <button
                        type="button"
                        onClick={() => scrollToMapAndSelect(centre)}
                        className="w-1/2 rounded-full bg-[#f5f5f7] py-2.5 text-xs font-bold text-[#1d1d1f] hover:bg-black/5 transition-colors"
                      >
                        Locate on Map
                      </button>

                      <Link
                        href={`/stall?centre=${encodeURIComponent(centre.slug)}` as any}
                        className="w-1/2 flex items-center justify-center gap-1.5 rounded-full bg-[#111827] py-2.5 text-xs font-bold text-white hover:bg-black transition-colors shadow-sm"
                      >
                        <span>Enter & Order</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
