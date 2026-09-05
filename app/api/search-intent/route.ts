import { NextRequest, NextResponse } from 'next/server';
import { parseSearchIntent } from '@/lib/ai/intent-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body?.query === 'string' ? body.query : '';

    if (!query.trim()) {
      return NextResponse.json({ error: 'A query string is required.' }, { status: 400 });
    }

    const intent = await parseSearchIntent(query);
    return NextResponse.json({ intent }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to parse search intent.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
