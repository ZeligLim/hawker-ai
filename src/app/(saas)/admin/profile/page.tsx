'use client';

import { useAuth } from '@/components/auth-provider';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';

export default function AdminProfilePage() {
 const { user, roles, signOut } = useAuth();
 const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

 const roleLabel = roles.isSaasOwner ? 'SaaS Owner' : 'Superadmin';

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 <div className="mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">Profile</h1>
 <p className="mt-2 text-sm text-[#6e6e73]">Manage your superadmin session.</p>
 </div>

 <div className="rounded-3xl bg-white p-6 shadow-sm .04]">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-[#1d1d1f]">
 <User className="w-8 h-8" />
 </div>
 <div>
 <h2 className="text-lg font-semibold text-[#1d1d1f]">{user?.email ?? 'Superadmin'}</h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
 {roleLabel}
 </span>
 <span className="text-xs text-[#86868b]">Cross-Tenant Access</span>
 </div>
 </div>
 </div>
 </div>

 <div className="rounded-3xl bg-white p-2 shadow-sm .04]">
 <button
 type="button"
 onClick={() => setIsSignOutDialogOpen(true)}
 className="w-full flex items-center justify-between p-4 rounded-2xl text-left hover:bg-red-50 text-red-600 "
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
 <LogOut className="w-4 h-4" />
 </div>
 <span className="font-semibold text-sm">Sign Out</span>
 </div>
 </button>
 </div>

 {isSignOutDialogOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
 <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-[#1d1d1f] shadow-2xl .08] ">
 <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">Sign out of Superadmin?</h3>
 <p className="mt-2 text-xs text-[#6e6e73] leading-relaxed">
 You will be signed out from your active platform session. You will need to re-authenticate with superadmin credentials to regain access.
 </p>
 <div className="mt-6 flex items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setIsSignOutDialogOpen(false)}
 className="rounded-full px-4 py-2 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] "
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={() => {
 setIsSignOutDialogOpen(false);
 void signOut();
 }}
 className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 "
 >
 Sign out
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
