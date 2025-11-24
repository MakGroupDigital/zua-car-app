import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type HeroProps = {
  content: {
    super: string;
    title: string;
    subtitle: string;
    cta: string;
  }
}

export default function Hero({ content }: HeroProps) {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <section id="hero" className="relative w-full h-[80vh] min-h-[600px] max-h-[1080px]">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="relative z-10 flex h-full items-end justify-center text-center text-white">
        <div className="container pb-16 md:pb-24 max-w-4xl">
          <p className="mb-2 font-semibold text-accent">{content.super}</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            {content.title}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-200">
            {content.subtitle}
          </p>
          <div className="mt-10">
            <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="#services">{content.cta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
