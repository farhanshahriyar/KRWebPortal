import { useState, useEffect, useMemo } from "react";
import { supabase } from "../integrations/supabase/client";
import { Tables } from "../integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditMemberDialog } from "./EditMemberDialog";
import { ViewMemberDialog, formatRoleName } from "./ViewMemberDialog";
import { formatDistanceToNow } from "date-fns";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { useRole } from "@/contexts/RoleContext";

export function MembersList() {
  const [users, setUsers] = useState<Tables<'profiles'>[]>([]);
  const { role } = useRole();
  const [selectedUser, setSelectedUser] = useState<Tables<'profiles'> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => {
      const username = (user.username || "").toLowerCase();
      const fullName = (user.full_name || "").toLowerCase();
      const role = formatRoleName(user.role).toLowerCase();
      return username.includes(query) || fullName.includes(query) || role.includes(query);
    });
  }, [users, searchQuery]);

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

    const fetchEmails = async () => {
      const { data, error } = await supabase.rpc('get_user_emails');
      if (error) {
        console.error("Error fetching emails:", error);
      } else if (data) {
        const map: Record<string, string> = {};
        (data as { id: string; email: string }[]).forEach((u) => {
          map[u.id] = u.email;
        });
        setEmailMap(map);
      }
    };

    fetchUsers();
    fetchEmails();

    // For supabase-js v2.x, use `.channel` for real-time subscription
    const userChannel = supabase
      .channel('profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        console.log('Received payload:', payload);
        if (payload.eventType === 'INSERT') {
          setUsers((prevUsers) => [...prevUsers, payload.new as Tables<'profiles'>]); // Add new user
        } else if (payload.eventType === 'UPDATE') {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === (payload.new as Tables<'profiles'>).id ? (payload.new as Tables<'profiles'>) : user
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

  const handleView = (user: Tables<'profiles'>) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
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
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by username, full name, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              {/* <TableHead>Email</TableHead> */}
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} alt={user.username} />
                    <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{formatRoleName(user.role)}</TableCell>
                {/* <TableCell>{user.email}</TableCell>  */}
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(user)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <ProtectedComponent feature="members.edit">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </ProtectedComponent>
                    {role === 'kr_admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
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

      <ViewMemberDialog
        user={selectedUser}
        email={selectedUser ? emailMap[selectedUser.id] || null : null}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  );
}
