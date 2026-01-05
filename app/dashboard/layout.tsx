import Providers from "./providers";
import SidebarOnly from "@/components/navigation/SidebarHover";
import ContentShell from "./shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <SidebarOnly />
      <ContentShell>{children}</ContentShell>
    </Providers>
  );
}