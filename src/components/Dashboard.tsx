import { useRole } from "@/contexts/RoleContext";
import AdminDashboard from "@/admin-dashboard/AdminDashboard";
import Index from "@/pages/Index";

/**
 * Smart Dashboard component that renders different dashboards based on user role.
 * - Admins see the Admin Dashboard with system-wide stats
 * - Members see the regular dashboard with their personal stats
 */
export function Dashboard() {
    const { role } = useRole();

    // Show Admin Dashboard for admins, regular dashboard for others
    if (role === "kr_admin") {
        return <AdminDashboard />;
    }

    return <Index />;
}
