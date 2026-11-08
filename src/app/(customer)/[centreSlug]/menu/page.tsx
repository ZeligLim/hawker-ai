import { notFound } from 'next/navigation';
import { MenuPage } from '@/components/menu-page';
import { resolveHawkerCentreBySlug } from '@/server/services/hawker-centres/service';

type PageProps = {
 params: Promise<{ centreSlug: string }>;
 searchParams: Promise<{ table_id?: string }>;
};

export default async function CentreMenuRoute({ params, searchParams }: PageProps) {
 const [{ centreSlug }, { table_id: tableId }] = await Promise.all([params, searchParams]);
 const centre = await resolveHawkerCentreBySlug(centreSlug);

 if (!centre) notFound();

 return <MenuPage key={`${centre.slug}:${tableId ?? ''}`} centreSlug={centre.slug} tableId={tableId ?? ''} />;
}
