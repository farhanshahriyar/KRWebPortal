import * as React from "react"
import { ChevronsUpDown, ShieldCheck } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useRole } from "@/contexts/RoleContext"

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const { role, userRole, setRole, getRoleDisplay } = useRole()

    // Only admins can switch roles - check original DB role, not active role
    const isAdmin = userRole === "kr_admin"

    const roles = [
        {
            name: "KR Admin",
            value: "kr_admin",
            logo: ShieldCheck,
            plan: "Enterprise",
        },
        {
            name: "KR Manager",
            value: "kr_manager",
            logo: ShieldCheck,
            plan: "Team",
        },
        {
            name: "KR Member",
            value: "kr_member",
            logo: ShieldCheck,
            plan: "Personal",
        },
    ] as const

    const activeRole = roles.find((r) => r.value === role) || roles[2]

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!isAdmin}>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <activeRole.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold uppercase tracking-wider">
                                    KingsRock Portal
                                </span>
                                <span className="truncate text-xs">{activeRole.name}</span>
                            </div>
                            {isAdmin && <ChevronsUpDown className="ml-auto" />}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {isAdmin && (
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Switch Role (Admin Only)
                            </DropdownMenuLabel>
                            {roles.map((r, index) => (
                                <DropdownMenuItem
                                    key={r.name}
                                    onClick={() => setRole(r.value as any)}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <r.logo className="size-4 shrink-0" />
                                    </div>
                                    {r.name}
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
