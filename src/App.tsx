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
import { Dashboard } from "./components/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Forbidden from "./pages/Forbidden";
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
import ManageLogs from "./pages/ManageLogs";
import { ManageUserReports } from "@/admin-dashboard/ManageUserReports";
import AttendenceList from "./admin-dashboard/AttendenceList/AttendenceList";
import { ForgetPassword } from "./admin-dashboard/ForgetPassword";
import TournamentsMatches from "./pages/TournamentsMatches";
import ValorantStats from "./pages/ValorantStats";
import { ManageValorantStats } from "./admin-dashboard/ManageValorantStats";
import Announcement from "./pages/Announcement";
import { ManageAnnouncements } from "./admin-dashboard/ManageAnnouncements";
import TeamHome from "./pages/TeamHome";
import TeamRoster from "./pages/TeamRoster";
import TeamMatches from "./pages/TeamMatches";
import TeamMatchDetail from "./pages/TeamMatchDetail";
import TeamVods from "./pages/TeamVods";
import TeamStats from "./pages/TeamStats";

// ProtectedRoute Component - Only handles authentication
function ProtectedRoute({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session on page load
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    initializeSession();

    // Subscribe to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/forbidden" element={<Forbidden />} />
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
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/attendance" element={<Attendance />} />
                                <Route path="/noc" element={<NOC />} />
                                <Route path="/members" element={<Members />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/update-logs" element={<UpdateLogs />} />
                                <Route path="/leave-request" element={<LeaveRequest />} />
                                <Route path="/manage-logs" element={<ManageLogs />} />
                                <Route
                                  path="/tournaments"
                                  element={
                                    <ProtectedComponent feature="tournaments.view">
                                      <TournamentsMatches />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/manage-attendence"
                                  element={
                                    <ProtectedComponent feature="manage_attendence">
                                      <AttendenceList />
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
                                <Route path="/valorant-stats" element={<ValorantStats />} />
                                <Route path="/announcements" element={<Announcement />} />
                                <Route
                                  path="/manage-announcements"
                                  element={
                                    <ProtectedComponent feature="manage_announcements">
                                      <ManageAnnouncements />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/manage-valorant-stats"
                                  element={
                                    <ProtectedComponent feature="manage_valorant_stats">
                                      <ManageValorantStats />
                                    </ProtectedComponent>
                                  }
                                />

                                {/* Team KingsRock Routes */}
                                <Route
                                  path="/team"
                                  element={
                                    <ProtectedComponent feature="team.view">
                                      <TeamHome />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/team/roster"
                                  element={
                                    <ProtectedComponent feature="team.roster.view">
                                      <TeamRoster />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/team/matches"
                                  element={
                                    <ProtectedComponent feature="team.matches.view">
                                      <TeamMatches />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/team/matches/:id"
                                  element={
                                    <ProtectedComponent feature="team.matches.view">
                                      <TeamMatchDetail />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/team/vods"
                                  element={
                                    <ProtectedComponent feature="team.vods.view">
                                      <TeamVods />
                                    </ProtectedComponent>
                                  }
                                />
                                <Route
                                  path="/team/stats"
                                  element={
                                    <ProtectedComponent feature="team.stats.view">
                                      <TeamStats />
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
