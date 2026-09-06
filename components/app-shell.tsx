'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, House, Menu, Store, UserRound, LayoutDashboard, UtensilsCrossed, CircleUserRound, BarChart3, Building2 } from 'lucide-react';

function HomeIcon({ active }: { active: boolean }) {
  return <House className="h-[18px] w-[18px]" strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />;
}

function MenuIcon() {
  return <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

function ShopIcon({ active }: { active: boolean }) {
  return <Store className="h-[18px] w-[18px]" strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />;
}

function OrdersIcon({ active }: { active: boolean }) {
  return <ClipboardList className="h-[18px] w-[18px]" strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />;
}

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/menu', label: 'Menu', icon: MenuIcon },
  { href: '/shop', label: 'Shop', icon: ShopIcon },
  { href: '/orders', label: 'Orders', icon: OrdersIcon },
];

const ownerNavItems = [
  { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/orders', label: 'Orders', icon: ClipboardList },
  { href: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/owner/profile', label: 'Profile', icon: CircleUserRound },
];

const shopOwnerNavItems = [
  { href: '/shop-owner/booths', label: 'Booths', icon: Store },
  { href: '/shop-owner/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/shop-owner/profile', label: 'Profile', icon: CircleUserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth');
  const isOwnerRoute = pathname.startsWith('/owner');
  const isShopOwnerRoute = pathname.startsWith('/shop-owner');
  const isStandaloneOwnerRoute = pathname === '/booths' || pathname.startsWith('/booths/') || pathname === '/analytics' || pathname.startsWith('/analytics/');

  if (isAuthRoute || isStandaloneOwnerRoute) {
    return <>{children}</>;
  }

  if (isShopOwnerRoute) {
    return (
      <>
        {children}
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] bg-[#f7f7f7]/95 px-2 py-2 backdrop-blur-xl sm:max-w-[480px] lg:max-w-[960px] lg:rounded-t-[22px] lg:bg-white/95 lg:px-4">
          <div className="grid grid-cols-3 gap-1">
            {shopOwnerNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={label}
                  href={href as any}
                  className={`flex items-center justify-center rounded-[14px] px-2 py-2 transition ${
                    active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'
                  }`}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={`flex h-8 w-8 items-center justify-center ${active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  if (isOwnerRoute) {
    return (
      <>
        {children}
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] bg-[#f7f7f7]/95 px-2 py-2 backdrop-blur-xl sm:max-w-[480px] lg:max-w-[960px] lg:rounded-t-[22px] lg:bg-white/95 lg:px-4">
          <div className="grid grid-cols-4 gap-1">
            {ownerNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={label}
                  href={href as any}
                  className={`flex items-center justify-center rounded-[14px] px-2 py-2 transition ${
                    active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'
                  }`}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={`flex h-8 w-8 items-center justify-center ${active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] bg-[#f7f7f7]/95 px-2 py-2 backdrop-blur-xl sm:max-w-[480px] lg:max-w-[960px] lg:rounded-t-[22px] lg:bg-white/95 lg:px-4">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={label}
                href={href as any}
                className={`flex items-center justify-center rounded-[14px] px-2 py-2 transition ${
                  active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <span className={`flex h-8 w-8 items-center justify-center ${active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                  <Icon active={active} />
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
