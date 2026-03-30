import Providers from "./providers";
import AdminSidebar from "../../../features/admin/shared/components/AdminSidebarHover";
import AdminContentShell from "./shell";
import { AdminHistoryProtection } from "../../../features/admin/shared/components/AdminHistoryProtection";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="force-light">
      <Providers>
        <AdminHistoryProtection />
        <AdminSidebar />
        <AdminContentShell>{children}</AdminContentShell>
      </Providers>
    </div>
  );
}
