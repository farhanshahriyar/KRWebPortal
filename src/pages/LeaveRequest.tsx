
import { useEffect, useState, useCallback } from "react";
import LeaveRequestForm from "@/components/leave-request/LeaveRequestForm";
import LeaveRequestList, { LEAVE_STATUS_CHANGED_EVENT } from "@/components/leave-request/LeaveRequestList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Monthly leave allowance constant
const MONTHLY_LEAVE_ALLOWANCE = 7;

const LeaveRequest = () => {
  const [usedLeaveDays, setUsedLeaveDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use useCallback to avoid recreating this function on each render
  const fetchUsedLeaves = useCallback(async () => {
    console.log("Fetching used leaves...");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      // Get the start and end of current month
      const currentDate = new Date();
      const startMonth = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      console.log(`Fetching leave data from ${startMonth} to ${endMonth} for user ${user.id}`);

      // Query approved leave requests for the user
      const { data, error } = await supabase
        .from('leave_requests')
        .select('requested_days')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (error) {
        console.error("Error fetching leave data:", error);
        setLoading(false);
        return;
      }

      console.log("Approved leave data:", data);

      // Calculate total used leave days this month by filtering dates client-side
      const totalDays = data?.reduce((total, request) => {
        const daysInMonth = (request.requested_days || []).filter((day: string) =>
          day >= startMonth && day <= endMonth
        );
        return total + daysInMonth.length;
      }, 0) || 0;

      console.log(`Total used leave days: ${totalDays}`);
      setUsedLeaveDays(totalDays);
    } catch (error) {
      console.error("Error in fetchUsedLeaves:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leave data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsedLeaves();

    // Add event listener for leave status changes
    const handleLeaveStatusChanged = () => {
      console.log("Leave status changed event received");
      fetchUsedLeaves();
    };

    window.addEventListener(LEAVE_STATUS_CHANGED_EVENT, handleLeaveStatusChanged);

    return () => {
      window.removeEventListener(LEAVE_STATUS_CHANGED_EVENT, handleLeaveStatusChanged);
    };
  }, [fetchUsedLeaves]);

  // Calculate remaining leave days
  const remainingLeaveDays = MONTHLY_LEAVE_ALLOWANCE - usedLeaveDays;
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="space-y-6">
      {/* <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Leaves in {currentMonth}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <LoadingIndicator size="sm" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {remainingLeaveDays} / {MONTHLY_LEAVE_ALLOWANCE}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly leave allowance
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Roster Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>
      </div> */}

      <LeaveRequestForm remainingLeaveDays={remainingLeaveDays} />
      <LeaveRequestList />
    </div>
  );
};

export default LeaveRequest;
