'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Locate, Minus, Plus, Snowflake, Store } from 'lucide-react';
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

  // Calculate visible tiles using high-res Google Maps tiles
  const visibleTiles = useMemo(() => {
    const tileCount = Math.pow(2, zoom);
    const startTileX = Math.floor((centerProj.x - dimensions.width / 2) / 256);
    const endTileX = Math.floor((centerProj.x + dimensions.width / 2) / 256);
    const startTileY = Math.floor((centerProj.y - dimensions.height / 2) / 256);
    const endTileY = Math.floor((centerProj.y + dimensions.height / 2) / 256);

    const tiles = [];
    const isRetina = typeof window !== 'undefined' && (window.devicePixelRatio || 1) > 1;
    const scale = isRetina ? 2 : 1;

    for (let x = startTileX; x <= endTileX; x++) {
      for (let y = startTileY; y <= endTileY; y++) {
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        if (y >= 0 && y < tileCount) {
          const screenX = x * 256 - (centerProj.x - dimensions.width / 2);
          const screenY = y * 256 - (centerProj.y - dimensions.height / 2);

          // Google Maps Standard Roadmap (clean, high-res, zero watermarks)
          const tileUrl = `https://mt0.google.com/vt/lyrs=m&hl=en&x=${wrappedX}&y=${y}&z=${zoom}&scale=${scale}`;

          tiles.push({
            key: `gmap-${zoom}-${x}-${y}`,
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
      className={`relative w-full ${fullScreen ? 'h-full overflow-hidden' : 'h-[360px] sm:h-[420px] rounded-[28px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.06)]'} select-none bg-white cursor-grab active:cursor-grabbing ${className}`}
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
      {/* Map Tile Layer - High Contrast Pure Black & White Filter */}
      <div
        className="absolute inset-0 pointer-events-none bg-white"
        style={{
          filter: 'grayscale(100%) contrast(120%) brightness(105%)',
        }}
      >
        {visibleTiles.map((tile) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute w-[256px] h-[256px]"
            style={{
              transform: `translate3d(${tile.screenX}px, ${tile.screenY}px, 0)`,
            }}
          />
        ))}
      </div>

      {/* Current User Geolocation Radar Dot */}
      {userScreen && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            transform: `translate3d(${userScreen.x}px, ${userScreen.y}px, 0)`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute h-8 w-8 rounded-full bg-black/15" />
            <span className="absolute h-5 w-5 rounded-full bg-black/25" />
            <span className="relative flex h-3.5 w-3.5 rounded-full bg-black shadow-md" />
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
            className="absolute z-30 -translate-x-1/2 -translate-y-full cursor-pointer"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCentre(c);
              if (c.lat && c.lng) {
                setManualCenter({ lat: c.lat, lng: c.lng });
              }
            }}
          >
            {/* Custom Marker Pin - Pure Black and White Pill with 0 Border */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-colors ${
                  isSelected
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span className="max-w-[130px] truncate">{c.name}</span>
                {c.hasAircon && (
                  <span title="Aircon" aria-label="Aircon" className="flex items-center">
                    <Snowflake className="h-3 w-3 shrink-0" />
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-600'
                  }`}
                >
                  ★ {c.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Map Controls - Pure White & Black, h-11, Borderless, No Bouncy Transitions */}
      {/* Set top-24 to avoid crashing with the floating top search bar when in fullScreen */}
      <div className={`absolute right-3.5 ${fullScreen ? 'top-24' : 'top-3'} z-20 flex flex-col gap-2`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(20, z + 1));
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-neutral-100 transition-colors"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(12, z - 1));
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-neutral-100 transition-colors"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
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
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-neutral-100 transition-colors"
          aria-label="Recenter to my location"
        >
          <Locate className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
