import {
 getStoredTableSession,
 setCurrentTableSession,
 type CurrentTableSession,
} from '@/lib/table-session';

type TableSessionResponse = {
 error?: unknown;
 session?: {
 id?: unknown;
 };
 table?: {
 id?: unknown;
 table_number?: unknown;
 restaurants?: {
 id?: unknown;
 name?: unknown;
 slug?: unknown;
 } | Array<{
 id?: unknown;
 name?: unknown;
 slug?: unknown;
 }> | null;
 };
};

export function buildTableMenuUrl(origin: string, centreSlug: string, tableId: string): string {
 const url = new URL(`/${encodeURIComponent(centreSlug)}/menu`, origin);
 url.searchParams.set('table_id', tableId);
 return url.toString();
}

export async function connectTableFromLink(
 tableId: string,
 expectedCentreSlug: string,
): Promise<CurrentTableSession> {
 const stored = getStoredTableSession();
 if (
 stored?.sessionId &&
 stored?.tableId === tableId &&
 stored.centreSlug?.toLowerCase() === expectedCentreSlug.toLowerCase()
 ) {
 return stored;
 }

 const response = await fetch('/api/table-sessions', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ tableId }),
 });
 const payload = await response.json().catch(() => null) as TableSessionResponse | null;

 if (!response.ok) {
 throw new Error(
 typeof payload?.error === 'string' ? payload.error : 'Could not verify this table link.',
 );
 }

 const table = payload?.table;
 const session = payload?.session;
 const centre = Array.isArray(table?.restaurants)
 ? table.restaurants[0]
 : table?.restaurants;

 if (
 typeof table?.id !== 'string' ||
 typeof table.table_number !== 'string' ||
 typeof session?.id !== 'string' ||
 typeof centre?.id !== 'string' ||
 typeof centre.slug !== 'string' ||
 typeof centre.name !== 'string'
 ) {
 throw new Error('The table link does not point to a valid centre table.');
 }

 if (centre.slug.toLowerCase() !== expectedCentreSlug.toLowerCase()) {
 throw new Error('This table link belongs to a different centre.');
 }

 setCurrentTableSession(table.table_number, table.id, {
 sessionId: session.id,
 centreId: centre.id,
 centreSlug: centre.slug,
 centreName: centre.name,
 });

 const connected = getStoredTableSession();
 if (!connected) {
 throw new Error('The table session could not be saved in this browser.');
 }
 return connected;
}
