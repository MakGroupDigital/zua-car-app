'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, HeartPulse, MessageCircle, Settings, Plus, Tag, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const navItems = [
  { href: '/home', icon: Home, label: 'Accueil' },
  { href: '/favorites', icon: HeartPulse, label: 'Favoris' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: Settings, label: 'Réglages' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOptionClick = (href: string) => {
    setIsDialogOpen(false);
    router.push(href);
  };

  // Séparer les items en deux groupes (2 à gauche, 2 à droite)
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <>
      <footer className="sticky bottom-0 bg-primary p-3 z-50 shadow-2xl border-t border-primary/20">
        <div className="flex items-center justify-around relative">
          {/* Items de gauche */}
          <div className="flex items-center justify-around flex-1">
            {leftItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.label} passHref className="flex-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex flex-col items-center h-auto p-2 w-full',
                      isActive ? 'text-primary-foreground' : 'text-primary-foreground/70',
                      'hover:bg-primary/80 hover:text-primary-foreground transition-all duration-300'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className={cn('text-xs mt-1', isActive ? 'font-semibold' : 'font-normal')}>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
          
          {/* Bouton Plus au centre */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10 group">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className={cn(
                "h-16 px-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2",
                "bg-gradient-to-br from-accent via-accent to-accent/80",
                "text-accent-foreground border-4 border-background",
                "hover:from-accent/90 hover:via-accent/90 hover:to-accent/70",
                "hover:scale-110 hover:shadow-3xl",
                "animate-pulse hover:animate-none"
              )}
            >
              {(() => {
                const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
                if (logoImage) {
                  return (
                    <>
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image 
                          src={logoImage.imageUrl} 
                          alt="Logo" 
                          fill 
                          className="object-cover"
                          data-ai-hint={logoImage.imageHint}
                        />
                      </div>
                      <Plus className="h-6 w-6 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
                    </>
                  );
                }
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">Z</span>
                    </div>
                    <Plus className="h-6 w-6 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
                  </>
                );
              })()}
            </Button>
          </div>

          {/* Items de droite */}
          <div className="flex items-center justify-around flex-1">
            {rightItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
                <Link href={item.href} key={item.label} passHref className="flex-1">
              <Button
                variant="ghost"
                className={cn(
                      'flex flex-col items-center h-auto p-2 w-full',
                  isActive ? 'text-primary-foreground' : 'text-primary-foreground/70',
                      'hover:bg-primary/80 hover:text-primary-foreground transition-all duration-300'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className={cn('text-xs mt-1', isActive ? 'font-semibold' : 'font-normal')}>{item.label}</span>
              </Button>
            </Link>
          );
        })}
          </div>
      </div>
    </footer>

      {/* Dialog pour choisir le type d'offre */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-2 border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Créer une nouvelle offre
            </DialogTitle>
            <DialogDescription>
              Choisissez le type d'offre que vous souhaitez créer
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              onClick={() => handleOptionClick('/dashboard/vente/nouveau')}
              className={cn(
                "h-auto p-6 flex flex-col items-center gap-4",
                "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
                "text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              )}
            >
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                <Tag className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">Vendre un véhicule</h3>
                <p className="text-sm text-white/90">Mettez votre véhicule en vente</p>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionClick('/vehicleRentalListings/nouveau')}
              className={cn(
                "h-auto p-6 flex flex-col items-center gap-4",
                "bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
                "text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              )}
            >
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                <KeyRound className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">Louer un véhicule</h3>
                <p className="text-sm text-white/90">Proposez votre véhicule à la location</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
