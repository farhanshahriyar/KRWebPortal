import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAfter1150PM, isFutureDate, getBangladeshTime, canMarkAttendance, isPastDate, isInLateWindow } from "@/utils/dateUtils";
import { InfoIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define the status type explicitly
const AttendanceStatus = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late"
} as const;
type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];
const attendanceFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date."
  }),
  status: z.enum([AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE], {
    required_error: "Please select a status."
  }),
  notes: z.string().optional()
});
type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;
interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Function to determine the current status based on time
const getCurrentStatus = (date: Date): AttendanceStatus => {
  const now = getBangladeshTime();
  const isToday = date.toISOString().split('T')[0] === now.toISOString().split('T')[0];
  if (!isToday || isPastDate(date)) {
    return AttendanceStatus.ABSENT;
  }
  if (isInLateWindow()) {
    return AttendanceStatus.LATE;
  }
  if (isAfter1150PM(date)) {
    return AttendanceStatus.LATE;
  }
  return AttendanceStatus.PRESENT;
};

// Function to validate attendance status
const validateAttendanceStatus = (status: string): AttendanceStatus => {
  if (status === AttendanceStatus.PRESENT || status === AttendanceStatus.ABSENT || status === AttendanceStatus.LATE) {
    return status;
  }
  // Default to absent if an invalid status is encountered
  console.error(`Invalid attendance status: ${status}`);
  return AttendanceStatus.ABSENT;
};

// Function to get appropriate badge for attendance status
const getStatusBadge = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Present
        </Badge>;
    case AttendanceStatus.LATE:
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200">
          <Clock className="w-3 h-3 mr-1" /> Late
        </Badge>;
    case AttendanceStatus.ABSENT:
      return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" /> Absent
        </Badge>;
    default:
      return null;
  }
};
const AttendanceHistory = ({
  userId
}: {
  userId: string;
}) => {
  const {
    data: historyData = []
  } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance-history', userId],
    queryFn: async () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
      const {
        data,
        error
      } = await supabase.from('attendance').select('*').eq('user_id', userId).gte('date', formattedFirstDay).order('date', {
        ascending: false
      });
      if (error) throw error;

      // Transform the data to ensure status is of type AttendanceStatus
      return (data || []).map(record => ({
        ...record,
        status: validateAttendanceStatus(record.status)
      })) as AttendanceRecord[];
    }
  });
  if (!historyData || historyData.length === 0) {
    return <div className="text-center py-4 text-gray-500">
        No attendance records found for this month.
      </div>;
  }
  return <div className="mt-6">
      <h3 className="text-lg font-medium mb-2">Recent Attendance</h3>
      <div className="space-y-2">
        {historyData.map(record => <div key={record.id} className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{new Date(record.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</div>
              {record.notes && <div className="text-sm text-gray-500">{record.notes}</div>}
            </div>
            <div>
              {getStatusBadge(record.status)}
            </div>
          </div>)}
      </div>
    </div>;
};

const Attendance = () => {
  const [date, setDate] = useState<Date>(getBangladeshTime());
  const queryClient = useQueryClient();
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const currentStatus = getCurrentStatus(date);
  const [isAutoMarkingAttendance, setIsAutoMarkingAttendance] = useState(false);

  // Fetch current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data
      } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    fetchUserId();
  }, []);

  // Fetch existing attendance record for the selected date
  const {
    data: existingAttendance,
    isLoading
  } = useQuery<AttendanceRecord | null>({
    queryKey: ['attendance', date.toISOString().split('T')[0], userId],
    queryFn: async () => {
      if (!userId) return null;
      const {
        data,
        error
      } = await supabase.from('attendance').select('*').eq('date', date.toISOString().split('T')[0]).eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Convert the status to a valid AttendanceStatus
      return {
        ...data,
        status: validateAttendanceStatus(data.status)
      } as AttendanceRecord;
    },
    enabled: !!userId
  });
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      date: date,
      status: currentStatus,
      notes: ""
    }
  });

  // Update form values when date changes or existing attendance is loaded
  useEffect(() => {
    if (existingAttendance) {
      form.reset({
        date: new Date(existingAttendance.date),
        status: existingAttendance.status,
        notes: existingAttendance.notes || ""
      });

      // Check if the attendance is for today
      const today = getBangladeshTime().toISOString().split('T')[0];
      if (existingAttendance.date === today) {
        setHasSubmittedToday(true);
      } else {
        setHasSubmittedToday(false);
      }
    } else {
      form.reset({
        date: date,
        status: currentStatus,
        notes: ""
      });
      setHasSubmittedToday(false);
    }
  }, [existingAttendance, date, form, currentStatus]);

  // This effect runs once on component mount to check if today's attendance has already been submitted
  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!userId) return;
      const today = getBangladeshTime().toISOString().split('T')[0];
      const {
        data,
        error
      } = await supabase.from('attendance').select('*').eq('date', today).eq('user_id', userId).maybeSingle();
      if (!error && data) {
        setHasSubmittedToday(true);
      } else if (!error && !data && isInLateWindow()) {
        // Auto mark as late if it's in the late window time frame
        setIsAutoMarkingAttendance(true);
        submitAttendance.mutate();
      }
    };
    if (userId) {
      checkTodayAttendance();
    }
  }, [userId]);
  const submitAttendance = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      // Determine the status to submit based on the time
      let statusToSubmit: AttendanceStatus;
      if (isAutoMarkingAttendance) {
        statusToSubmit = AttendanceStatus.LATE;
      } else {
        statusToSubmit = getCurrentStatus(date);
      }
      const notes = isAutoMarkingAttendance ? "Automatically marked as late due to check-in time" : form.getValues("notes");
      const attendanceData = {
        user_id: userId,
        date: date.toISOString().split('T')[0],
        status: statusToSubmit,
        notes: notes
      };
      if (existingAttendance) {
        const {
          error
        } = await supabase.from('attendance').update(attendanceData).eq('id', existingAttendance.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from('attendance').insert([attendanceData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (isAutoMarkingAttendance) {
        toast.info("Attendance automatically marked", {
          description: "Your attendance has been automatically marked as Late due to the current time."
        });
        setIsAutoMarkingAttendance(false);
      } else {
        toast.success(existingAttendance ? "Attendance updated!" : "Attendance submitted successfully!", {
          description: `Your attendance has been marked as ${getStatusLabel(currentStatus)}.`
        });
      }
      setHasSubmittedToday(true);
      queryClient.invalidateQueries({
        queryKey: ['attendance']
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance-history']
      });
    },
    onError: error => {
      toast.error("Error submitting attendance", {
        description: error.message
      });
      setIsAutoMarkingAttendance(false);
    }
  });

  // Set up real-time subscription for attendance updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('schema-db-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'attendance'
    }, payload => {
      console.log('Real-time update:', payload);
      queryClient.invalidateQueries({
        queryKey: ['attendance']
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance-history']
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
  const getStatusLabel = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "Present";
      case AttendanceStatus.LATE:
        return "Late";
      case AttendanceStatus.ABSENT:
        return "Absent";
      default:
        return "Unknown";
    }
  };
  function onSubmit(data: AttendanceFormValues) {
    submitAttendance.mutate();
  }
  const isPast = isPastDate(date);
  const isFuture = isFutureDate(date);
  const canMark = canMarkAttendance(date);
  const isLate = isAfter1150PM(date) || isInLateWindow();

  // Determine the status to display in UI
  const displayStatus = existingAttendance ? existingAttendance.status : currentStatus;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold">Attendance</h1>
      
      {isPast && <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>
            You cannot mark attendance for past dates. They will be automatically marked as "Absent".
          </AlertDescription>
        </Alert>}

      {isLate && !isFuture && !isPast && <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Late Arrival</AlertTitle>
          <AlertDescription>
            {isInLateWindow() ? "It's between 11:50 AM and 11:55 AM. Your attendance will be marked as 'Late'." : "It's past 11:50 PM. Your attendance will be marked as 'Late'."}
          </AlertDescription>
        </Alert>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex justify-center">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={newDate => {
                  if (newDate) {
                    setDate(newDate);
                    form.setValue("date", newDate);
                  }
                }} 
                className="rounded-md border mx-auto max-w-full" 
                disabled={date => !canMarkAttendance(date)} 
              />
            </div>
            
            {userId && <AttendanceHistory userId={userId} />}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {existingAttendance ? "Update Attendance" : "Submit Attendance"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md mb-4 flex flex-wrap items-center justify-between">
                  <div className="w-full sm:w-auto mb-2 sm:mb-0">
                    <p className="text-sm text-gray-600">
                      Selected Date: <span className="font-semibold">{date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: <span className="font-semibold">{getStatusLabel(displayStatus)}</span>
                    </p>
                  </div>
                  <div className="w-auto">
                    {getStatusBadge(displayStatus)}
                  </div>
                </div>

                <FormField control={form.control} name="notes" render={({
                field
              }) => <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any additional notes here..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <Button type="submit" disabled={submitAttendance.isPending || isLoading || hasSubmittedToday || !canMark || isPast || isFuture || isAutoMarkingAttendance} className="w-full text-zinc-50">
                  {submitAttendance.isPending ? "Submitting..." : hasSubmittedToday ? "Attendance Already Submitted" : existingAttendance ? "Update Attendance" : "Submit Attendance"}
                </Button>
                
                {hasSubmittedToday && <Alert className="bg-green-50 border-green-200 mt-4">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      You have already marked your attendance for today as <strong>{getStatusLabel(displayStatus)}</strong>.
                      {existingAttendance?.notes && existingAttendance.notes.includes("Automatically") && <span className="block mt-2 text-amber-600">This was automatically recorded by the system.</span>}
                    </AlertDescription>
                  </Alert>}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
