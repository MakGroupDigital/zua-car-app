import { BottomNav } from '@/components/shared/BottomNav';
import { GlobalNotificationListener } from '@/components/notifications/global-notification-listener';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      <GlobalNotificationListener />
      <main className="flex-1 pb-[100px] overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
