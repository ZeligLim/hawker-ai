const fs = require('fs');
const file = 'components/customer/customer-shell.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  `import { getStoredTableSession } from '@/lib/table-session';`,
  `import { getStoredTableSession, type CurrentTableSession } from '@/lib/table-session';
import { useState, useEffect } from 'react';`
);

text = text.replace(
  `export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/home';
  const session = getStoredTableSession();`,
  `export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/home';
  const [session, setSession] = useState<CurrentTableSession | null>(null);

  useEffect(() => {
    // Initial load
    setSession(getStoredTableSession());

    // Listen for cross-tab or programmatic updates
    const handleStorageChange = () => {
      setSession(getStoredTableSession());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hawker-session-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hawker-session-changed', handleStorageChange);
    };
  }, [pathname]); // also re-check on pathname change just in case`
);

fs.writeFileSync(file, text);
