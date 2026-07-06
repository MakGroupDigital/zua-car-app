'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Home, HeartPulse, MessageCircle, Plus, ShieldCheck, Tag, KeyRound, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const navItems = [
  { href: '/home', icon: Home, label: 'Accueil', shape: 'wide' },
  { href: '/favorites', icon: HeartPulse, label: 'Favoris', shape: 'circle' },
  { href: '/messages', icon: MessageCircle, label: 'Chat', shape: 'circle' },
  { href: '/profile', icon: UserRound, label: 'Profil', shape: 'wide' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOptionClick = (href: string) => {
    setIsDialogOpen(false);
    router.push(href);
  };

  return (
    <>
      <footer className="fixed inset-x-0 bottom-4 z-50 px-4 pointer-events-none">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-[2rem] border border-white/50 bg-background/75 p-2 shadow-2xl shadow-primary/20 backdrop-blur-2xl pointer-events-auto">
          <div className="flex flex-1 items-center gap-2">
            {navItems.slice(0, 2).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isWide = item.shape === 'wide';

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={cn(isWide ? 'flex-[1.4]' : 'flex-none')}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center gap-2 transition-all duration-300',
                      isWide ? 'h-12 rounded-full px-4' : 'h-12 w-12 rounded-full',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                        : 'bg-card/80 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isWide && <span className="text-xs font-bold">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          <Button
            onClick={() => setIsDialogOpen(true)}
            size="icon"
            className="h-16 w-16 shrink-0 rounded-[1.5rem] bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground shadow-2xl shadow-primary/30 ring-4 ring-background transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-7 w-7" />
          </Button>

          <div className="flex flex-1 items-center justify-end gap-2">
            {navItems.slice(2).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isWide = item.shape === 'wide';

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={cn(isWide ? 'flex-[1.4]' : 'flex-none')}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center gap-2 transition-all duration-300',
                      isWide ? 'h-12 rounded-full px-4' : 'h-12 w-12 rounded-full',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                        : 'bg-card/80 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isWide && <span className="text-xs font-bold">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </footer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-white/50 bg-card/95 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Créer une offre
            </DialogTitle>
            <DialogDescription>
              Choisissez ce que vous voulez publier sur AUTONEX.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              onClick={() => handleOptionClick('/vehicleRentalListings')}
              className="h-32 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent p-4 text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex h-full flex-col items-start justify-between text-left">
                <div className="rounded-full bg-primary-foreground/20 p-3">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Louer</h3>
                  <p className="text-xs text-primary-foreground/85">Trouver une location</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionClick('/vehicles')}
              className="h-32 rounded-[1.5rem] bg-card p-4 text-primary shadow-xl shadow-primary/10 ring-1 ring-primary/15 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
            >
              <div className="flex h-full flex-col items-start justify-between text-left">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-3">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Acheter</h3>
                  <p className="text-xs text-muted-foreground">Voir les offres</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionClick('/dashboard/vente/nouveau')}
              className="h-32 rounded-[1.5rem] bg-card p-4 text-primary shadow-xl shadow-primary/10 ring-1 ring-primary/15 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
            >
              <div className="flex h-full flex-col items-start justify-between text-left">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-3">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Vendre</h3>
                  <p className="text-xs text-muted-foreground">Publier un véhicule</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionClick('/insuranceProviders')}
              className="h-32 rounded-full bg-card p-4 text-primary shadow-xl shadow-primary/10 ring-1 ring-primary/15 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
            >
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-3">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Assurance</h3>
                  <p className="text-xs text-muted-foreground">Demander un devis</p>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
