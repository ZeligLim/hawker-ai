import { notFound } from 'next/navigation';
import OrdersPage from '@/components/orders-page';
import { resolveHawkerCentreBySlug } from '@/server/services/hawker-centres/service';

type PageProps = {
 params: Promise<{ centreSlug: string }>;
 searchParams: Promise<{ table_id?: string; orderId?: string }>;
};

export default async function CentreOrdersRoute({ params, searchParams }: PageProps) {
 const [{ centreSlug }, { table_id: tableId }] = await Promise.all([params, searchParams]);
 const centre = await resolveHawkerCentreBySlug(centreSlug);

 if (!centre) notFound();

 return <OrdersPage key={`${centre.slug}:${tableId ?? ''}`} centreSlug={centre.slug} tableId={tableId ?? ''} />;
}
