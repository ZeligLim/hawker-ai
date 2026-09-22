import { ReceiptData } from '@/components/customer-receipt';

const ACTIVE_ORDER_KEY = 'hawker-active-order';
const ACTIVE_ORDER_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

interface ActiveOrderStorage {
  receipt: ReceiptData;
  timestamp: number;
  tableSessionId: string | null;
}

export function saveActiveOrder(receipt: ReceiptData, tableSessionId: string | null) {
  if (typeof window === 'undefined') return;
  const payload: ActiveOrderStorage = {
    receipt,
    timestamp: Date.now(),
    tableSessionId,
  };
  localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(payload));
}

export function getActiveOrder(currentTableSessionId: string | null): ReceiptData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(ACTIVE_ORDER_KEY);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data) as ActiveOrderStorage;
    
    // Check expiry
    if (Date.now() - parsed.timestamp > ACTIVE_ORDER_EXPIRY_MS) {
      clearActiveOrder();
      return null;
    }

    // Check table session match
    if (parsed.tableSessionId !== currentTableSessionId) {
      clearActiveOrder();
      return null;
    }

    return parsed.receipt;
  } catch (error) {
    clearActiveOrder();
    return null;
  }
}

export function clearActiveOrder() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_ORDER_KEY);
}
