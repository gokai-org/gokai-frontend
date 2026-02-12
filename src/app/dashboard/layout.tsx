import Providers from "./providers";
import SidebarOnly from "@/shared/components/SidebarHover";
import ContentShell from "./shell";
import { HistoryProtection } from "@/features/dashboard/components/HistoryProtection";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <HistoryProtection />
      <SidebarOnly />
      <ContentShell>{children}</ContentShell>
    </Providers>
  );
}