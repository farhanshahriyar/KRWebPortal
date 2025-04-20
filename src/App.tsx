import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ThemeProvider } from "next-themes";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Attendance from "./pages/Attendance";
import NOC from "./pages/NOC";
import Members from "./pages/Members";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import UpdateLogs from "./pages/UpdateLogs";
import LeaveRequest from "./pages/LeaveRequest";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import ManageMembers from "./pages/ManageMembers";
import { ProtectedComponent } from "./components/ProtectedComponent";
import AddUpdateLogs from "./pages/AddUpdateLogs";
import { ManageUserReports } from "@/admin-dashboard/ManageUserReports";
import AttendenceList from "./admin-dashboard/AttendenceList/AttendenceList";
import { ForgetPassword } from "./admin-dashboard/ForgetPassword";

// ProtectedRoute Component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { setRole } = useRole();
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session and set role on page load
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role);
      } else {
        setRole("kr_member"); // Default to kr_member if no role exists
      }

      setLoading(false);
    };

    initializeSession();

    // Subscribe to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role);
      } else {
        setRole("kr_member");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe(); // Cleanup the subscription
  }, [setRole]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" attribute="class">
          <TooltipProvider>
            <RoleProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <DashboardSidebar />
                          <div className="flex-1 flex flex-col">
                            <DashboardHeader />
                            <main className="flex-1 p-4">
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/attendance" element={<Attendance />} />
                                <Route path="/noc" element={<NOC />} />
                                <Route path="/members" element={<Members />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/update-logs" element={<UpdateLogs />} />
                                <Route path="/leave-request" element={<LeaveRequest />} />
                                <Route path="/add-update-logs" element={<AddUpdateLogs />} />
                                <Route
                                  path="/manage-attendence"
                                  element={
                                    <ProtectedComponent feature="manage_attendence">
                                      <AttendenceList/>
                                    </ProtectedComponent>
                                  } 
                                />
                                <Route
                                  path="/manage-members"
                                  element={
                                    <ProtectedComponent feature="manage_members">
                                      <ManageMembers />
                                    </ProtectedComponent>
                                  } 
                                />
                                <Route
                                  path="/manage-passwords"
                                  element={
                                    <ProtectedComponent feature="manage_passwords">
                                      <ForgetPassword />
                                    </ProtectedComponent>
                                  } 
                                />
                                <Route
                                  path="/manage-user-reports"
                                  element={
                                    <ProtectedComponent feature="manage_user-reports">
                                      <ManageUserReports />
                                    </ProtectedComponent>
                                  } 
                                />

                              </Routes>
                            </main>
                          </div>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </RoleProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
