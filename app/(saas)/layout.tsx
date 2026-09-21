import React from 'react';
import type { Metadata } from 'next';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
 title: 'SaaS Platform Admin | Hawker',
 description: 'SaaS Superadmin control plane for monetization and venue management.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 return (
 <AdminGuard>
 <AdminShell>{children}</AdminShell>
 </AdminGuard>
 );
}
