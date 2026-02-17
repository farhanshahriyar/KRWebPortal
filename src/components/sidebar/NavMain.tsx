import {
    Home,
    Calendar,
    FileText,
    Trophy,
    CalendarCheck,
    User,
    UserCog,
    ClipboardEdit,
    History,
    Crosshair,
    Megaphone
} from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";

// Define menu structure with groups
const platformItems = [
    { title: "Dashboard", icon: Home, url: "/", feature: "dashboard" },
    { title: "Announcements", icon: Megaphone, url: "/announcements", feature: "announcement" },
    { title: "Attendance", icon: Calendar, url: "/attendance", feature: "attendance" },
    { title: "NOC List", icon: FileText, url: "/noc", feature: "noc" },
    { title: "Leave Request", icon: FileText, url: "/leave-request", feature: "leave_request" },
    { title: "Valorant Stats", icon: Crosshair, url: "/valorant-stats", feature: "valorant_stats" },
    { title: "Update Logs", icon: History, url: "/update-logs", feature: "update_logs" },
];

const managementItems = [
    { title: "Manage Announcements", icon: Megaphone, url: "/manage-announcements", feature: "manage_announcements" },
    { title: "Manage Valorant Stats", icon: Crosshair, url: "/manage-valorant-stats", feature: "manage_valorant_stats" },
    { title: "Tournament Schedule", icon: Trophy, url: "/tournaments", feature: "tournaments.view" },
    { title: "Manage Attendence", icon: CalendarCheck, url: "/manage-attendence", feature: "manage_attendence" },
    { title: "Manage Members", icon: User, url: "/manage-members", feature: "manage_members" },
    { title: "Manage Passwords", icon: User, url: "/manage-passwords", feature: "manage_passwords" },
    { title: "Manage User Reports", icon: UserCog, url: "/manage-user-reports", feature: "manage_user-reports" },
    { title: "Manage Update Logs", icon: ClipboardEdit, url: "/manage-logs", feature: "manage_update_logs" },
];

export function NavMain() {
    const navigate = useNavigate();
    const location = useLocation();
    const { canAccess } = useRole();
    const { setOpenMobile, isMobile } = useSidebar();

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true;
        return path !== "/" && location.pathname.startsWith(path);
    };

    const renderItems = (items: typeof platformItems) => {
        return items.map((item) => {
            if (!canAccess(item.feature)) return null;

            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => handleNavigation(item.url)}
                        isActive={isActive(item.url)}
                        className="group"
                    >
                        {item.icon && <item.icon className="transition-transform duration-200 group-hover:scale-110" />}
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
    };

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    {renderItems(platformItems)}
                </SidebarMenu>
            </SidebarGroup>

            {/* Only show management group if user has access to at least one item */}
            {managementItems.some(i => canAccess(i.feature)) && (
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarMenu>
                        {renderItems(managementItems)}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    );
}
