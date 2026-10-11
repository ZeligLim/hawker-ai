/// <reference types="@types/google.maps" />
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function LocationAutocomplete({ address, onAddressChange, onLocationSelect }: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [localAddress, setLocalAddress] = useState(address);

  // Use refs for callbacks to avoid stale closures in the Google Maps event listener
  const onAddressChangeRef = useRef(onAddressChange);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
    onLocationSelectRef.current = onLocationSelect;
  }, [onAddressChange, onLocationSelect]);

  // Sync prop changes that didn't originate from this component
  useEffect(() => {
    if (address !== localAddress) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
setLocalAddress(address);    }
  }, [address, localAddress]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places && inputRef.current) {
        if (autocompleteRef.current) return;
        
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Prefer formatted_address, fallback to name, then input value
            const formattedAddress = place.formatted_address || place.name || inputRef.current?.value || '';
            
            setLocalAddress(formattedAddress);
            onAddressChangeRef.current(formattedAddress);
            onLocationSelectRef.current(lat, lng);
          }
        });
      }
    };

    initAutocomplete();
    
    // Fallback interval just in case script loads late
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []); // Empty dependency array, we use refs for callbacks

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAddress(e.target.value);
    onAddressChange(e.target.value);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect(latitude, longitude);

        // Reverse geocode with Google Maps
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          try {
            const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
            if (response.results && response.results.length > 0) {
              const formatted = response.results[0].formatted_address;
              setLocalAddress(formatted);
              onAddressChange(formatted);
            }
          } catch (e) {
            console.error('Reverse geocoding failed', e);
          }
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location', error);
        alert('Unable to get your current location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
          <input
            ref={inputRef}
            value={localAddress}
            onChange={handleInputChange}
            placeholder="Search for an address..."
            className="w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 outline-none pac-target-input"
          />
        </div>
      
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
      >
        {isLocating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Locating...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Use current location
          </>
        )}
      </button>
    </div>
  );
}
