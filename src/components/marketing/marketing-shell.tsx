'use client';

import React from 'react';
import { MarketingNav } from '@/components/marketing-nav';

export function MarketingShell({ children }: { children: React.ReactNode }) {
 return (
 <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
 <MarketingNav />
 <main>{children}</main>
 </div>
 );
}
