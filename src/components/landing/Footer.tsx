import { Car, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

type FooterProps = {
  content: {
    copyright: string;
    credits: string;
  }
}

export default function Footer({ content }: FooterProps) {
  return (
    <footer className="bg-muted">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-accent" />
            <span className="font-bold">Zua-Car</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">{content.credits}</p>
          <div className="flex gap-4">
            <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          {content.copyright}
        </div>
      </div>
    </footer>
  );
}
