import { NextRequest, NextResponse } from 'next/server';
import { parseSearchIntent } from '@/lib/ai/intent-parser';
import { SearchFilters, SearchFiltersSchema } from '@/lib/search/schema';
import { SearchService } from '@/lib/search/search-service';

const normalizePayload = (value: unknown): Record<string, unknown> => {
 if (!value || typeof value !== 'object' || Array.isArray(value)) {
 return {};
 }

 return value as Record<string, unknown>;
};

const resolveFilterPayload = async (payload: Record<string, unknown>): Promise<SearchFilters> => {
 const hasStructuredFilters = ['minPrice', 'maxPrice', 'vegetarian', 'halal', 'spiceLevel'].some(
 (key) => payload[key] !== undefined,
 );

 if (typeof payload.query === 'string' && payload.query.trim() && !hasStructuredFilters) {
 const parsedIntent = await parseSearchIntent(payload.query);
 return SearchFiltersSchema.parse(parsedIntent);
 }

 const parsed = SearchFiltersSchema.safeParse(payload);
 if (!parsed.success) {
 throw new Error(JSON.stringify(parsed.error.flatten().fieldErrors));
 }

 return parsed.data;
};

export async function GET(request: NextRequest) {
 try {
 const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
 const filters = await resolveFilterPayload(queryParams);
 const results = await SearchService.search(filters);

 return NextResponse.json({ results, total: results.length }, { status: 200 });
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unexpected search error';
 return NextResponse.json({ error: message }, { status: 400 });
 }
}

export async function POST(request: Request) {
 try {
 const body = await request.json().catch(() => ({}));
 const payload = normalizePayload(body);
 const filters = await resolveFilterPayload(payload);
 const results = await SearchService.search(filters);

 return NextResponse.json({ results, total: results.length }, { status: 200 });
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unexpected search error';
 return NextResponse.json({ error: message }, { status: 400 });
 }
}
