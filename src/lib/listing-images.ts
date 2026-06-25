import { PlaceHolderImages } from '@/lib/placeholder-images';

type ImageLike =
  | string
  | {
      secure_url?: string;
      secureUrl?: string;
      url?: string;
      imageUrl?: string;
      src?: string;
      path?: string;
    }
  | null
  | undefined;

function normalizeImageValue(value: ImageLike): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  return (
    value.secure_url ||
    value.secureUrl ||
    value.url ||
    value.imageUrl ||
    value.src ||
    value.path ||
    null
  );
}

export function getListingImageUrls(listing: Record<string, any> | null | undefined): string[] {
  if (!listing) return [];

  const candidates = [
    listing.imageUrls,
    listing.images,
    listing.photos,
    listing.pictures,
    listing.gallery,
    listing.cloudinaryImages,
    listing.cloudinaryUrls,
  ];

  const urls: string[] = [];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const url = normalizeImageValue(item);
        if (url) urls.push(url);
      }
    }
  }

  for (const candidate of [listing.imageUrl, listing.photoUrl, listing.thumbnailUrl, listing.coverImage, listing.cloudinaryUrl]) {
    const url = normalizeImageValue(candidate);
    if (url) urls.push(url);
  }

  return Array.from(new Set(urls));
}

export function getListingPrimaryImage(listing: Record<string, any> | null | undefined, fallbackId = 'car-tesla-model-3'): string | null {
  return getListingImageUrls(listing)[0] || PlaceHolderImages.find((p) => p.id === fallbackId)?.imageUrl || null;
}
