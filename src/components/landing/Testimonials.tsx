'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star } from "lucide-react";

type TestimonialsProps = {
  content: {
    title: string;
    subtitle: string;
    items: {
      name: string;
      location: string;
      quote: string;
    }[];
  }
}

const avatarIds = ['avatar-1', 'avatar-2', 'avatar-3'];

export default function Testimonials({ content }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-card">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">{content.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {content.items.map((testimonial, index) => {
              const avatar = PlaceHolderImages.find(p => p.id === avatarIds[index]);
              return(
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col justify-between shadow-lg transition-all hover:shadow-xl">
                    <CardContent className="p-6 text-center flex-1 flex flex-col items-center">
                      <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                        {avatar && (
                           <AvatarImage src={avatar.imageUrl} alt={testimonial.name} data-ai-hint={avatar.imageHint} />
                        )}
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      <div className="flex justify-center my-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                        ))}
                      </div>
                      <blockquote className="mt-2 text-foreground/80 italic">
                        “{testimonial.quote}”
                      </blockquote>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )})}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
