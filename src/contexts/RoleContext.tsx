
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Role = "kr_admin" | "kr_manager" | "kr_member";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  canAccess: (feature: string) => boolean;
  getRoleDisplay: () => string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const featurePermissions = {
  kr_admin: ["*", "dashboard", "settings", "members", "manage_attendence", "manage_members", "manage_passwords", "tournaments", "schedule", "leave_request", "manage_user-reports", "admin_dashboard"], // All access
  kr_manager: [
    "dashboard",
    "announcement",
    "attendance",
    "noc",
    "leave_request",
    "members",
    "tournaments",
    "members.view",
    "manage_members",
    "manage_members.view",
    "members.edit",
    "schedule",
    "update_logs",
  ],
  kr_member: [
    "dashboard",
    "announcement.view",
    "attendance",
    "noc",
    "leave_request",
    "update_logs",
    // UI testing purposes it should be 
    // "members.view",
    // "manage_members",
    // "manage_members.view",
    // "members.edit",
  ],
};

const roleDisplayNames = {
  kr_admin: "KR Admin",
  kr_manager: "KR Manager",
  kr_member: "KR Member",
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("kr_member");

  // Function to fetch role from database
  const fetchUserRole = async (userId: string) => {
    console.log("[RoleContext] Fetching role for user:", userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      console.log("[RoleContext] Profile fetch result:", { profile, error });

      if (error) {
        console.error("[RoleContext] Error fetching profile:", error);
        return;
      }

      if (profile?.role) {
        console.log("[RoleContext] Setting role to:", profile.role);
        setRole(profile.role as Role);
      }
    } catch (error) {
      console.error("[RoleContext] Failed to fetch user role:", error);
    }
  };

  // Initialize role and listen for auth changes
  useEffect(() => {
    // Fetch role on initial load if session exists
    const initializeRole = async () => {
      console.log("[RoleContext] Initializing role...");
      const { data } = await supabase.auth.getSession();
      console.log("[RoleContext] Current session:", data.session?.user?.id);
      if (data.session?.user?.id) {
        await fetchUserRole(data.session.user.id);
      }
    };

    initializeRole();

    // Listen for auth state changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[RoleContext] Auth state changed:", event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user?.id) {
          // User just logged in - fetch their role (non-blocking)
          fetchUserRole(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // User logged out - reset to default role
          setRole("kr_member");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const canAccess = (feature: string) => {
    if (role === "kr_admin") return true;
    const permissions = featurePermissions[role] || [];
    return permissions.includes(feature) || permissions.includes(feature.split(".")[0]);
  };

  const getRoleDisplay = () => {
    return roleDisplayNames[role];
  };

  // Update user metadata when role changes
  // useEffect(() => {
  //   const updateUserMetadata = async () => {
  //     const { data } = await supabase.auth.getUser();
  //     if (data.user) {
  //       await supabase.auth.updateUser({
  //         data: { role }
  //       });
  //     }
  //   };

  //   updateUserMetadata();
  // }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole, canAccess, getRoleDisplay }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
