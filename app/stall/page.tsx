import { redirect } from 'next/navigation';

export default function StallRootPage() {
  redirect('/owner/orders');
}
