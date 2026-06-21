import { BottomNav } from '@/components/shared/BottomNav';
import { FloatingTopBar } from '@/components/shared/FloatingTopBar';
import { GlobalNotificationListener } from '@/components/notifications/global-notification-listener';
import { FCMInitializer } from '@/components/fcm/fcm-initializer';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      <FCMInitializer />
      <GlobalNotificationListener />
      <FloatingTopBar />
      <main className="flex-1 pt-[96px] pb-[100px] overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
