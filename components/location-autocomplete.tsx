/// <reference types="@types/google.maps" />
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Map } from 'lucide-react';

interface LocationAutocompleteProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

interface Suggestion {
  place_id: string;
  display_name: string;
}

export function LocationAutocomplete({ address, onAddressChange, onLocationSelect }: LocationAutocompleteProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localAddress, setLocalAddress] = useState(address);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderService = useRef<google.maps.Geocoder | null>(null);

  // Sync prop changes that didn't originate from this component
  useEffect(() => {
    if (address !== localAddress) {
      setLocalAddress(address);
    }
  }, [address]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Google Maps services when API is loaded
  useEffect(() => {
    const initServices = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        if (!autocompleteService.current) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (!geocoderService.current) {
          geocoderService.current = new window.google.maps.Geocoder();
        }
      }
    };

    // Attempt to init right away in case it's already loaded
    initServices();

    // Or set up an interval to check if it loads lazily
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initServices();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const searchAddress = useCallback((query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!autocompleteService.current) return;

    setIsSearching(true);
    autocompleteService.current.getPlacePredictions(
      { input: query },
      (predictions, status) => {
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(
            predictions.map((p) => ({
              place_id: p.place_id,
              display_name: p.description,
            }))
          );
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localAddress && showSuggestions) {
        searchAddress(localAddress);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localAddress, showSuggestions, searchAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAddress(e.target.value);
    onAddressChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setLocalAddress(suggestion.display_name);
    onAddressChange(suggestion.display_name);
    setShowSuggestions(false);

    if (geocoderService.current) {
      geocoderService.current.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          onLocationSelect(lat, lng);
        }
      });
    }
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

        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          if (!geocoderService.current) {
            geocoderService.current = new window.google.maps.Geocoder();
          }
          try {
            const response = await geocoderService.current.geocode({ location: { lat: latitude, lng: longitude } });
            if (response.results && response.results.length > 0) {
              const formatted = response.results[0].formatted_address;
              setLocalAddress(formatted);
              onAddressChange(formatted);
              setShowSuggestions(false);
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
    <div className="space-y-2" ref={containerRef}>
      <label className="block text-sm font-medium">
        Address
        <div className="relative mt-2 flex items-center">
          <input
            value={localAddress}
            onChange={handleInputChange}
            onFocus={() => {
              if (localAddress.length >= 3) setShowSuggestions(true);
            }}
            placeholder="Type an address or click the location icon..."
            className="w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none pr-12"
          />
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="absolute right-2 p-1.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
            title="Use current location"
          >
            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          </button>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && (localAddress.length >= 3) && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-[14px] shadow-lg overflow-hidden border border-neutral-100">
              {isSearching ? (
                <div className="p-3 text-sm text-center text-[#6e6e73] flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="max-h-60 overflow-auto">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.place_id}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-[#f5f5f7] transition-colors flex items-start gap-3"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <Map className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#6e6e73]" />
                        <span className="text-sm line-clamp-2 text-[#1d1d1f]">{suggestion.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-sm text-center text-[#6e6e73]">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
