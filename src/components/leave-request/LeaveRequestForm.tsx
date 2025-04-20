import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface LeaveRequestFormProps {
  remainingLeaveDays?: number;
}

// Function to handle inserting leave request into the database
const submitLeaveRequest = async ({
  reason,
  message,
  selectedDays,
  userId,
}: {
  reason: string;
  message: string;
  selectedDays: Date[];
  userId: string;
}) => {
  const { error } = await supabase.from('leave_requests').insert({
    reason,
    message,
    requested_days: selectedDays.map((date) => date.toISOString().split('T')[0]),
    user_id: userId,
    status: 'pending',
  });

  if (error) throw new Error(error.message);
  return "Leave request submitted successfully"; // You can return any response you want
};

// Function to fetch remaining leave days (if needed)
const fetchRemainingLeaveDays = async (userId: string) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('requested_days')
    .eq('user_id', userId)
    .gte('requested_days', new Date().toISOString().split('T')[0]) // Get leave days from the current month
    .order('requested_days', { ascending: false });

  if (error) throw new Error(error.message);
  return data.length; // Calculate the number of remaining days based on data
};

const LeaveRequestForm = ({ remainingLeaveDays = 7 }: LeaveRequestFormProps) => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  console.log(selectedDays, remainingLeaveDays)

  // Use TanStack Query's `useMutation` to handle submitting the leave request
  const mutation = useMutation({
    mutationFn: submitLeaveRequest,
    onMutate: () => {
      toast({
        title: "Submitting leave request...",
        description: "Your leave request is being submitted.",
      });
    },
    onSuccess: (data) => {
      toast({
        title: data,
        description: "Your leave request has been submitted successfully.",
      });
      setSelectedDays([]);
      setReason("");
      setMessage("");
      setOpen(false);
      queryClient.invalidateQueries(["leave-requests"]); // Invalidate related queries if needed
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    },
  });

  // Fetch user data (or use supabase directly in the mutation as shown above)
  useEffect(() => {
    if (open) {
      setSelectedDays([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate number of selected days against remaining leave allowance
    if (selectedDays.length > remainingLeaveDays) {
      toast({
        title: "Exceeds monthly allowance",
        description: `You can only request up to ${remainingLeaveDays} days of leave this month`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Use mutation to submit the leave request
      mutation.mutate({
        reason,
        message,
        selectedDays,
        userId: user.id,
      });

    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive"
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-end mb-4">
          <Button className="text-slate-50">Request Leave</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Leave Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You have {remainingLeaveDays} days of leave remaining this month.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason:</label>
            <Input
              placeholder="e.g., Annual Leave"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Days for Leave:</label>
            <Calendar
              mode="multiple"
              selected={selectedDays}
              onSelect={setSelectedDays as any}
              className="border rounded-md"
              disabled={
                selectedDays.length >= remainingLeaveDays
                  ? (date) => !selectedDays.some(selectedDate => selectedDate.toDateString() === date.toDateString())
                  : undefined
              }
            />
            <p className="text-xs text-muted-foreground">
              Selected {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Textarea
              placeholder="Enter additional details here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="min-h-[150px]"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={selectedDays.length === 0 || selectedDays.length > remainingLeaveDays}
            className="w-full text-red-50"
          >
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestForm;
