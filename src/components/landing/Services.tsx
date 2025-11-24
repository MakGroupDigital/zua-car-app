import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, HeartHandshake, Car } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type ServicesProps = {
  content: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      description: string;
    }[];
  }
}

const icons = [Wrench, HeartHandshake, Car];
const imageIds = ['service-maintenance', 'service-repair', 'service-sales'];

export default function Services({ content }: ServicesProps) {
  return (
    <section id="services" className="py-20 md:py-32 bg-card">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">{content.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {content.items.map((service, index) => {
            const Icon = icons[index];
            const image = PlaceHolderImages.find(p => p.id === imageIds[index]);
            return (
              <Card key={index} className="flex flex-col overflow-hidden text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                {image && (
                  <div className="relative h-56 w-full">
                    <Image
                      src={image.imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-accent">
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
