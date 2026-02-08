"use client"

import {
    ChevronsUpDown,
    LogOut,
    Sparkles,
    User,
    Settings,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useRole } from "@/contexts/RoleContext"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { role, getRoleDisplay } = useRole()
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
        }
        loadData()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/auth")
    }

    const handleProfile = () => {
        navigate("/profile")
    }

    if (!user) return null

    // Use profile data if available, otherwise fallback to user metadata or defaults
    const displayName = profile?.username || profile?.full_name || user.user_metadata?.full_name || "User"
    const displayEmail = user.email
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
    const initials = (profile?.username || user.email || "U").substring(0, 2).toUpperCase()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={avatarUrl} alt={displayName} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{displayName}</span>
                                <span className="truncate text-xs">{displayEmail}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={avatarUrl} alt={displayName} />
                                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{displayName}</span>
                                    <span className="truncate text-xs">{displayEmail}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleProfile}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {getRoleDisplay()}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
