import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireRequestUser } from '@/lib/supabase/server';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  const { data: dish, error: dishError } = await auth.client.from('dishes').select('id, food_outlet_id').eq('id', id).maybeSingle();
  if (dishError) return NextResponse.json({ error: dishError.message }, { status: 500 });
  if (!dish) return NextResponse.json({ error: 'Dish not found.' }, { status: 404 });

  let isAuthorized = false;
  const { data: membership } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', dish.food_outlet_id)
    .maybeSingle();

  if (membership) {
    isAuthorized = true;
  } else {
    const { data: outlet } = await auth.client
      .from('food_outlets')
      .select('restaurant_id')
      .eq('id', dish.food_outlet_id)
      .maybeSingle();

    if (outlet?.restaurant_id) {
      const { data: restMembership } = await auth.client
        .from('restaurant_memberships')
        .select('id, role')
        .eq('user_id', auth.user.id)
        .eq('restaurant_id', outlet.restaurant_id)
        .maybeSingle();

      if (restMembership && ['owner', 'manager'].includes(restMembership.role)) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are supported.' }, { status: 400 });
  if (file.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'Images must be 5 MB or smaller.' }, { status: 400 });

  const adminClient = createAdminClient();
  const storageClient = adminClient || auth.client;
  let finalImageUrl: string | null = null;

  try {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${dish.food_outlet_id}/${id}-${Date.now()}.${extension}`;
    const { error: uploadError } = await storageClient.storage.from('dish-images').upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

    if (!uploadError) {
      const { data: publicUrl } = storageClient.storage.from('dish-images').getPublicUrl(path);
      finalImageUrl = publicUrl.publicUrl;
    } else {
      console.warn('Storage upload notice, falling back to data URI:', uploadError.message);
      const buffer = Buffer.from(await file.arrayBuffer());
      finalImageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }
  } catch (err) {
    console.warn('Storage upload exception, falling back to data URI:', err);
    const buffer = Buffer.from(await file.arrayBuffer());
    finalImageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
  }

  const { error: updateError } = await (adminClient || auth.client)
    .from('dishes')
    .update({ image_url: finalImageUrl })
    .eq('id', id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ imageUrl: finalImageUrl });
}
