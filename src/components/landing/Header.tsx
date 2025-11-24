import Link from "next/link";
import { Car, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type HeaderProps = {
  content: {
    logo: string;
    nav: { label: string; href: string; }[];
    language: string;
    cta: string;
  }
}

export default function Header({ content }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">{content.logo}</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
          {content.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">{content.language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="?lang=en">English</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="?lang=fr">Français</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild className="hidden lg:flex" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
            <Link href="#contact">{content.cta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
