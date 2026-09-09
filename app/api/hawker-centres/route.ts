import { NextRequest, NextResponse } from 'next/server';
import { fetchHawkerCentres } from '@/lib/hawker-centres/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    const hawkerCentres = await fetchHawkerCentres({ slug, search });
    return NextResponse.json({ hawkerCentres });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to fetch hawker centres' },
      { status: 500 }
    );
  }
}
