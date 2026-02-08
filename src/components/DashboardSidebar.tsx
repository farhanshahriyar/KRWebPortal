import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./sidebar/TeamSwitcher";
import { NavMain } from "./sidebar/NavMain";
import { NavUser } from "./sidebar/NavUser";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function DashboardSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
      setIsOpen(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
    setOpenMobile(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm"
          onClick={toggleMobileMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">{isOpen ? "Close Menu" : "Toggle Menu"}</span>
        </Button>
      )}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavMain />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
