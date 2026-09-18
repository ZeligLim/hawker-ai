'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Locate, Minus, Plus, Snowflake, Star, Store } from 'lucide-react';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';

interface HawkerMapProps {
  userLocation: { lat: number; lng: number };
  centres: HawkerCentreSummary[];
  selectedCentreId: string | null;
  onSelectCentre: (centre: HawkerCentreSummary) => void;
  className?: string;
  fullScreen?: boolean;
}

// Convert geographic coordinates to Web Mercator pixel coordinates
function project(lat: number, lng: number, zoom: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  const scale = 256 * Math.pow(2, zoom);
  const x = scale * ((lng + 180) / 360);
  const y = scale * (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI));
  return { x, y };
}

export function HawkerMap({
  userLocation,
  centres,
  selectedCentreId,
  onSelectCentre,
  className = '',
  fullScreen = false,
}: HawkerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 380 });
  const [zoom, setZoom] = useState(15);

  const selectedCentre = useMemo(
    () => centres.find((c) => c.id === selectedCentreId) ?? null,
    [centres, selectedCentreId]
  );

  const [manualCenter, setManualCenter] = useState<{ lat: number; lng: number } | null>(null);

  const center = useMemo(() => {
    if (manualCenter) return manualCenter;
    if (selectedCentre && selectedCentre.lat && selectedCentre.lng) {
      return { lat: selectedCentre.lat, lng: selectedCentre.lng };
    }
    return {
      lat: userLocation.lat || 3.1432,
      lng: userLocation.lng || 101.6985,
    };
  }, [manualCenter, selectedCentre, userLocation]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; centerProj: { x: number; y: number } } | null>(null);

  // Resize observer to track map dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const centerProj = useMemo(() => project(center.lat, center.lng, zoom), [center, zoom]);

  // Calculate visible tiles (supporting Minimalist CartoDB Positron and Detailed OpenStreetMap)
  const visibleTiles = useMemo(() => {
    const tileCount = Math.pow(2, zoom);
    const startTileX = Math.floor((centerProj.x - dimensions.width / 2) / 256);
    const endTileX = Math.floor((centerProj.x + dimensions.width / 2) / 256);
    const startTileY = Math.floor((centerProj.y - dimensions.height / 2) / 256);
    const endTileY = Math.floor((centerProj.y + dimensions.height / 2) / 256);

    const subdomains = ['a', 'b', 'c', 'd'];
    const tiles = [];
    const isRetina = typeof window !== 'undefined' && (window.devicePixelRatio || 1) > 1;
    const r = isRetina ? '@2x' : '';

    for (let x = startTileX; x <= endTileX; x++) {
      for (let y = startTileY; y <= endTileY; y++) {
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        if (y >= 0 && y < tileCount) {
          const screenX = x * 256 - (centerProj.x - dimensions.width / 2);
          const screenY = y * 256 - (centerProj.y - dimensions.height / 2);
          const sub = subdomains[Math.abs(x + y) % subdomains.length];

          // CARTO Positron: https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
          // Free public CDN, zero API key watermark, clean light-grey aesthetic
          const tileUrl = `https://${sub}.basemaps.cartocdn.com/light_all/${zoom}/${wrappedX}/${y}${r}.png`;

          tiles.push({
            key: `carto-positron-${zoom}-${x}-${y}`,
            url: tileUrl,
            screenX,
            screenY,
          });
        }
      }
    }
    return tiles;
  }, [centerProj, dimensions, zoom]);

  // Mouse & touch dragging handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      centerProj: { ...centerProj },
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const newProjX = dragStartRef.current.centerProj.x - dx;
    const newProjY = dragStartRef.current.centerProj.y - dy;

    // Inverse Web Mercator
    const scale = 256 * Math.pow(2, zoom);
    const newLng = (newProjX / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * newProjY) / scale;
    const newLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    setManualCenter({
      lat: Math.max(-85, Math.min(85, newLat)),
      lng: Math.max(-180, Math.min(180, newLng)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Convert marker lat/lng to screen pixel coordinates
  const getScreenCoordinates = useCallback(
    (lat: number, lng: number) => {
      const p = project(lat, lng, zoom);
      const screenX = dimensions.width / 2 + (p.x - centerProj.x);
      const screenY = dimensions.height / 2 + (p.y - centerProj.y);
      return { x: screenX, y: screenY };
    },
    [centerProj, dimensions, zoom]
  );

  const userScreen = useMemo(
    () => (userLocation.lat && userLocation.lng ? getScreenCoordinates(userLocation.lat, userLocation.lng) : null),
    [userLocation, getScreenCoordinates]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${fullScreen ? 'h-full' : 'h-[360px] sm:h-[420px] rounded-[28px] overflow-hidden border border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.06)]'} select-none bg-[#f4f4f6] cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={(e) => {
        if (e.button === 0) handlePointerDown(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={(e) => {
        if (e.touches.length === 1) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 1) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handlePointerUp}
    >
      {/* Map Tile Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {visibleTiles.map((tile) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute w-[256px] h-[256px] transition-opacity duration-300"
            style={{
              transform: `translate3d(${tile.screenX}px, ${tile.screenY}px, 0)`,
            }}
          />
        ))}
      </div>

      {/* Map Vignette Overlay */}
      {!fullScreen && (
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 rounded-[28px]" />
      )}

      {/* User Location Radar Pin */}
      {userScreen && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-100"
          style={{
            transform: `translate3d(${userScreen.x}px, ${userScreen.y}px, 0)`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute h-10 w-10 rounded-full bg-[#007aff]/20 animate-ping" />
            <span className="absolute h-6 w-6 rounded-full bg-[#007aff]/35" />
            <span className="relative flex h-3.5 w-3.5 rounded-full bg-[#007aff] border-2 border-white shadow-md" />
          </div>
        </div>
      )}

      {/* Hawker Centre Pins */}
      {centres.map((c) => {
        if (!c.lat || !c.lng) return null;
        const pos = getScreenCoordinates(c.lat, c.lng);
        const isSelected = c.id === selectedCentreId;

        // Skip rendering if completely off screen
        if (pos.x < -60 || pos.x > dimensions.width + 60 || pos.y < -60 || pos.y > dimensions.height + 60) {
          return null;
        }

        return (
          <div
            key={c.id}
            className={`absolute z-30 -translate-x-1/2 -translate-y-full transition-transform duration-200 cursor-pointer ${
              isSelected ? 'scale-110 z-40' : 'hover:scale-105'
            }`}
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0) ${isSelected ? 'scale(1.1)' : ''}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCentre(c);
              if (c.lat && c.lng) {
                setManualCenter({ lat: c.lat, lng: c.lng });
              }
            }}
          >
            {/* Custom Marker Pin */}
            <div className="flex flex-col items-center group">
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-md ring-2 ring-black/10'
                    : 'bg-white/95 backdrop-blur-md text-[#1d1d1f] border-black/10 shadow-xs hover:border-black/25'
                }`}
              >
                <Store className="h-3.5 w-3.5 text-[#ff9500]" />
                <span className="max-w-[120px] truncate">{c.name}</span>
                {c.hasAircon && (
                  <span title="Aircon" aria-label="Aircon" className="flex items-center">
                    <Snowflake className="h-3 w-3 text-[#32ade6] shrink-0" />
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#8e8e93]'}`}>
                  ★ {c.rating.toFixed(1)}
                </span>
              </div>

              {/* Pin Arrow Indicator */}
              <div
                className={`w-2 h-2 rotate-45 -mt-1 border-r border-b ${
                  isSelected ? 'bg-[#1d1d1f] border-[#1d1d1f]' : 'bg-white border-black/10'
                }`}
              />
            </div>
          </div>
        );
      })}

      {/* Map Controls */}
      <div className={`absolute right-3.5 ${fullScreen ? 'top-16' : 'top-3'} z-20 flex flex-col gap-1.5`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(20, z + 1));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#1d1d1f] shadow-xs hover:bg-white active:scale-95 transition-all border border-black/[0.08]"
          aria-label="Zoom in"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(12, z - 1));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#1d1d1f] shadow-xs hover:bg-white active:scale-95 transition-all border border-black/[0.08]"
          aria-label="Zoom out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (userLocation.lat && userLocation.lng) {
              setManualCenter(userLocation);
              setZoom(16);
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#007aff] shadow-xs hover:bg-white active:scale-95 transition-all border border-black/[0.08]"
          aria-label="Recenter to my location"
        >
          <Locate className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Selected Centre Floating Info Card */}
      {selectedCentre && !fullScreen && (
        <div className="absolute left-3 right-3 bottom-3 z-30 sm:left-4 sm:right-auto sm:max-w-xs animate-scale-in">
          <div className="rounded-2xl bg-white/90 backdrop-blur-xl p-3.5 shadow-sm border border-black/[0.08]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-[#1d1d1f]">{selectedCentre.name}</h4>
                  {selectedCentre.hasAircon && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#32ade6]/12 border border-[#32ade6]/25 px-1.5 py-0.2 text-[9px] font-semibold text-[#0071a4] shrink-0" title="Aircon">
                      <Snowflake className="h-2.5 w-2.5 text-[#32ade6]" />
                      <span>Aircon</span>
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#8e8e93] line-clamp-1">{selectedCentre.address}</p>
              </div>
              <span className="rounded-full bg-[#34c759]/12 px-2 py-0.5 text-[10px] font-medium text-[#248a3d] shrink-0">
                Open
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-[#8e8e93]">
              <span>{selectedCentre.stallsCount} stalls</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <span className="text-[#ff9500]">★</span>
                <span>{selectedCentre.rating.toFixed(1)}</span>
              </span>
            </div>

            <Link
              href={`/stall?centre=${encodeURIComponent(selectedCentre.slug)}` as any}
              className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-[#007aff] hover:bg-[#0071e3] px-5 text-sm font-semibold text-white transition-all shadow-xs active:scale-[0.98]"
            >
              <span>View stalls</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Map Attribution */}
      <div className={`absolute left-2.5 ${fullScreen ? 'bottom-20 sm:bottom-24' : 'bottom-1.5'} z-10 text-[9px] text-[#8e8e93] bg-white/70 backdrop-blur-xs px-1.5 py-0.5 rounded-md pointer-events-none`}>
        © CARTO Positron • © OpenStreetMap contributors
      </div>
    </div>
  );
}
