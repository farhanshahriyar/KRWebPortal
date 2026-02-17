
import { Users, Calendar, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { toast } from "sonner";
import { LEAVE_STATUS_CHANGED_EVENT } from "@/components/leave-request/LeaveRequestList";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentUpdates } from "@/components/dashboard/RecentUpdates";
import { QuickTutorial } from "@/components/dashboard/QuickTutorial";

// Define attendance status types
const AttendanceStatus = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
} as const;

type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [timeframe, setTimeframe] = useState("30");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; username?: string } | null>(null);
  const [leaveUsage, setLeaveUsage] = useState(0);
  const [nocUsage, setNocUsage] = useState(0);

  // Setup real-time listeners for notifications
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };

    fetchUserProfile();

    // Setup attendance notification channel
    const attendanceChannel = supabase
      .channel('attendance-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        async (payload) => {
          console.log('New attendance record:', payload);

          // Get user details
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single();

          const userName = userProfile?.full_name || 'A team member';
          const status = payload.new.status;

          toast.info(`New Attendance Update`, {
            description: `${userName} has marked attendance as ${status}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Setup NOC requests notification channel
    const nocChannel = supabase
      .channel('noc-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'noc_requests',
          filter: 'status=eq.approved'
        },
        async (payload) => {
          if (payload.old.status !== 'approved' && payload.new.status === 'approved') {
            // Get user details
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.user_id)
              .single();

            const userName = userProfile?.full_name || 'A team member';

            toast.success(`NOC Request Approved`, {
              description: `${userName}'s NOC request has been approved`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Setup leave requests notification channel
    const leaveChannel = supabase
      .channel('leave-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leave_requests'
        },
        async (payload) => {
          if (payload.old.status !== payload.new.status) {
            // Get user details
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.user_id)
              .single();

            const userName = userProfile?.full_name || 'A team member';
            const status = payload.new.status;
            const days = payload.new.requested_days.length;

            let title;

            if (status === 'approved') {
              title = 'Leave Request Approved';
              toast.success(title, {
                description: `${userName}'s leave request for ${days} day(s) has been approved`,
                duration: 5000,
              });
            } else if (status === 'rejected') {
              title = 'Leave Request Rejected';
              toast.error(title, {
                description: `${userName}'s leave request has been rejected`,
                duration: 5000,
              });
            } else {
              title = 'Leave Request Updated';
              toast.info(title, {
                description: `${userName}'s leave request status changed to ${status}`,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    // Listen for manual event from Leave Request component
    const handleLeaveStatusChanged = () => {
      console.log("Leave status changed event received in Dashboard");
      // This will be triggered when leave status changes through UI interactions
      // No need to show toast here as it's already handled by the Supabase channel
    };

    window.addEventListener(LEAVE_STATUS_CHANGED_EVENT, handleLeaveStatusChanged);

    // Clean up all listeners
    return () => {
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(nocChannel);
      supabase.removeChannel(leaveChannel);
      window.removeEventListener(LEAVE_STATUS_CHANGED_EVENT, handleLeaveStatusChanged);
    };
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const startDate = format(subDays(new Date(), parseInt(timeframe)), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error("Error fetching attendance data:", error);
        toast.error("Error loading dashboard data", {
          description: error.message,
        });
        setLoading(false);
        return;
      }

      // Transform the data to ensure status is of type AttendanceStatus
      const typedData = (data || []).map(record => ({
        ...record,
        status: record.status as AttendanceStatus
      }));

      setAttendanceData(typedData);
      setLoading(false);
    };

    fetchAttendanceData();
  }, [timeframe]);

  // Fetch Leave and NOC usage stats
  useEffect(() => {
    const fetchUsageStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Fetch approved leaves (to count days)
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('requested_days')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      let totalLeaveDays = 0;
      if (leaves) {
        leaves.forEach(leave => {
          // Check each day if it belongs to current month
          const days = leave.requested_days as string[];
          days.forEach(day => {
            const date = new Date(day);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              totalLeaveDays++;
            }
          });
        });
      }
      setLeaveUsage(totalLeaveDays);

      // Fetch approved NOCs (to count requests) - 1 request = 1 NOC allowance
      const { count } = await supabase
        .from('noc_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .gte('created_at', `${currentYear}-01-01`); // Filter for current year

      setNocUsage(count || 0);
    };

    fetchUsageStats();
  }, []);

  // Show welcome notification on first load
  useEffect(() => {
    // Small delay to ensure it shows after page is fully loaded
    const timer = setTimeout(() => {
      const welcomeMessage = userProfile?.full_name
        ? `Welcome back, ${userProfile.full_name}!`
        : "Welcome to your dashboard!";

      toast.info(welcomeMessage, {
        description: "You'll receive notifications for attendance, leave requests, and NOC approvals here.",
        duration: 5000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [userProfile]);

  // Compute stats based on attendance data
  const stats = useMemo(() => {
    // Calculate attendance percentage for the selected period
    const presentCount = attendanceData.filter(record => record.status === AttendanceStatus.PRESENT).length;
    const lateCount = attendanceData.filter(record => record.status === AttendanceStatus.LATE).length;
    const totalCount = attendanceData.length;

    const attendanceRate = totalCount > 0
      ? Math.round(((presentCount + lateCount) / totalCount) * 100)
      : 0;

    return [
      {
        title: `Attendance Rate (Last ${timeframe} days)`,
        value: `${attendanceRate}%`,
        icon: Calendar,
        description: "Present or late / total days",
      },
      // {
      //   title: "Roster Members",
      //   value: "Comming Soon",
      //   icon: Users,
      //   description: "Active team members will be shown here",
      // },
      {
        title: "NOC Requests",
        value: `${Math.max(0, 4 - nocUsage)} / 4`,
        icon: FileText,
        description: "Annual NOCs Remaining",
      },
      {
        title: "Leave Requests",
        value: `${Math.max(0, 7 - leaveUsage)} / 7`,
        icon: FileText,
        description: "Monthly Leave Days Remaining",
      },
    ];
  }, [attendanceData, timeframe, leaveUsage, nocUsage]);

  const recentUpdates = useMemo(() => [
    {
      type: "Attendance",
      content: `You achieved ${stats[0].value} attendance in the last ${timeframe} days`,
      // timestamp dynamically from the last attendance record in the past 24 hours
      timestamp: new Date().toLocaleString(),
    },
    // {
    //   type: "NOC",
    //   content: "2 new NOC requests pending approval",
    //   timestamp: "5 hours ago"
    // },
    // {
    //   type: "Member",
    //   content: "Monthly attendance report generated",
    //   timestamp: "1 day ago"
    // }
  ], [stats, timeframe]);

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      {loading && <LoadingIndicator />}
      <QuickTutorial />

      <div className="mb-8">
        {/* <h1 className="text-2xl font-bold mb-2">Hi {userProfile?.full_name?.split(' ')[0] || 'there'} ,</h1> */}
        <h1 className="text-2xl font-bold mb-2">Hi {userProfile?.username?.split(' ')[0] || 'there'} 👋,</h1>
        {/* <h1 className="text-2xl font-bold mb-2">Hi {userProfile?.full_name?.split(' ')[0] || 'there'} ,</h1> */}
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
      </div>

      <AttendanceChart
        attendanceData={attendanceData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      <div className="w-full">
        <StatCards stats={stats} />
      </div>
      <RecentUpdates updates={recentUpdates} />
    </div>
  );
};

export default Index;
