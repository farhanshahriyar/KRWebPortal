// import { useState, useEffect } from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { supabase } from "@/integrations/supabase/client"; // called my auth system

// interface AttendanceRecord {
//   id: string;
//   user_id: string;
//   date: string;
//   status: "present" | "absent" | "late";
//   notes?: string | null;
//   created_at: string;
//   updated_at: string;
// }

// interface ChartDataPoint {
//   date: string;
//   Present: number;
//   Late: number;
//   Absent: number;
//   raw: string;
// }

// interface AttendanceChartProps {
//   attendanceData: AttendanceRecord[];
//   timeframe: string;
//   onTimeframeChange: (value: string) => void;
// }

// export function AttendanceChart({
//   attendanceData,
//   timeframe,
//   onTimeframeChange,
// }: AttendanceChartProps) {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       const { data: { user }, error } = await supabase.auth.getUser();
//       if (error || !user) {
//         // Handle error or redirect to login
//         return;
//       }
//       setUser(user); // Store the authenticated user
//     };
//     fetchUser();
//   }, []);

//   // Filter attendance data based on the authenticated user
//   const filteredAttendanceData = user
//     ? attendanceData.filter((record) => record.user_id === user.id)
//     : [];

//   // Transform attendance data for chart display
//   const transformAttendanceData = (data: AttendanceRecord[], timeframe: number): ChartDataPoint[] => {
//     // Create an array of dates for the selected timeframe
//     const dates = Array.from({ length: timeframe }, (_, index) => {
//       const date = new Date();
//       date.setDate(date.getDate() - (timeframe - 1) + index);
//       return date.toISOString().split('T')[0];
//     });

//     // Initialize counts for each status type
//     const result = dates.map((date) => {
//       const displayDate = new Date(date);
//       return {
//         date: displayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
//         Present: 0,
//         Late: 0,
//         Absent: 0,
//         raw: date,
//       };
//     });

//     // Count attendance for each date and status
//     data.forEach((record) => {
//       const dateIndex = result.findIndex((item) => item.raw === record.date);
//       if (dateIndex !== -1) {
//         if (record.status === "present") {
//           result[dateIndex].Present += 1;
//         } else if (record.status === "late") {
//           result[dateIndex].Late += 1;
//         } else if (record.status === "absent") {
//           result[dateIndex].Absent += 1;
//         }
//       }
//     });

//     return result;
//   };

//   const chartData = transformAttendanceData(filteredAttendanceData, parseInt(timeframe));

//   return (
//     <Card className="mb-8">
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle>Attendance Overview</CardTitle>
//         <Select value={timeframe} onValueChange={onTimeframeChange}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select timeframe" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="7">Last 7 days</SelectItem>
//             <SelectItem value="30">Last 30 days</SelectItem>
//             <SelectItem value="90">Last 3 months</SelectItem>
//           </SelectContent>
//         </Select>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[300px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart
//               data={chartData}
//               margin={{
//                 top: 10,
//                 right: 30,
//                 left: 0,
//                 bottom: 0,
//               }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Area
//                 type="monotone"
//                 dataKey="Present"
//                 stackId="1"
//                 stroke="#10B981"
//                 fill="#D1FAE5"
//               />
//               <Area
//                 type="monotone"
//                 dataKey="Late"
//                 stackId="1"
//                 stroke="#FBBF24"
//                 fill="#FEF3C7"
//               />
//               <Area
//                 type="monotone"
//                 dataKey="Absent"
//                 stackId="1"
//                 stroke="#EF4444"
//                 fill="#FEE2E2"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client"; // called my auth system

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: "present" | "absent" | "late";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface ChartDataPoint {
  date: string;
  Present: number;
  Late: number;
  Absent: number;
  raw: string;
}

interface AttendanceChartProps {
  attendanceData: AttendanceRecord[];
  timeframe: string;
  onTimeframeChange: (value: string) => void;
}

export function AttendanceChart({
  attendanceData,
  timeframe,
  onTimeframeChange,
}: AttendanceChartProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return;
      }

      // 🔥 Fetch the role from 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) return;

      // 🔥 Save role along with user
      setUser({ ...user, role: profile.role });
    };
    fetchUser();
  }, []);

  // 🔥 Conditionally filter attendance data
  const filteredAttendanceData = user
    ? user.role === "kr_admin"
      ? attendanceData // ✅ Admin sees all
      : attendanceData.filter((record) => record.user_id === user.id) // ✅ Others see only their own
    : [];

  const transformAttendanceData = (data: AttendanceRecord[], timeframe: number): ChartDataPoint[] => {
    const dates = Array.from({ length: timeframe }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - 1) + index);
      return date.toISOString().split('T')[0];
    });

    const result = dates.map((date) => {
      const displayDate = new Date(date);
      return {
        date: displayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Present: 0,
        Late: 0,
        Absent: 0,
        raw: date,
      };
    });

    data.forEach((record) => {
      const dateIndex = result.findIndex((item) => item.raw === record.date);
      if (dateIndex !== -1) {
        if (record.status === "present") {
          result[dateIndex].Present += 1;
        } else if (record.status === "late") {
          result[dateIndex].Late += 1;
        } else if (record.status === "absent") {
          result[dateIndex].Absent += 1;
        }
      }
    });

    return result;
  };

  const chartData = transformAttendanceData(filteredAttendanceData, parseInt(timeframe));

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Attendance Overview {user?.role === "kr_admin" && "(All Users)"}
        </CardTitle>

        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="Present"
                stackId="1"
                stroke="#10B981"
                fill="#D1FAE5"
              />
              <Area
                type="monotone"
                dataKey="Late"
                stackId="1"
                stroke="#FBBF24"
                fill="#FEF3C7"
              />
              <Area
                type="monotone"
                dataKey="Absent"
                stackId="1"
                stroke="#EF4444"
                fill="#FEE2E2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
