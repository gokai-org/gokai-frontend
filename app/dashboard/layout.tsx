import Providers from "./providers";
import SidebarOnly from "@/components/navigation/SidebarHover";
import ContentShell from "./shell";
import { HistoryProtection } from "@/components/dashboard/HistoryProtection";

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