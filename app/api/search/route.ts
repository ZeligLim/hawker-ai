import { NextRequest, NextResponse } from 'next/server';
import { SearchFiltersSchema } from '@/lib/search/schema';
import { SearchService } from '@/lib/search/search-service';

const normalizePayload = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  try {
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = SearchFiltersSchema.safeParse(queryParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid search parameters',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const results = await SearchService.search(parsed.data);

    return NextResponse.json({ results, total: results.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected search error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = SearchFiltersSchema.safeParse(normalizePayload(body));

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid search parameters',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const results = await SearchService.search(parsed.data);

    return NextResponse.json({ results, total: results.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected search error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
