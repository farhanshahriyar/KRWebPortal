import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NOCStatus = 'pending' | 'approved' | 'rejected';

interface NOCRequest {
  id: string;
  reason: string;
  message: string;
  requested_days: string[];
  status: NOCStatus;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const NOCList = () => {
  const [selectedNOC, setSelectedNOC] = useState<NOCRequest | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editDays, setEditDays] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast({
          title: "Error",
          description: "User is not authenticated",
          variant: "destructive",
        });
        return;
      }
      setUser(user); // Store user data in state
    };

    fetchUser();
  }, []); // Runs only once on mount

  useEffect(() => {
    // Real-time subscription setup
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'noc_requests' }, (payload) => {
        console.log('Real-time update:', payload);
        queryClient.invalidateQueries({ queryKey: ['noc-requests'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Cleanup on unmount
    };
  }, [queryClient]);

  const { data: nocs = [], isLoading, error } = useQuery({
    queryKey: ['noc-requests'],
    queryFn: async () => {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const query = supabase
        .from('noc_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (role !== 'kr_admin') {
        query.eq('user_id', user.id); // Filter by user
      }

      const { data, error: fetchError } = await query;
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      return (data || []).map(noc => ({
        ...noc,
        status: noc.status as NOCStatus,
      }));
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load NOC requests: " + (error as Error).message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("No ID provided for deletion");
      }

      // Delete NOC request from Supabase
      const { error, data, status, count, statusText } = await supabase
        .from('noc_requests')
        .delete()
        .eq('id', id);
      console.log(error, id, data, status, count, statusText);  // Log for debugging
      if (error) {
        throw new Error(error.message);
      }

      return id;
    },

    // Optimistic UI update - directly update the cache before the mutation happens
    onMutate: async (id) => {
      console.log("Optimistically deleting ID:", id);  // Log to ensure correct ID
      await queryClient.cancelQueries({ queryKey: ['noc-requests'] });
      const previousData = queryClient.getQueryData(['noc-requests']);
      console.log("Previous data before deletion:", previousData);  // Log for debugging

      // Update the query data optimistically by removing the deleted NOC request from the cache
      queryClient.setQueryData(['noc-requests'], (oldData: any) =>
        oldData.filter((noc: NOCRequest) => noc.id !== id)
      );

      return { previousData };  // Return the previous data for rollback if needed
    },

    onError: (error, id, context) => {
      console.error("Error in deletion:", error);
      queryClient.setQueryData(['noc-requests'], context.previousData);  // Rollback if error occurs
      toast({
        title: "Error",
        description: "Failed to delete NOC request: " + error.message,
        variant: "destructive",
      });
    },

    onSuccess: (deletedId) => {
      console.log("Delete Mutation Success for ID:", deletedId); // Log success
      toast({
        title: "Success",
        description: "NOC request deleted successfully",
      });

      // Refetch the data explicitly after mutation to ensure the UI reflects the change
      queryClient.invalidateQueries({ queryKey: ['noc-requests'] });
      queryClient.refetchQueries({ queryKey: ['noc-requests'] });  // Force a refetch to refresh the data
    },
  });

  // Define the updateMutation for editing the NOC requests
  const updateMutation = useMutation({
    mutationFn: async (nocData: { id: string; reason: string; message: string; requested_days: string[]; status?: string }) => {
      const { error } = await supabase
        .from('noc_requests')
        .update({
          reason: nocData.reason,
          message: nocData.message,
          requested_days: nocData.requested_days,
          status: nocData.status,
        })
        .eq('id', nocData.id);

      if (error) throw new Error(error.message);
      return nocData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "NOC request updated successfully",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['noc-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update NOC request: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (noc: NOCRequest) => {
    setSelectedNOC(noc);
    setEditReason(noc.reason);
    setEditMessage(noc.message || "");
    setEditDays(noc.requested_days.map(day => new Date(day)));
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log("Setting delete ID:", id);  // Ensure ID is being passed correctly
    setDeleteId(id);  // Set the delete ID when delete button is clicked
    setIsDeleteAlertOpen(true);  // Open the confirmation alert dialog
  };

  const confirmDelete = () => {
    if (deleteId) {
      console.log("Confirming delete for ID:", deleteId);  // Verify ID
      deleteMutation.mutate(deleteId);  // Trigger deletion
    } else {
      console.error("No item selected for deletion");  // Handle edge case
      toast({
        title: "Error",
        description: "No item selected for deletion",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = () => {
    if (!selectedNOC) return;

    updateMutation.mutate({
      id: selectedNOC.id,
      reason: editReason,
      message: editMessage,
      requested_days: editDays.map(date => date.toISOString().split('T')[0]),
    });
  };

  const getStatusBadge = (status: NOCStatus) => {
    const variants = {
      pending: "bg-[#FEF7CD] text-yellow-800 hover:bg-[#FEF7CD]/80",
      approved: "bg-[#16a34a] text-white hover:bg-[#16a34a]/80",
      rejected: "bg-[#ea384c] text-white hover:bg-[#ea384c]/80",
    };

    return (
      <Badge className={`px-3 py-1 text-sm font-medium rounded-full ${variants[status]}`}>
        {status}
      </Badge>
    );
  };

  const calculateNOCDays = (days: string[]) => `${days.length} days`;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your NOC Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Your NOC Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  {/* visible for kr-admin */}
                  {role === 'kr_admin' && (
                    <>
                      <TableHead>UID</TableHead>
                    </>
                  )}
                  {/* visible for kr-admin */}
                  <TableHead>NOC Reason</TableHead>
                  <TableHead>NOC Message</TableHead>
                  <TableHead>NOC Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No NOC requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  nocs.map((noc, index) => (
                    <TableRow key={noc.id}>
                      <TableCell>{index + 1}</TableCell>
                      {/* visible for kr-admin */}
                      {role === 'kr_admin' && (
                        <>
                          <TableCell>{noc.user_id}</TableCell>
                          {/* visible for kr-admin */}
                        </>
                      )}
                      <TableCell>{noc.reason}</TableCell>
                      <TableCell>{noc.message}</TableCell>
                      <TableCell>{calculateNOCDays(noc.requested_days)}</TableCell>
                      <TableCell>{getStatusBadge(noc.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(noc)}
                          disabled={deleteMutation.isPending || updateMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(noc.id)}
                          disabled={deleteMutation.isPending || updateMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit NOC Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason:</label>
              <Input
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                required
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Days for NOC:</label>
              <Calendar
                mode="multiple"
                selected={editDays}
                onSelect={setEditDays as any}
                className="border rounded-md"
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="min-h-[150px]"
                required
                disabled={updateMutation.isPending}
              />
            </div>

            {role === 'kr_admin' && selectedNOC && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status:</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={selectedNOC.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as NOCStatus;
                    updateMutation.mutate({
                      id: selectedNOC.id,
                      reason: selectedNOC.reason,
                      status: newStatus,
                      message: selectedNOC.message,
                      requested_days: selectedNOC.requested_days
                    });
                  }}
                  disabled={role !== 'kr_admin' || updateMutation.isPending}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <Button
              onClick={handleUpdate}
              className="w-full text-slate-50"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update NOC"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the NOC request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NOCList;
