export const TABLE_SESSION_STORAGE_KEY = 'hawker-current-table';

export type CurrentTableSession = {
  tableNumber: string;
  tableId?: string | null;
};

export function getCurrentTableSession(): CurrentTableSession {
  if (typeof window === 'undefined') {
    return { tableNumber: '12', tableId: null };
  }

  try {
    const saved = window.localStorage.getItem(TABLE_SESSION_STORAGE_KEY);
    if (!saved) {
      return { tableNumber: '12', tableId: null };
    }

    const parsed = JSON.parse(saved) as Partial<CurrentTableSession>;
    const tableNumber = parsed.tableNumber?.trim() || '12';
    return {
      tableNumber,
      tableId: parsed.tableId ?? null,
    };
  } catch {
    return { tableNumber: '12', tableId: null };
  }
}

export function setCurrentTableSession(tableNumber: string, tableId?: string | null) {
  if (typeof window === 'undefined') return;

  const next = {
    tableNumber: tableNumber.trim() || '12',
    tableId: tableId ?? null,
  };

  window.localStorage.setItem(TABLE_SESSION_STORAGE_KEY, JSON.stringify(next));
}

export function formatTableLabel(tableNumber: string) {
  const normalized = tableNumber.trim();
  return normalized ? `Table ${normalized}` : 'Table 12';
}

export function parseTableReference(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed) return { tableNumber: '12', tableId: null };

  const directUuid = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  if (directUuid) {
    return { tableNumber: '12', tableId: directUuid[0] };
  }

  const digits = trimmed.match(/\d+/);
  const tableNumber = digits ? digits[0] : trimmed.replace(/[^a-z0-9]/gi, '') || '12';
  return { tableNumber, tableId: null };
}
