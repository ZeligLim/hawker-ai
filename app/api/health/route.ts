import { NextResponse } from 'next/server';
import { env, isOpenRouterConfigured, isSupabaseConfigured } from '@/lib/config/env';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      config: {
        openrouter: {
          configured: isOpenRouterConfigured,
          keyPresent: Boolean(env.OPENROUTER_API_KEY),
        },
        supabase: {
          configured: isSupabaseConfigured,
          urlPresent: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
          anonKeyPresent: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        },
      },
    },
    { status: 200 },
  );
}
