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

  // Sync prop changes that didn't originate from this component
  useEffect(() => {
    if (address !== localAddress) {
      setLocalAddress(address);
    }
  }, [address]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address || place.name || '';
          setLocalAddress(formattedAddress);
          onAddressChange(formattedAddress);
          onLocationSelect(lat, lng);
        }
      });
    }
  }, []);

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
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Address
        <div className="relative mt-2 flex items-center">
          <input
            ref={inputRef}
            value={localAddress}
            onChange={handleInputChange}
            placeholder="Search for an address..."
            className="w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none pr-12"
          />
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="absolute right-2 p-1.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/5"
            title="Use current location"
          >
            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          </button>
        </div>
      </label>
    </div>
  );
}
