'use client';

import { useEffect, useState } from 'react';

export const CART_STORAGE_KEY = 'hawker-cart-items';

export function useCartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setCartItems(readCartItems());
      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    writeCartItems(cartItems);
  }, [cartItems, hasHydrated]);

  return { cartItems, setCartItems, hasHydrated };
}

export function readCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCartItems(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export type CartItem = {
  id: string;
  dishId: string;
  name: string;
  restaurantName: string;
  stallName: string;
  stallId: string;
  price: number;
  quantity: number;
  notes?: string;
  customizationKey?: string;
  customizations?: string[];
};

export type MerchantGroup = {
  stallId: string;
  stallName: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
};

export type CartFeeConfig = {
  feePayer?: 'CUSTOMER' | 'MERCHANT';
  platformFeeFixed?: number;
  platformFeePercent?: number;
};

export type CartSummary = {
  items: CartItem[];
  merchantGroups: MerchantGroup[];
  subtotal: number;
  serviceFee: number;
  platformFeeAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  merchantPayoutAmount: number;
  feePayer: 'CUSTOMER' | 'MERCHANT';
  total: number;
};

export const DEFAULT_PLATFORM_FEE_FIXED = 0.50;
export const DEFAULT_PLATFORM_FEE_PERCENT = 0.0000;


export function addItemToCart(
  items: CartItem[],
  dish: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number },
): CartItem[] {
  const normalizedDish = {
    ...dish,
    quantity: dish.quantity ?? 1,
    notes: dish.notes ?? '',
  };

  const existingIndex = items.findIndex(
    (item) =>
      item.dishId === normalizedDish.dishId &&
      item.stallId === normalizedDish.stallId &&
      item.customizationKey === normalizedDish.customizationKey,
  );

  if (existingIndex >= 0) {
    return items.map((item, index) => {
      if (index !== existingIndex) return item;
      return { ...item, quantity: item.quantity + normalizedDish.quantity };
    });
  }

  return [
    ...items,
    {
      ...normalizedDish,
      id: `${normalizedDish.stallId}:${normalizedDish.dishId}:${Date.now()}`,
      quantity: normalizedDish.quantity,
    },
  ];
}

export function updateCartItemQuantity(items: CartItem[], itemId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== itemId);
  }

  return items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
}

export function updateCartItemCustomization(
  items: CartItem[],
  itemId: string,
  customization: { customizationKey: string; customizations: string[]; price: number },
): CartItem[] {
  return items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          ...customization,
        }
      : item,
  );
}

export function removeCartItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId);
}

export function getDishQuantity(items: CartItem[], dishId: string, stallId?: string): number {
  return items.reduce(
    (total, item) => total + (item.dishId === dishId && (!stallId || item.stallId === stallId) ? item.quantity : 0),
    0,
  );
}

export function buildCartSummary(items: CartItem[], feeConfig?: CartFeeConfig): CartSummary {
  const merchantGroups = items.reduce<Record<string, MerchantGroup>>((groups, item) => {
    const key = item.stallId;
    if (!groups[key]) {
      groups[key] = {
        stallId: item.stallId,
        stallName: item.stallName,
        restaurantName: item.restaurantName,
        items: [],
        subtotal: 0,
      };
    }

    groups[key].items.push(item);
    groups[key].subtotal += item.price * item.quantity;
    return groups;
  }, {});

  const merchantGroupsList = Object.values(merchantGroups).sort((left, right) => left.stallName.localeCompare(right.stallName));

  const subtotal = Number(items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));
  
  const feePayer = feeConfig?.feePayer ?? 'CUSTOMER';
  const feeFixed = feeConfig?.platformFeeFixed ?? DEFAULT_PLATFORM_FEE_FIXED;
  const feePercent = feeConfig?.platformFeePercent ?? DEFAULT_PLATFORM_FEE_PERCENT;

  // Platform fee is fixed 0.50 + (subtotal * percent) when cart has items
  const platformFee = items.length > 0 ? Number((feeFixed + (subtotal * feePercent)).toFixed(2)) : 0;

  // If fee_payer is CUSTOMER:
  // - subtotal_amount = sum of items
  // - platform_fee_amount = fixed + subtotal * percent
  // - total_amount = subtotal + platform_fee
  // - merchant_payout_amount = subtotal
  // If fee_payer is MERCHANT:
  // - total_amount = subtotal
  // - merchant_payout_amount = subtotal - platform_fee
  const total = feePayer === 'CUSTOMER'
    ? Number((subtotal + platformFee).toFixed(2))
    : subtotal;

  const merchantPayout = feePayer === 'MERCHANT'
    ? Math.max(0, Number((subtotal - platformFee).toFixed(2)))
    : subtotal;

  return {
    items,
    merchantGroups: merchantGroupsList,
    subtotal,
    serviceFee: platformFee,
    platformFeeAmount: platformFee,
    subtotalAmount: subtotal,
    totalAmount: total,
    merchantPayoutAmount: merchantPayout,
    feePayer,
    total,
  };
}
