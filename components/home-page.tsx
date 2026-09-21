'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
 ArrowRight,
 MapPin,
 QrCode,
 Snowflake,
 Star,
 Store,
 X,
} from 'lucide-react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { HawkerMap } from '@/components/hawker-map';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';

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
 return Math.round(R * c * 10) / 10;
}

export function HomePage() {
 const router = useRouter();

 // Search, filter, ranking states
 const [searchQuery, setSearchQuery] = useState('');
 const [airconOnly, setAirconOnly] = useState(false);
 const [rankingMode, setRankingMode] = useState<'distance' | 'rating'>('distance');
 const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

 // Centres and selected centre
 const [centres, setCentres] = useState<HawkerCentreSummary[]>([]);
 const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);

 // User location: defaults to Kuala Lumpur Chinatown
 const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
 lat: 3.1440,
 lng: 101.6990,
 });

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

 // Filter centres if Aircon filter or search query is active
 const filteredCentres = useMemo(() => {
 let list = rankedCentres;
 if (airconOnly) {
 list = list.filter((c) => Boolean(c.hasAircon));
 }
 if (searchQuery.trim()) {
 const q = searchQuery.toLowerCase().trim();
 list = list.filter(
 (c) =>
 c.name.toLowerCase().includes(q) ||
 c.address.toLowerCase().includes(q) ||
 c.slug.toLowerCase().includes(q)
 );
 }
 return list;
 }, [rankedCentres, airconOnly, searchQuery]);

 // Find the currently selected centre
 const selectedCentre = useMemo(
 () => filteredCentres.find((c) => c.id === selectedCentreId) ?? null,
 [filteredCentres, selectedCentreId]
 );

 const handleSelectCentre = useCallback((c: HawkerCentreSummary) => {
 setSelectedCentreId(c.id);
 }, []);

 return (
 <div className={`fixed inset-0 w-screen h-screen overflow-hidden text-black ${viewMode === 'list' ? 'bg-[#f5f5f7]' : 'bg-white'}`}>
 {/* 1. Prominent Top Section: Search Bar & View Mode / Filter Switchers (No Resume Button, 0 Borders) */}
 <div className="fixed top-3.5 inset-x-3.5 sm:inset-x-4 max-w-lg mx-auto z-40 flex flex-col gap-2 pointer-events-auto">
 <HawkerSearchBar
 value={searchQuery}
 onChange={setSearchQuery}
 placeholder="Search hawker centres..."
 onSubmit={(e) => {
 e.preventDefault();
 // Just dismiss keyboard on submit, filtering is already real-time
 if (document.activeElement instanceof HTMLElement) {
 document.activeElement.blur();
 }
 }}
 className="rounded-full shadow-md"
 />

 {/* View Switcher Segmented Control & Quick Actions */}
 <div className="flex items-center justify-between gap-2">
 {/* Map vs List View Segmented Pill (Standard Apple touch target, pure white & black, 0 ) */}
 <div className="flex items-center bg-white p-1 rounded-full shadow-md">
 <button
 type="button"
 onClick={() => setViewMode('map')}
 className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold ${
 viewMode === 'map'
 ? 'bg-black text-white shadow-xs'
 : 'bg-transparent text-black hover:bg-neutral-100'
 }`}
 >
 <MapPin className="h-3.5 w-3.5" />
 <span>Map</span>
 </button>
 <button
 type="button"
 onClick={() => setViewMode('list')}
 className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold ${
 viewMode === 'list'
 ? 'bg-black text-white shadow-xs'
 : 'bg-transparent text-black hover:bg-neutral-100'
 }`}
 >
 <Store className="h-3.5 w-3.5" />
 <span>List</span>
 </button>
 </div>

 <div className="flex items-center gap-2">
 {/* Quick Aircon Filter Pill (Pure White inactive, Pure Black active, h-11, 0 ) */}
 <button
 type="button"
 onClick={() => setAirconOnly((prev) => !prev)}
 className={`flex h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold shadow-md ${
 airconOnly
 ? 'bg-black text-white'
 : 'bg-white text-black hover:bg-neutral-100'
 }`}
 >
 <Snowflake className="h-4 w-4" />
 <span>Aircon</span>
 </button>

 {/* Quick Scan QR Button (Standard 44px h-11, 0 ) */}
 <Link
 href="/scan"
 title="Scan QR"
 aria-label="Scan table QR code"
 className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-neutral-100 "
 >
 <QrCode className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </div>

 {/* 2. Main Content: Map View or List View */}
 {viewMode === 'map' ? (
 <>
 {/* Interactive Standard OpenStreetMap (0 borders, 0 watermarks) */}
 <HawkerMap
 fullScreen={true}
 userLocation={userLocation}
 centres={filteredCentres}
 selectedCentreId={selectedCentreId}
 onSelectCentre={handleSelectCentre}
 />

 {/* Floating Selected Shop Card (Only shown when a shop is selected) */}
 {selectedCentre && (
 <div className="fixed bottom-20 inset-x-3.5 sm:inset-x-4 max-w-md mx-auto z-40 pointer-events-auto">
 <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-2xl text-black">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-black truncate">{selectedCentre.name}</h3>
 {selectedCentre.hasAircon && (
 <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black shrink-0">
 <Snowflake className="h-3 w-3" />
 <span>Aircon</span>
 </span>
 )}
 </div>
 <p className="mt-1 text-xs text-neutral-500 line-clamp-1">{selectedCentre.address}</p>

 <div className="mt-2.5 flex items-center gap-2 text-xs text-neutral-600">
 <span className="flex items-center gap-0.5 font-bold text-black">
 <Star className="h-3.5 w-3.5 fill-black text-black" />
 <span>{selectedCentre.rating.toFixed(1)}</span>
 </span>
 <span>•</span>
 <span>{selectedCentre.stallsCount} stalls</span>
 {selectedCentre.distanceKm !== null && (
 <>
 <span>•</span>
 <span className="font-semibold text-black">{selectedCentre.distanceKm} km</span>
 {selectedCentre.walkMins !== null && (
 <span className="text-neutral-400">({selectedCentre.walkMins}m walk)</span>
 )}
 </>
 )}
 </div>
 </div>

 {/* Dismiss Selection */}
 <button
 type="button"
 onClick={() => setSelectedCentreId(null)}
 className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 shrink-0"
 aria-label="Close card"
 >
 <X className="h-4 w-4" />
 </button>
 </div>

 <div className="mt-4">
 <Link
 href={`/stall?centre=${encodeURIComponent(selectedCentre.slug)}` as any}
 className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs "
 >
 <span>View Stalls</span>
 <ArrowRight className="h-3.5 w-3.5" />
 </Link>
 </div>
 </div>
 </div>
 )}
 </>
 ) : (
 /* Full-Screen List View (Only shown when toggled to List view) */
 <div className="h-full w-full overflow-y-auto pt-32 pb-28 px-4 max-w-lg mx-auto">
 {/* List View Subheader: Count & Distance/Rating Sort Controls */}
 <div className="mb-4 flex items-center justify-between gap-3 px-1">
 {/* Distance & Rating Toggles: Styled exactly like the Map/List switcher */}
 <div className="flex items-center bg-white p-1 rounded-full shadow-md shrink-0">
 <button
 type="button"
 onClick={() => setRankingMode('distance')}
 className={`flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold ${
 rankingMode === 'distance'
 ? 'bg-black text-white shadow-xs'
 : 'bg-transparent text-black hover:bg-neutral-100'
 }`}
 >
 Distance
 </button>
 <button
 type="button"
 onClick={() => setRankingMode('rating')}
 className={`flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold ${
 rankingMode === 'rating'
 ? 'bg-black text-white shadow-xs'
 : 'bg-transparent text-black hover:bg-neutral-100'
 }`}
 >
 Rating
 </button>
 </div>

 <span className="text-sm font-bold text-black text-right">
 {filteredCentres.length} {filteredCentres.length === 1 ? 'centre' : 'centres'} found
 </span>
 </div>

 {/* Clean Vertical Feed of Hawker Centres */}
 <div className="space-y-3">
 {filteredCentres.length === 0 ? (
 <div className="py-16 text-center text-sm text-neutral-500">
 No hawker centres found matching your search.
 </div>
 ) : (
 filteredCentres.map((centre) => (
 <Link
 key={centre.id}
 href={`/stall?centre=${encodeURIComponent(centre.slug)}` as any}
 className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm hover:bg-neutral-50 "
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <h4 className="text-base font-bold text-black truncate">{centre.name}</h4>
 {centre.hasAircon && (
 <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black shrink-0">
 <Snowflake className="h-3 w-3" />
 <span className="sr-only">Aircon</span>
 </span>
 )}
 </div>
 
 <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-neutral-600">
 <span className="flex items-center gap-0.5 text-black">
 <Star className="h-3.5 w-3.5 fill-black" />
 <span>{centre.rating.toFixed(1)}</span>
 </span>
 <span className="h-1 w-1 rounded-full bg-neutral-300" />
 <span>{centre.stallsCount} stalls</span>
 {centre.distanceKm !== null && (
 <>
 <span className="h-1 w-1 rounded-full bg-neutral-300" />
 <span className="text-black">{centre.distanceKm} km</span>
 </>
 )}
 </div>
 </div>

 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black shrink-0 self-center">
 <ArrowRight className="h-4 w-4" />
 </div>
 </div>
 </Link>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 );
}
