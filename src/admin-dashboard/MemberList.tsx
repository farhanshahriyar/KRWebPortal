import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client"; 
import { Tables } from "../integrations/supabase/types"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditMemberDialog } from "./EditMemberDialog";
import { formatDistanceToNow } from "date-fns";
import { ProtectedComponent } from "@/components/ProtectedComponent";

export function MembersList() {
  const [users, setUsers] = useState<Tables<'profiles'>[]>([]);
  const [selectedUser, setSelectedUser] = useState<Tables<'profiles'> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch the users (profiles) data from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();

    // For supabase-js v2.x, use `.channel` for real-time subscription
    const userChannel = supabase
      .channel('profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        console.log('Received payload:', payload);
        if (payload.eventType === 'INSERT') {
          setUsers((prevUsers) => [...prevUsers, payload.new]); // Add new user
        } else if (payload.eventType === 'UPDATE') {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === payload.new.id ? payload.new : user
            )
          ); // Update existing user
        } else if (payload.eventType === 'DELETE') {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== payload.old.id)
          ); // Remove deleted user
        }
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      userChannel.unsubscribe();
    };
  }, []);

  const handleDelete = async (userId: string) => {
    try {
      console.log("Deleting user with id:", userId); // Added console log for debugging
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error("Error deleting user:", error);
      } else {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error("Error in deleting user:", error);
    }
  };

  const handleEdit = (user: Tables<'profiles'>) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (updatedUser: Tables<'profiles'>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedUser)
        .eq('id', updatedUser.id);
        
      if (error) {
        console.error("Error updating user:", error);
      } else {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error in updating user:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              {/* <TableHead>Email</TableHead> */}
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} alt={user.username} />
                    <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.role}</TableCell>
                {/* <TableCell>{user.email}</TableCell>  */}
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <ProtectedComponent feature="members.edit">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </ProtectedComponent>
                    <ProtectedComponent feature="members.delete">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </ProtectedComponent>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditMemberDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateUser}
      />
    </div>
  );
}
