import { NextRequest, NextResponse } from 'next/server';
import { Airwallex } from '@airwallex/node-sdk';

export async function POST(request: NextRequest) {
 try {
 const { amount, currency = 'MYR', merchantOrderId } = await request.json();

 if (!process.env.AIRWALLEX_CLIENT_ID || !process.env.AIRWALLEX_API_KEY) {
 return NextResponse.json({ 
 error: 'AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY must be set in .env.local' 
 }, { status: 500 });
 }

 const airwallex = new Airwallex({
 clientId: process.env.AIRWALLEX_CLIENT_ID,
 apiKey: process.env.AIRWALLEX_API_KEY,
 env: 'demo',
 });

 const origin = request.headers.get('origin') || 'http://localhost:3000';

 const response = await airwallex.post('/api/v1/pa/payment_intents/create', {
 request_id: crypto.randomUUID(),
 amount: amount,
 currency: currency,
 merchant_order_id: merchantOrderId || `order_${Date.now()}`,
 return_url: `${origin}/orders`,
 });

 return NextResponse.json(response);
 } catch (error: any) {
 console.error('Airwallex Payment Intent Error:', error);
 return NextResponse.json({ 
 error: error.message || 'Failed to create payment intent' 
 }, { status: 500 });
 }
}
