// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Pencil, Trash2 } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Calendar } from "@/components/ui/calendar";
// import { useRole } from "@/contexts/RoleContext";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// type LeaveStatus = 'pending' | 'approved' | 'rejected';

// interface LeaveRequest {
//   id: string;
//   reason: string;
//   message: string;
//   requested_days: string[];
//   status: LeaveStatus;
//   created_at?: string;
//   updated_at?: string;
//   user_id?: string;
// }

// // Create a custom event for leave status changes
// export const LEAVE_STATUS_CHANGED_EVENT = 'leave-status-changed';

// const LeaveRequestList = () => {
//   const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
//   const [editReason, setEditReason] = useState("");
//   const [editMessage, setEditMessage] = useState("");
//   const [editDays, setEditDays] = useState<Date[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const { toast } = useToast();
//   const { role } = useRole();
//   const queryClient = useQueryClient();



//   const fetchRequests = async () => {
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       throw new Error("You must be logged in to view leave requests");
//     }

//     // If not admin, only fetch user's own requests
//     const query = supabase
//       .from('leave_requests')
//       .select('*');

//     if (role !== 'kr_admin') {
//       query.eq('user_id', user.id);
//     }

//     const { data, error } = await query.order('created_at', { ascending: false });

//     if (error) {
//       throw new Error(error.message);
//     }

//     return (data || []).map(request => ({
//       ...request,
//       status: request.status as LeaveStatus
//     }));
//   };

//   const { data: requests = [], isLoading } = useQuery({
//     queryKey: ['leave-requests'],
//     queryFn: fetchRequests,
//     refetchOnWindowFocus: false, // prevent refetching on window focus
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const { error } = await supabase
//         .from('leave_requests')
//         .delete()
//         .eq('id', id);

//       if (error) throw new Error(error.message);
//       return id;
//     },
//     onMutate: (id) => {
//       // Optimistic UI update
//       queryClient.cancelQueries({ queryKey: ['leave-requests'] });
//       // const previousData = queryClient.getQueryData(['leave-requests']);
//       const previousData = queryClient.getQueryData<LeaveRequest[]>(['leave-requests']);

//       queryClient.setQueryData(['leave-requests'], (oldData: any) =>
//         oldData.filter((request: LeaveRequest) => request.id !== id)
//       );

//       return { previousData };
//     },
//     onError: (error, id, context) => {
//       console.error('Error deleting leave request:', error);
//       queryClient.setQueryData(['leave-requests'], context.previousData); // Rollback
//       toast({
//         title: "Error",
//         description: "Failed to delete leave request",
//         variant: "destructive",
//       });
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Leave request deleted successfully",
//       });
//       queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
//       window.dispatchEvent(new CustomEvent(LEAVE_STATUS_CHANGED_EVENT));
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: async (updatedRequest: LeaveRequest) => {
//       const { error } = await supabase
//         .from('leave_requests')
//         .update({
//           reason: updatedRequest.reason,
//           message: updatedRequest.message,
//           requested_days: updatedRequest.requested_days.map(date => new Date(date).toISOString().split('T')[0]),
//         })
//         .eq('id', updatedRequest.id);

//       if (error) throw new Error(error.message);
//       return updatedRequest;
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Leave request updated successfully",
//       });
//       setIsDialogOpen(false);
//       queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
//       window.dispatchEvent(new CustomEvent(LEAVE_STATUS_CHANGED_EVENT));
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: "Failed to update leave request",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleEdit = (request: LeaveRequest) => {
//     setSelectedRequest(request);
//     setEditReason(request.reason);
//     setEditMessage(request.message || "");
//     setEditDays(request.requested_days.map(day => new Date(day)));
//     setIsDialogOpen(true);
//   };

//   const handleDelete = (id: string) => {
//     deleteMutation.mutate(id);
//   };

//   const handleUpdate = () => {
//     if (!selectedRequest) return;
//     updateMutation.mutate({
//       ...selectedRequest,
//       reason: editReason,
//       message: editMessage,
//       requested_days: editDays,
//     });
//   };

//   const updateStatus = async (requestId: string, newStatus: LeaveStatus) => {
//     try {
//       const { error } = await supabase
//         .from('leave_requests')
//         .update({ status: newStatus })
//         .eq('id', requestId);

//       if (error) throw error;

//       toast({
//         title: "Status Updated",
//         description: `Leave request ${newStatus}`,
//       });

//       queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
//       window.dispatchEvent(new CustomEvent(LEAVE_STATUS_CHANGED_EVENT));
//     } catch (error) {
//       console.error('Error updating status:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update status",
//         variant: "destructive",
//       });
//     }
//   };

//   const getStatusBadge = (status: LeaveStatus) => {
//     const variants = {
//       pending: "bg-[#FEF7CD] text-yellow-800 hover:bg-[#FEF7CD]/80",
//       approved: "bg-[#16a34a] text-white hover:bg-[#16a34a]/80",
//       rejected: "bg-[#ea384c] text-white hover:bg-[#ea384c]/80",
//     };

//     return <Badge className={variants[status]}>{status}</Badge>;
//   };

  

//   const calculateLeaveDays = (days: string[]) => `${days.length} ${days.length === 1 ? 'day' : 'days'}`;

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Your Leave Requests</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center p-4">Loading leave requests...</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Your Leave Requests</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {requests.length === 0 ? (
//           <div className="text-center py-6 text-gray-500">No leave requests found</div>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>No.</TableHead>
//                 {/* visible for kr-admin */}
//                 {role === 'kr_admin' && (
//                   <>
//                     <TableHead>UID</TableHead>
//                   </>
//                 )}
//                 {/* visible for kr-admin */}
//                 <TableHead>Leave Reason</TableHead>
//                 <TableHead>Message</TableHead>
//                 <TableHead>Leave Days</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {requests.map((request, index) => (
//                 <TableRow key={request.id}>
//                   <TableCell>{index + 1}</TableCell>
//                   {/* visible for kr-admin */}
//                   {role === 'kr_admin' && (
//                     <>
//                       <TableCell>{request.user_id}</TableCell>
//                     </>
//                   )}
//                   {/* visible for kr-admin */}

//                   {/* visible for kr-admin */}
//                   <TableCell>{request.reason}</TableCell>
//                   <TableCell>{request.message}</TableCell>
//                   <TableCell>{calculateLeaveDays(request.requested_days)}</TableCell>
//                   <TableCell>
//                     {role === 'kr_admin' ? (
//                       <Select
//                         value={request.status}
//                         onValueChange={(value: LeaveStatus) => updateStatus(request.id, value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="pending">Pending</SelectItem>
//                           <SelectItem value="approved">Approved</SelectItem>
//                           <SelectItem value="rejected">Rejected</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       getStatusBadge(request.status)
//                     )}
//                   </TableCell>
//                   <TableCell className="space-x-2">
//                     <Button variant="outline" size="icon" onClick={() => handleEdit(request)}>
//                       <Pencil className="h-4 w-4" />
//                     </Button>
//                     <Button variant="outline" size="icon" onClick={() => handleDelete(request.id)}>
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Edit Leave Request</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="reason">Reason:</Label>
//                 <Input id="reason" value={editReason} onChange={(e) => setEditReason(e.target.value)} required />
//               </div>
//               <div className="space-y-2">
//                 <Label>Days for Leave:</Label>
//                 <Calendar
//                   mode="multiple"
//                   selected={editDays}
//                   onSelect={setEditDays as any}
//                   className="border rounded-md"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="message">Message:</Label>
//                 <Textarea
//                   id="message"
//                   value={editMessage}
//                   onChange={(e) => setEditMessage(e.target.value)}
//                   className="min-h-[150px]"
//                   required
//                 />
//               </div>
//               {/* already applied */}
//               {/* {role === 'kr_admin' && selectedRequest && (
//                 <div className="space-y-2">
//                   <Label htmlFor="status">Status:</Label>
//                   <Select
//                     value={selectedRequest.status}
//                     onValueChange={(value: LeaveStatus) => {
//                       setSelectedRequest({
//                         ...selectedRequest,
//                         status: value,
//                       });
//                     }}
//                     disabled={role !== 'kr_admin'}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="approved">Approved</SelectItem>
//                       <SelectItem value="rejected">Rejected</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )} */}
//               <Button onClick={handleUpdate} className="w-full">
//                 Update Request
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );
// };

// export default LeaveRequestList;


// Imports remain unchanged
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useRole } from "@/contexts/RoleContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type LeaveStatus = 'pending' | 'approved' | 'rejected';

interface LeaveRequest {
  id: string;
  reason: string;
  message: string;
  requested_days: string[];
  status: LeaveStatus;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const LEAVE_STATUS_CHANGED_EVENT = 'leave-status-changed';

const LeaveRequestList = () => {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editDays, setEditDays] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { role } = useRole();
  const queryClient = useQueryClient();

  const fetchRequests = async (): Promise<LeaveRequest[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be logged in to view leave requests");

    const query = supabase.from('leave_requests').select('*');
    if (role !== 'kr_admin') query.eq('user_id', user.id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return (data || []).map(request => ({
      ...request,
      status: request.status as LeaveStatus
    }));
  };

  const { data: requests = [], isLoading, isError, error } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: fetchRequests,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leave_requests').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['leave-requests'] });

      const previousData = queryClient.getQueryData<LeaveRequest[]>(['leave-requests']);

      queryClient.setQueryData(['leave-requests'], (oldData: LeaveRequest[] = []) =>
        oldData.filter(request => request.id !== id)
      );

      return { previousData };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(['leave-requests'], context?.previousData);
      toast({
        title: "Error",
        description: "Failed to delete leave request",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      window.dispatchEvent(new CustomEvent(LEAVE_STATUS_CHANGED_EVENT));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedRequest: LeaveRequest) => {
      const { error } = await supabase.from('leave_requests')
        .update({
          reason: updatedRequest.reason,
          message: updatedRequest.message,
          requested_days: updatedRequest.requested_days.map(date =>
            new Date(date).toISOString().split('T')[0]
          ),
        })
        .eq('id', updatedRequest.id);

      if (error) throw new Error(error.message);
      return updatedRequest;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Leave request updated successfully" });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      window.dispatchEvent(new CustomEvent(LEAVE_STATUS_CHANGED_EVENT));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setEditReason(request.reason);
    setEditMessage(request.message || "");
    setEditDays(request.requested_days.map(day => new Date(day)));
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const handleUpdate = () => {
    if (!selectedRequest) return;
    updateMutation.mutate({
      ...selectedRequest,
      reason: editReason,
      message: editMessage,
      requested_days: editDays,
    });
  };

  const updateStatus = async (requestId: string, newStatus: LeaveStatus) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: "Status Updated", description: `Leave request ${newStatus}` });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      window.dispatchEvent(new CustomEvent(LEAVE_STATUS_CHANGED_EVENT));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const variants = {
      pending: "bg-[#FEF7CD] text-yellow-800 hover:bg-[#FEF7CD]/80",
      approved: "bg-[#16a34a] text-white hover:bg-[#16a34a]/80",
      rejected: "bg-[#ea384c] text-white hover:bg-[#ea384c]/80",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const calculateLeaveDays = (days: string[]) => `${days.length} ${days.length === 1 ? 'day' : 'days'}`;

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Your Leave Requests</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">Loading leave requests...</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Error</CardTitle></CardHeader>
        <CardContent>
          <div className="text-red-500 p-4">Failed to load leave requests: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Your Leave Requests</CardTitle></CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No leave requests found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                {role === 'kr_admin' && <TableHead>UID</TableHead>}
                <TableHead>Leave Reason</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Leave Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow key={request.id}>
                  <TableCell>{index + 1}</TableCell>
                  {role === 'kr_admin' && <TableCell>{request.user_id}</TableCell>}
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{request.message}</TableCell>
                  <TableCell>{calculateLeaveDays(request.requested_days)}</TableCell>
                  <TableCell>
                    {role === 'kr_admin' ? (
                      <Select value={request.status} onValueChange={(value) => updateStatus(request.id, value as LeaveStatus)}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(request.status)
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(request)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(request.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Leave Request</DialogTitle></DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason:</Label>
                <Input id="reason" value={editReason} onChange={(e) => setEditReason(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Days for Leave:</Label>
                <Calendar mode="multiple" selected={editDays} onSelect={setEditDays as any} className="border rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message:</Label>
                <Textarea id="message" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className="min-h-[150px]" required />
              </div>
              <Button onClick={handleUpdate} className="w-full">Update Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestList;

