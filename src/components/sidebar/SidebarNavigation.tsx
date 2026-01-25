import { Home, Users, Calendar, FileText, Megaphone, Trophy, Clock, CalendarRange, History, Plus, UserCog, CalendarCheck, User, ClipboardEdit } from "lucide-react"; // Other icons
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSubMenu, useSidebar } from "@/components/ui/sidebar";
import { useRole } from "@/contexts/RoleContext";

// Menu items for sidebar navigation
const menuItems = [
  { title: "Dashboard", icon: Home, path: "/", feature: "dashboard" },
  { title: "Attendance", icon: Calendar, path: "/attendance", feature: "attendance" },
  { title: "NOC List", icon: FileText, path: "/noc", feature: "noc" },
  { title: "Leave Request", icon: FileText, path: "/leave-request", feature: "leave_request" },
  { title: "Tournament Schedule", icon: Trophy, path: "/tournaments", feature: "tournaments.view" },
  { title: "Manage Attendence List", icon: CalendarCheck, path: "/manage-attendence", feature: "manage_attendence" },
  { title: "Manage Members", icon: User, path: "/manage-members", feature: "manage_members" },
  { title: "Manage Passwords", icon: User, path: "/manage-passwords", feature: "manage_passwords" },
  { title: "Manage User Reports", icon: UserCog, path: "/manage-user-reports", feature: "manage_user-reports" },
  { title: "Manage Update Logs", icon: ClipboardEdit, path: "/manage-logs", feature: "manage_update_logs" },
  { title: "Update Logs", icon: History, path: "/update-logs", feature: "update_logs" },
];

export function SidebarNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess } = useRole();
  const { setOpenMobile, isMobile } = useSidebar();

  const isPathActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    return path !== "/" && location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        canAccess(item.feature) && (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              className={`${isPathActive(item.path) ? "bg-accent" : "hover:bg-accent"
                } transition duration-300 ease-in-out`} // Apply bg-accent or hover effect
              onClick={() => handleNavigation(item.path)}
              tooltip={item.title}
            >
              <item.icon className="w-4 h-4 mr-2" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      ))}
    </SidebarMenu>
  );
}
