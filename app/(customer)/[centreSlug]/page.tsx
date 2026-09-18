import { notFound } from 'next/navigation';
import { resolveHawkerCentreBySlug, RESERVED_CENTRE_SLUGS } from '@/lib/hawker-centres/service';
import { CentreDinerPage } from '@/components/centre-diner-page';

interface PageProps {
  params: Promise<{ centreSlug: string }>;
}

export default async function DynamicCentrePage({ params }: PageProps) {
  const { centreSlug } = await params;
  if (!centreSlug || RESERVED_CENTRE_SLUGS.has(centreSlug.toLowerCase())) {
    notFound();
  }

  const centre = await resolveHawkerCentreBySlug(centreSlug);
  if (!centre) {
    notFound();
  }

  return <CentreDinerPage centre={centre} />;
}
