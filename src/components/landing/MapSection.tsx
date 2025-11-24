'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

type MapSectionProps = {
  content: {
    title: string;
    subtitle: string;
  }
}

const locations = [
  { id: 'kinshasa_gombe', name: 'Zua-Car Gombe', position: { lat: -4.316, lng: 15.308 } },
  { id: 'kinshasa_limete', name: 'Zua-Car Limete', position: { lat: -4.370, lng: 15.345 } },
  { id: 'lubumbashi_centre', name: 'Zua-Car Lubumbashi', position: { lat: -11.660, lng: 27.479 } },
];

export default function MapSection({ content }: MapSectionProps) {
  // IMPORTANT: You must create a .env.local file in the root of your project
  // and add your Google Maps API key like this:
  // NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <section id="map" className="py-20 md:py-32 bg-muted">
        <div className="container text-center">
           <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">{content.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
          <div className="mt-12 flex h-[500px] w-full items-center justify-center rounded-lg border border-dashed bg-background shadow-inner">
            <div className="text-center text-foreground/60">
              <p>Google Maps API Key is missing.</p>
              <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="map" className="py-20 md:py-32 bg-muted">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">{content.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: -4.325, lng: 15.322 }}
              defaultZoom={11}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapId={'zua-car-map'}
            >
              {locations.map(location => (
                <AdvancedMarker key={location.id} position={location.position} title={location.name}>
                   <MapPin className="h-10 w-10 text-accent drop-shadow-md" />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>
      </div>
    </section>
  );
}
