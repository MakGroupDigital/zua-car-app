import type { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';
import ClientLayout from './client-layout';

export const metadata: Metadata = defaultMetadata;

export default function MetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}