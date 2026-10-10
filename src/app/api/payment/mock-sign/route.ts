import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_MOCK_PAYMENT) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.text();
    const signature = crypto.createHmac('sha256', process.env.MOCK_WEBHOOK_SECRET || 'test-secret')
      .update(body)
      .digest('hex');
      
    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json({ error: 'Signing failed' }, { status: 500 });
  }
}
