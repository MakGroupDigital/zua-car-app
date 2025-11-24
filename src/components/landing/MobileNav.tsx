import Link from "next/link";
import { Wrench, MapPin, MessageSquareQuote, Mail } from "lucide-react";

type MobileNavProps = {
  content: {
    nav: { label: string; href: string; }[];
  }
}

const icons = {
  '#services': Wrench,
  '#map': MapPin,
  '#testimonials': MessageSquareQuote,
  '#contact': Mail,
}

export default function MobileNav({ content }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border/40">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {content.nav.map((item) => {
          const Icon = icons[item.href as keyof typeof icons] || Wrench;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group"
            >
              <Icon className="w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary" />
              <span className="text-xs text-muted-foreground group-hover:text-primary">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
