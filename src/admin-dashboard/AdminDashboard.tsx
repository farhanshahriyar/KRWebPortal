import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCards } from "@/components/dashboard/StatCards";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Users, Calendar, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import { format, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Types
interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: "present" | "absent" | "late";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'leave' | 'noc';
  user_name: string;
  action: string;
  status?: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  // Stats state
  const [totalMembers, setTotalMembers] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, late: 0, absent: 0 });
  const [pendingLeave, setPendingLeave] = useState(0);
  const [pendingNoc, setPendingNoc] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      try {
        // 1. Total members
        const { count: memberCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        setTotalMembers(memberCount || 0);

        // 2. Today's attendance
        const { data: todayData } = await supabase
          .from('attendance')
          .select('*')
          .eq('date', today);

        const attendance = {
          present: todayData?.filter(r => r.status === 'present').length || 0,
          late: todayData?.filter(r => r.status === 'late').length || 0,
          absent: todayData?.filter(r => r.status === 'absent').length || 0,
        };
        setTodayAttendance(attendance);

        // 3. Pending leave requests
        const { count: leaveCount } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingLeave(leaveCount || 0);

        // 4. Pending NOC requests
        const { count: nocCount } = await supabase
          .from('noc_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingNoc(nocCount || 0);

        // 5. Attendance data for chart (all members)
        const startDate = format(subDays(new Date(), parseInt(timeframe)), 'yyyy-MM-dd');
        const endDate = format(new Date(), 'yyyy-MM-dd');

        const { data: chartData } = await supabase
          .from('attendance')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate);

        setAttendanceData((chartData || []).map(record => ({
          ...record,
          status: record.status as "present" | "absent" | "late"
        })));

        // 6. Recent activities (last 10)
        const activities: RecentActivity[] = [];

        // Get recent attendance
        const { data: recentAttendance } = await supabase
          .from('attendance')
          .select('id, user_id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Get recent leave requests
        const { data: recentLeave } = await supabase
          .from('leave_requests')
          .select('id, user_id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Get recent NOC requests
        const { data: recentNoc } = await supabase
          .from('noc_requests')
          .select('id, user_id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Get user profiles for names
        const userIds = [
          ...(recentAttendance?.map(r => r.user_id) || []),
          ...(recentLeave?.map(r => r.user_id) || []),
          ...(recentNoc?.map(r => r.user_id) || [])
        ];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', [...new Set(userIds)]);

        const userMap: Record<string, string> = {};
        profiles?.forEach(p => {
          userMap[p.id] = p.username || p.full_name || 'Unknown User';
        });

        // Build activities list
        recentAttendance?.forEach(r => {
          activities.push({
            id: r.id,
            type: 'attendance',
            user_name: userMap[r.user_id] || 'Unknown',
            action: 'marked attendance',
            status: r.status,
            timestamp: r.created_at
          });
        });

        recentLeave?.forEach(r => {
          activities.push({
            id: r.id,
            type: 'leave',
            user_name: userMap[r.user_id] || 'Unknown',
            action: 'leave request',
            status: r.status,
            timestamp: r.created_at
          });
        });

        recentNoc?.forEach(r => {
          activities.push({
            id: r.id,
            type: 'noc',
            user_name: userMap[r.user_id] || 'Unknown',
            action: 'NOC request',
            status: r.status,
            timestamp: r.created_at
          });
        });

        // Sort by timestamp and take top 10
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 10));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  // Stats cards data
  const stats = useMemo(() => [
    {
      title: "Total Members",
      value: totalMembers.toString(),
      icon: Users,
      description: "Registered members in the system"
    },
    {
      title: "Pending Leave Requests",
      value: pendingLeave.toString(),
      icon: FileText,
      description: "Awaiting admin approval"
    },
    {
      title: "Pending NOC Requests",
      value: pendingNoc.toString(),
      icon: FileText,
      description: "Awaiting admin approval"
    }
  ], [totalMembers, pendingLeave, pendingNoc]);

  const todayTotal = todayAttendance.present + todayAttendance.late + todayAttendance.absent;
  const getPercentage = (count: number) => todayTotal > 0 ? Math.round((count / todayTotal) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Present</Badge>;
      case 'late':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Late</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Absent</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'leave':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'noc':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-6">
      {loading && <LoadingIndicator />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all system activities</p>
      </div>

      {/* Stats Cards */}
      <StatCards stats={stats} />

      {/* Today's Attendance Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{todayAttendance.present}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(todayAttendance.present)}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{todayAttendance.late}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(todayAttendance.late)}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{todayAttendance.absent}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(todayAttendance.absent)}% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <AttendanceChart
        attendanceData={attendanceData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium text-sm">
                        <span className="font-semibold">{activity.user_name}</span>
                        {' '}{activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                  {activity.status && getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
