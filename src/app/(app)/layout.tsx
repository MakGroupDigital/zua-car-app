import { BottomNav } from '@/components/shared/BottomNav';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 pb-[76px] overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
