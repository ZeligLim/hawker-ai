import { LoaderCircle } from 'lucide-react';

export function PageLoader({ text = 'Loading…', fullHeight = true }: { text?: string; fullHeight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-[#86868b] ${fullHeight ? 'min-h-[50vh] h-full' : 'py-12'}`}>
      <LoaderCircle className="h-8 w-8 animate-spin text-black" />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
}
