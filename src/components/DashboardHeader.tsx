
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { NotificationsButton } from "@/components/ui/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userFullName, setUserFullName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("--");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");

        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setUserFullName(profile.full_name);
          const initials = profile.full_name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase();
          setUserInitials(initials);
          // Set avatar image URL
          if (profile.avatar_url) {
            setUserAvatar(profile.avatar_url);
          }
        }
      }
    };

    fetchUserProfile();


    // Listen for realtime changes to the profile
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
        },
        async (payload) => {
          if (payload.new.full_name) {
            setUserFullName(payload.new.full_name);
            const initials = payload.new.full_name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase();
            setUserInitials(initials);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Close dialog after search is executed
      setOpen(false);
      // Reset search query
      setSearchQuery("");
    }
  }, [searchQuery]);

  // Add handler for search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add handler for search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Mock search results - replace with actual data later
  const searchResults = [
    {
      group: "Pages",
      items: [
        { title: "Dashboard", href: "/" },
        { title: "Attendance", href: "/attendance" },
        { title: "NOC List", href: "/noc" },
        { title: "Members", href: "/members" },
        { title: "Update Logs", href: "/update-logs" },
        { title: "Leave Request", href: "/leave-request" },
        { title: "Profile", href: "/profile" },
        { title: "Settings", href: "/settings" },
      ],
    },
    {
      group: "Recent Updates",
      items: [
        { title: "Attendance", href: "/attendance" },
        { title: "NOC Request", href: "/noc" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger />

        <div className="flex-1 ml-4">
          <Button
            variant="outline"
            className="relative h-9 w-full md:max-w-sm text-sm text-muted-foreground"
            onClick={() => setOpen(true)}
            aria-label="Search"
            aria-haspopup="dialog"
            title="Search (⌘K)"
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          <NotificationsButton />

          {/* already implemented on sidebar */}
          {/* 
           <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-sm font-medium">{userEmail}</span>
                    <Avatar>
                      {/* <AvatarImage src="/placeholder.svg" /> 
                      <AvatarImage src={userAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account settings</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/auth");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          */}
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSearchSubmit}>
          <CommandInput
            placeholder="Type a command or search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </form>
        <CommandList>
          <CommandEmpty>No results found. Try a different search.</CommandEmpty>
          {searchResults.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    setOpen(false);
                    navigate(item.href);
                  }}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
}



