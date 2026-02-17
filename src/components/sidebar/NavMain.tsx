import { useState } from "react";
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
    Megaphone,
    Swords,
    Users,
    Video,
    BarChart3,
    ChevronRight,
} from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
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

const teamItems = [
    { title: "Team Home", icon: Swords, url: "/team", feature: "team.view" },
    { title: "Roster", icon: Users, url: "/team/roster", feature: "team.roster.view" },
    { title: "Matches", icon: Trophy, url: "/team/matches", feature: "team.matches.view" },
    { title: "VOD Review", icon: Video, url: "/team/vods", feature: "team.vods.view" },
    { title: "Stats", icon: BarChart3, url: "/team/stats", feature: "team.stats.view" },
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

    // Collapsible state — default open if user is on a team route
    const [platformOpen, setPlatformOpen] = useState(true);
    const [teamOpen, setTeamOpen] = useState(location.pathname.startsWith("/team"));
    const [mgmtOpen, setMgmtOpen] = useState(true);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path === "/team" && location.pathname === "/team") return true;
        return path !== "/" && path !== "/team" && location.pathname.startsWith(path);
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
            {/* Platform — collapsible group */}
            <Collapsible open={platformOpen} onOpenChange={setPlatformOpen} className="group/collapsible">
                <SidebarGroup>
                    <CollapsibleTrigger asChild>
                        <SidebarGroupLabel className="cursor-pointer select-none hover:bg-sidebar-accent/50 rounded-md transition-colors">
                            Platform
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenu>
                            {renderItems(platformItems)}
                        </SidebarMenu>
                    </CollapsibleContent>
                </SidebarGroup>
            </Collapsible>

            {/* Team KingsRock — collapsible group */}
            {teamItems.some(i => canAccess(i.feature)) && (
                <Collapsible open={teamOpen} onOpenChange={setTeamOpen} className="group/collapsible">
                    <SidebarGroup>
                        <CollapsibleTrigger asChild>
                            <SidebarGroupLabel className="cursor-pointer select-none hover:bg-sidebar-accent/50 rounded-md transition-colors">
                                <Swords className="h-4 w-4 mr-2 shrink-0" />
                                Team KingsRock
                                <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenu>
                                {renderItems(teamItems)}
                            </SidebarMenu>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            )}

            {/* Management — collapsible group */}
            {managementItems.some(i => canAccess(i.feature)) && (
                <Collapsible open={mgmtOpen} onOpenChange={setMgmtOpen} className="group/collapsible">
                    <SidebarGroup>
                        <CollapsibleTrigger asChild>
                            <SidebarGroupLabel className="cursor-pointer select-none hover:bg-sidebar-accent/50 rounded-md transition-colors">
                                Management
                                <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenu>
                                {renderItems(managementItems)}
                            </SidebarMenu>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            )}
        </>
    );
}
