export const VEHICLE_TYPES = [
  'SUV',
  'Berline',
  'Luxe',
  'Pickup',
  'Minibus',
  'Grand car',
  'Bus',
  'Camion',
  'Camion benne',
  'Remorque',
  'Fourgonnette',
  'Utilitaire',
  'Moto',
  'Autre',
].sort((a, b) => a.localeCompare(b, 'fr'));

export function normalizeVehicleType(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

export function getVehicleTypeFromListing(listing: Record<string, any>) {
  return listing.vehicleType || listing.type || listing.category || listing.bodyType || '';
}
