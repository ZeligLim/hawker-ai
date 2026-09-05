import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  const { data: dish, error: dishError } = await auth.client.from('dishes').select('id, food_outlet_id').eq('id', id).maybeSingle();
  if (dishError) return NextResponse.json({ error: dishError.message }, { status: 500 });
  if (!dish) return NextResponse.json({ error: 'Dish not found.' }, { status: 404 });

  const { data: membership } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', dish.food_outlet_id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are supported.' }, { status: 400 });
  if (file.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'Images must be 5 MB or smaller.' }, { status: 400 });

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${dish.food_outlet_id}/${id}-${Date.now()}.${extension}`;
  const { error: uploadError } = await auth.client.storage.from('dish-images').upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: publicUrl } = auth.client.storage.from('dish-images').getPublicUrl(path);
  const { error: updateError } = await auth.client.from('dishes').update({ image_url: publicUrl.publicUrl }).eq('id', id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ imageUrl: publicUrl.publicUrl });
}
