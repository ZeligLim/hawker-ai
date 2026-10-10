/**
 * Hawker Multi-Client Platform SDK & API Client Layer
 *
 * Separates data access into isolated namespaces for:
 * 1. Customer Client
 * 2. Stall Worker Client
 * 3. Shop Owner Client
 *
 * Can be reused in Web, iOS, and Android clients without coupling to React UI.
 */

import { authenticatedFetch } from '@/lib/supabase/client';

export interface ApiClientConfig {
  baseUrl?: string;
}

export class CustomerApiClient {
  /**
   * Browse available food outlets in a hawker centre
   */
  async getFoodOutlets(centreId?: string) {
    const url = centreId ? `/api/outlets?centreId=${encodeURIComponent(centreId)}` : '/api/outlets';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load food outlets');
    return res.json();
  }

  /**
   * Search dishes with deterministic scoring & filters
   */
  async searchDishes(query: string, dietary?: string[]) {
    const params = new URLSearchParams({ q: query });
    if (dietary?.length) params.set('dietary', dietary.join(','));
    const res = await fetch(`/api/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search dishes');
    return res.json();
  }

  /**
   * Get active table session
   */
  async getTableSession(sessionId: string) {
    const res = await fetch(`/api/table-sessions?id=${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error('Failed to load table session');
    return res.json();
  }

  /**
   * Place customer order (multi-stall checkout)
   */
  async createOrder(payload: any) {
    const res = await authenticatedFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  }

  /**
   * View customer's own order history
   */
  async getMyOrders() {
    const res = await authenticatedFetch('/api/orders');
    if (!res.ok) throw new Error('Failed to load your orders');
    return res.json();
  }
}

export class StallApiClient {
  /**
   * Fetch incoming tickets for authorized stalls
   */
  async getStallOrders() {
    const res = await authenticatedFetch('/api/owner/orders');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load stall orders');
    }
    return res.json();
  }

  /**
   * Advance order status (accepted -> preparing -> ready -> served)
   */
  async updateOrderStatus(orderId: string, status: 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled') {
    const res = await authenticatedFetch(`/api/owner/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update order status');
    }
    return res.json();
  }

  /**
   * Issue instant out-of-stock refund for an item
   */
  async refundItem(orderId: string, itemId: string, reason?: string) {
    const res = await authenticatedFetch(`/api/owner/orders/${orderId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_ids: [itemId], reason: reason || 'Item Sold Out' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to issue refund');
    }
    return res.json();
  }

  /**
   * Fetch menu dishes for stall
   */
  async getStallDishes() {
    const res = await authenticatedFetch('/api/owner/dishes');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load stall dishes');
    }
    return res.json();
  }

  /**
   * Toggle 86 / sold-out availability for a dish
   */
  async setDishAvailability(dishId: string, isAvailable: boolean) {
    const res = await authenticatedFetch(`/api/owner/dishes/${dishId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update dish availability');
    }
    return res.json();
  }
}

export class ShopOwnerApiClient {
  /**
   * Fetch shops owned or managed by the user
   */
  async getShops() {
    const res = await authenticatedFetch('/api/owner/shops');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load shops');
    }
    return res.json();
  }

  /**
   * Fetch single shop details
   */
  async getShop(shopId: string) {
    const res = await authenticatedFetch(`/api/owner/shops/${shopId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load shop details');
    }
    return res.json();
  }

  /**
   * Update shop settings (address, name, etc.)
   */
  async updateShop(shopId: string, payload: { name?: string; address?: string }) {
    const res = await authenticatedFetch(`/api/owner/shops/${shopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update shop');
    }
    return res.json();
  }

  /**
   * Create booth slot in a shop
   */
  async createBooth(shopId: string, name: string) {
    const res = await authenticatedFetch('/api/owner/booths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: shopId, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create booth');
    }
    return res.json();
  }

  /**
   * Generate private cryptographic invite token for a stall vendor
   */
  async generateBoothInvite(boothId: string) {
    const res = await authenticatedFetch(`/api/owner/booths/${boothId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate booth invitation');
    }
    return res.json();
  }

  /**
   * Fetch business analytics & financial reconciliation
   */
  async getAnalytics(period: 'd' | 'w' | 'm' = 'w') {
    const res = await authenticatedFetch(`/api/owner/analytics?period=${period}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load business analytics');
    }
    return res.json();
  }
}

// Singletons for convenient web & mobile consumption
export const customerApi = new CustomerApiClient();
export const stallApi = new StallApiClient();
export const ownerApi = new ShopOwnerApiClient();
