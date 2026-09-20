export const TABLE_SESSION_STORAGE_KEY = 'hawker-current-table';

export type CurrentTableSession = {
  tableNumber: string;
  tableId?: string | null;
  centreId?: string | null;
  centreSlug?: string | null;
  centreName?: string | null;
  aiEnabled?: boolean | null;
  scannedAt?: string | null;
};

export function getStoredTableSession(): CurrentTableSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(TABLE_SESSION_STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved) as Partial<CurrentTableSession>;
    const tableNumber = parsed.tableNumber?.trim();
    if (!tableNumber) {
      return null;
    }

    return {
      tableNumber,
      tableId: parsed.tableId ?? null,
      centreId: parsed.centreId ?? null,
      centreSlug: parsed.centreSlug ?? null,
      centreName: parsed.centreName ?? null,
      aiEnabled: parsed.aiEnabled ?? true,
      scannedAt: parsed.scannedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function isTableSessionActive(): boolean {
  return getStoredTableSession() !== null;
}

export function getCurrentTableSession(): CurrentTableSession {
  const stored = getStoredTableSession();
  if (stored) return stored;
  return { tableNumber: '', tableId: null };
}

export function setCurrentTableSession(
  tableNumber: string,
  tableId?: string | null,
  centreInfo?: {
    centreId?: string | null;
    centreSlug?: string | null;
    centreName?: string | null;
    aiEnabled?: boolean | null;
  },
) {
  if (typeof window === 'undefined') return;

  const trimmed = tableNumber.trim();
  if (!trimmed) return;

  const next: CurrentTableSession = {
    tableNumber: trimmed,
    tableId: tableId ?? null,
    centreId: centreInfo?.centreId ?? null,
    centreSlug: centreInfo?.centreSlug ?? null,
    centreName: centreInfo?.centreName ?? null,
    aiEnabled: centreInfo?.aiEnabled ?? true,
    scannedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(TABLE_SESSION_STORAGE_KEY, JSON.stringify(next));
}

export function clearTableSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TABLE_SESSION_STORAGE_KEY);
}

export function formatTableLabel(tableNumber: string) {
  const normalized = tableNumber?.trim();
  return normalized ? `Table ${normalized}` : 'Scan Table QR';
}

export function parseTableReference(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed) return { tableNumber: '', tableId: null };

  const directUuid = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  if (directUuid) {
    return { tableNumber: '12', tableId: directUuid[0] };
  }

  const digits = trimmed.match(/\d+/);
  const tableNumber = digits ? digits[0] : trimmed.replace(/[^a-z0-9]/gi, '');
  return { tableNumber, tableId: null };
}
