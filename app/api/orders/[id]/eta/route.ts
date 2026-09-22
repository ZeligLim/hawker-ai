import { NextRequest, NextResponse } from 'next/server';
import { createRequestSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createRequestSupabaseClient(request);
  if (!supabase) return NextResponse.json({ eta: '10-15 mins' });

  try {
    const { data: merchantOrders } = await supabase
      .from('merchant_orders')
      .select('food_outlet_id, status')
      .eq('order_id', id);

    if (!merchantOrders || merchantOrders.length === 0) {
      return NextResponse.json({ eta: '10-15 mins' });
    }

    let maxEtaMinutes = 5;

    for (const mo of merchantOrders) {
      if (mo.status === 'served' || mo.status === 'ready' || mo.status === 'cancelled') continue;

      // 1. Get queue size ahead of this order for this stall
      const { count } = await supabase
        .from('merchant_orders')
        .select('*', { count: 'exact', head: true })
        .eq('food_outlet_id', mo.food_outlet_id)
        .in('status', ['waiting', 'preparing', 'new', 'New']);

      const queueSize = count || 0;

      // 2. Get historical average time for last 10 completed orders
      const { data: history } = await supabase
        .from('merchant_orders')
        .select('created_at, updated_at')
        .eq('food_outlet_id', mo.food_outlet_id)
        .eq('status', 'served')
        .order('updated_at', { ascending: false })
        .limit(10);

      let avgSeconds = 180; // default 3 mins
      if (history && history.length > 0) {
        let totalSeconds = 0;
        let validRecords = 0;
        for (const h of history) {
          const created = new Date(h.created_at).getTime();
          const updated = new Date(h.updated_at).getTime();
          if (updated > created) {
            totalSeconds += (updated - created) / 1000;
            validRecords++;
          }
        }
        if (validRecords > 0) {
          avgSeconds = totalSeconds / validRecords;
        }
      }

      // Calculate ETA based on queue size * historical average
      // Add a base buffer of 2 mins for the current item
      const stallEta = 2 + Math.ceil((queueSize * avgSeconds) / 60);
      maxEtaMinutes = Math.max(maxEtaMinutes, stallEta);
    }

    const minRange = maxEtaMinutes;
    const maxRange = maxEtaMinutes + 5;
    
    return NextResponse.json({ eta: `${minRange}-${maxRange} mins` });
  } catch (error) {
    return NextResponse.json({ eta: '10-15 mins' });
  }
}
