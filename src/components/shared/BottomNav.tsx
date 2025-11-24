'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, HeartPulse, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/home', icon: Home, label: 'Accueil' },
  { href: '/favorites', icon: HeartPulse, label: 'Favoris' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: Settings, label: 'Réglages' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="sticky bottom-0 bg-primary p-3">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.label} passHref>
              <Button
                variant="ghost"
                className={cn(
                  'flex flex-col items-center h-auto p-2',
                  isActive ? 'text-primary-foreground' : 'text-primary-foreground/70',
                  'hover:bg-primary/80 hover:text-primary-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className={cn('text-xs mt-1', isActive ? 'font-semibold' : 'font-normal')}>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
