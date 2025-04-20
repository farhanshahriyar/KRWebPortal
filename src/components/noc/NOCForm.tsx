import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const NOCForm = () => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();

  // Create mutation for submitting NOC requests
  const submitMutation = useMutation({
    mutationFn: async (nocData: {
      reason: string;
      message: string;
      requested_days: string[];
      user_id: string;
    }) => {
      const {
        error
      } = await supabase.from('noc_requests').insert({
        ...nocData,
        status: 'pending' as const
      });
      if (error) throw new Error(error.message);
      return nocData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "NOC request submitted successfully"
      });

      // Reset form and close dialog
      setSelectedDays([]);
      setReason("");
      setMessage("");
      setOpen(false);

      // Invalidate queries to refresh NOC list
      queryClient.invalidateQueries({
        queryKey: ['noc-requests']
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: "Failed to submit NOC request: " + error.message,
        variant: "destructive"
      });
    }
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add validation to ensure dates are selected
    if (selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day for your NOC request",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      submitMutation.mutate({
        reason,
        message,
        requested_days: selectedDays.map(date => date.toISOString().split('T')[0]),
        user_id: user.id
      });
    } catch (error) {
      console.error('Error getting user:', error);
      toast({
        title: "Error",
        description: "Failed to get user information",
        variant: "destructive"
      });
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-end mb-4">
          <Button className="text-zinc-50">Request NOC</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit NOC Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason:</label>
            <Input placeholder="e.g., Family Issue" value={reason} onChange={e => setReason(e.target.value)} required disabled={submitMutation.isPending} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Days for NOC:</label>
            <Calendar mode="multiple" selected={selectedDays} onSelect={setSelectedDays as any} className="border rounded-md" disabled={submitMutation.isPending} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Textarea placeholder="Enter your message here..." value={message} onChange={e => setMessage(e.target.value)} className="min-h-[150px]" required disabled={submitMutation.isPending} />
          </div>

          <Button type="submit" className="w-full" disabled={submitMutation.isPending || selectedDays.length === 0 || !reason}>
            {submitMutation.isPending ? "Submitting..." : "Submit NOC"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>;
};
export default NOCForm;