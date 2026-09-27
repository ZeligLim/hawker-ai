'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Map } from 'lucide-react';

interface LocationAutocompleteProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationAutocomplete({ address, onAddressChange, onLocationSelect }: LocationAutocompleteProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Hawker-Food-App/1.0',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (e) {
      console.error('Address search failed', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (address && showSuggestions) {
        searchAddress(address);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddressChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onAddressChange(suggestion.display_name);
    onLocationSelect(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setShowSuggestions(false);
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

        // Use OpenStreetMap Nominatim for free reverse geocoding without an API key
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Hawker-Food-App/1.0',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              onAddressChange(data.display_name);
              setShowSuggestions(false);
            }
          }
        } catch (e) {
          console.error('Reverse geocoding failed', e);
        } finally {
          setIsLocating(false);
        }
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
            value={address}
            onChange={handleInputChange}
            onFocus={() => {
              if (address.length >= 3) setShowSuggestions(true);
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
          {showSuggestions && (address.length >= 3) && (
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
