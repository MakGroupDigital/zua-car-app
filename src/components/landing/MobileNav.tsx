import Link from "next/link";
import { ServiceIcons } from "@/components/icons/ServiceIcons";
import { MapPin, MessageSquareQuote, Mail } from "lucide-react";

type MobileNavProps = {
  content: {
    nav: { label: string; href: string; }[];
  }
}

const icons = {
  '#services': ServiceIcons.Garage, // Utilise notre icône garage personnalisée
  '#map': MapPin,
  '#testimonials': MessageSquareQuote,
  '#contact': Mail,
}

export default function MobileNav({ content }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border/40 backdrop-blur-sm bg-background/95">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {content.nav.map((item) => {
          const Icon = icons[item.href as keyof typeof icons] || ServiceIcons.Garage;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group transition-colors duration-200"
            >
              <div className="mb-1 transition-transform duration-200 group-hover:scale-110">
                <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors duration-200">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
