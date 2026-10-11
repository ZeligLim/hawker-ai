import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-[#86868b]">
      <LoaderCircle className="h-8 w-8 animate-spin text-black" />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}
