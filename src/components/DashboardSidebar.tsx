
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useRole } from "@/contexts/RoleContext";
import { RoleFeaturesDropdown } from "./sidebar/RoleFeaturesDropdown";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function DashboardSidebar() {
  const { getRoleDisplay } = useRole();
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
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex flex-col">
                <span className="font-bold text-xl">KingsRock Portal</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-normal opacity-70">{getRoleDisplay()}</span>
                  <RoleFeaturesDropdown />
                </div>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-5">
              <SidebarNavigation />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
