import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRole } from "@/contexts/RoleContext";

interface RoleFeatures {
  [key: string]: string[];
}

const roleFeatures: RoleFeatures = {
  kr_admin: [
    "All Features",
    "Full access to Dashboard",
    // "Create/Edit Announcements",
    "Manage Attendance",
    "Manage NOCs",
    "Manage Leaves",
    "Manage Members",
    "Manage Users Reports",
    "Manage Update Logs",
  ],
  kr_manager: [
    "Limited Dashboard Access",
    "View Announcements",
    "Manage Attendance",
    "View NOC",
    "View Members",
    "View Tournaments",
    "Manage Schedule",
  ],
  kr_member: [
    "Limited Dashboard Access",
    "Manage Attendance",
    "View/Request NOC",
    "View/Request Leave",
    "View Updatelogs",
  ],
};

export function RoleFeaturesDropdown() {
  const { role } = useRole();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{role} Role Features</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roleFeatures[role].map((feature, index) => (
          <DropdownMenuItem key={index} className="text-xs">
            {feature}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}