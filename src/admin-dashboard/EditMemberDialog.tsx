import { useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRole } from "@/contexts/RoleContext";

// All available roles
const allRoles = ["kr_admin", "kr_manager", "kr_igl", "kr_member"] as const;

// Match Supabase 'profiles' table exactly
const userFormSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  full_name: z.string().min(3),
  role: z.enum(allRoles),
  avatar_url: z.string().url().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// Role display names
const roleDisplayNames: Record<string, string> = {
  kr_admin: "KR Admin",
  kr_manager: "KR Manager",
  kr_igl: "KR IGL",
  kr_member: "KR Member",
};

interface EditMemberDialogProps {
  user: UserFormValues | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: UserFormValues) => void;
}

export function EditMemberDialog({ user, open, onOpenChange, onSave }: EditMemberDialogProps) {
  const { role: currentUserRole } = useRole();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user || {
      id: "",
      username: "",
      full_name: "",
      role: "kr_member",
      avatar_url: null,
      created_at: "",
      updated_at: null,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset(user);
    }
  }, [user, form]);

  // Determine which roles the current user can assign
  const availableRoles = useMemo(() => {
    if (currentUserRole === "kr_admin") {
      // Admin can assign all roles
      return allRoles;
    } else if (currentUserRole === "kr_manager") {
      // Manager can only assign KR Member and KR IGL
      return ["kr_member", "kr_igl"] as const;
    }
    // Default: no roles (shouldn't happen as only admin/manager can edit)
    return [] as const;
  }, [currentUserRole]);

  const onSubmit = (data: UserFormValues) => {
    onSave(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                <AvatarFallback>
                  {(user.username || "??").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "id", label: "UID", disabled: true },
                { name: "username", label: "Username" },
                { name: "full_name", label: "Full Name" },
                { name: "created_at", label: "Created At", disabled: true },
                { name: "updated_at", label: "Updated At", disabled: true },
              ].map(({ name, label, disabled }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof UserFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={disabled} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((roleValue) => (
                          <SelectItem key={roleValue} value={roleValue}>
                            {roleDisplayNames[roleValue] || roleValue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

