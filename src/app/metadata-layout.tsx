import type { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';

export const metadata: Metadata = defaultMetadata;

export default function MetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
