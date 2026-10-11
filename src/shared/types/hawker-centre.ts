export interface HawkerCentreStall {
  id: string;
  name: string;
  dishCount: number;
  isOpen: boolean;
  isActive: boolean;
  schedule?: any;
}

export interface HawkerCentreSummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  lat: number | null;
  lng: number | null;
  stallsCount: number;
  activeStallsCount: number;
  dishesCount: number;
  rating: number;
  tag: string;
  stalls: HawkerCentreStall[];
  specialties: string[];
  hasAircon: boolean;

  isActive: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  distanceKm?: number | null;
  walkMins?: number | null;
  createdAt: string;
}
