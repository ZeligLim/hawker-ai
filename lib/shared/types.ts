/**
 * Hawker Multi-Client Platform Core Types
 *
 * Designed to be shared across:
 * - Public Website / Marketing
 * - Customer Web & Mobile App (iOS / Android)
 * - Stall Worker Web & Mobile App (KDS / Tablet)
 * - Shop Owner Web & Mobile App (Business / Operations)
 *
 * Decoupled from React DOM / Next.js web APIs for 100% portability.
 */

export type ClientAppType = 'website' | 'customer' | 'stall' | 'owner';

export type UserRole =
  | 'customer'
  | 'stall_staff'
  | 'stall_manager'
  | 'stall_owner'
  | 'shop_manager'
  | 'shop_owner';

export type ShopStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type OrderWorkflowStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_progress'
  | 'partially_ready'
  | 'ready'
  | 'served'
  | 'cancelled';

export type MerchantOrderStatus =
  | 'waiting'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

/**
 * 1. Base User Profile (Personal Identity)
 * Separated from Business / Shop entities.
 */
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt?: string;
}

/**
 * 2. Business Entity: Shop / Hawker Centre / Food Hall
 */
export interface RestaurantEntity {
  id: string;
  name: string;
  slug: string;
  address: string;
  lat: number;
  lng: number;
  status?: ShopStatus;
  feePayer?: 'CUSTOMER' | 'MERCHANT';
  platformFeeFixed?: number;
  platformFeePercent?: number;
  createdAt: string;
}

/**
 * 3. Business Entity: Stall / Booth within a Shop
 */
export interface FoodOutletEntity {
  id: string;
  restaurantId: string;
  name: string;
  handle?: string;
  feePayer?: 'CUSTOMER' | 'MERCHANT' | null;
  platformFeeFixed?: number | null;
  platformFeePercent?: number | null;
  createdAt: string;
}

/**
 * 4. Business Entity: Dish / Menu Item
 */
export interface DishEntity {
  id: string;
  foodOutletId: string;
  name: string;
  description: string;
  price: number;
  isVegetarian: boolean;
  isHalal: boolean;
  spiceLevel: number;
  proteinGrams: number;
  imageUrl: string | null;
  isAvailable: boolean;
  tags: string[];
  customizations?: any[];
  createdAt: string;
}

/**
 * 5. Business Membership: User <-> Shop
 */
export interface RestaurantMembershipEntity {
  id: string;
  userId: string;
  restaurantId: string;
  role: 'owner' | 'manager' | 'staff';
  restaurantName?: string;
  createdAt: string;
}

/**
 * 6. Business Membership: User <-> Stall
 */
export interface MerchantMembershipEntity {
  userId: string;
  foodOutletId: string;
  role: 'owner' | 'manager' | 'staff';
  outletName?: string;
  restaurantId?: string;
  restaurantName?: string;
  createdAt: string;
}

/**
 * Composite User Authorization State
 */
export interface UserAuthorizationState {
  userId: string;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isStallWorker: boolean;
  isShopOwner: boolean;
  stallMemberships: MerchantMembershipEntity[];
  shopMemberships: RestaurantMembershipEntity[];
}

/**
 * Client Navigation Boundaries
 */
export interface ClientNavigationItem {
  id: string;
  label: string;
  href: string;
  client: ClientAppType;
  requiresAuth: boolean;
  requiresStallRole?: boolean;
  requiresOwnerRole?: boolean;
}
