export const CART_STORAGE_KEY = 'hawker-cart-items';

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
};

export type MerchantGroup = {
  stallId: string;
  stallName: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
};

export type CartSummary = {
  items: CartItem[];
  merchantGroups: MerchantGroup[];
  subtotal: number;
  serviceFee: number;
  total: number;
};

const SERVICE_FEE_RATE = 0.05;

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
    (item) => item.dishId === normalizedDish.dishId && item.stallId === normalizedDish.stallId,
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

export function removeCartItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId);
}

export function buildCartSummary(items: CartItem[]): CartSummary {
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

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const serviceFee = Number((subtotal * SERVICE_FEE_RATE).toFixed(2));

  return {
    items,
    merchantGroups: merchantGroupsList,
    subtotal: Number(subtotal.toFixed(2)),
    serviceFee,
    total: Number((subtotal + serviceFee).toFixed(2)),
  };
}

export function createMockOrder(items: CartItem[]) {
  const summary = buildCartSummary(items);

  return {
    id: `#${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'PAID',
    summary,
    merchantStatuses: summary.merchantGroups.map((group) => ({
      stallId: group.stallId,
      stallName: group.stallName,
      status: 'PENDING',
    })),
  };
}
