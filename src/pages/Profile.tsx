import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const formSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  full_name: z.string().min(2).max(50),
  phone_number: z.string().min(10).max(15).optional().or(z.literal("")),
  discord_id: z.string().min(2).max(50).optional().or(z.literal("")),
  facebook_id: z.string().max(100).optional().or(z.literal("")),
});

export default function Profile() {
  const { toast } = useToast();
  const { getRoleDisplay } = useRole();
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const profileData = profile as any;
          form.reset({
            username: profile.username || "",
            full_name: profile.full_name || "",
            email: user.email || "",
            phone_number: profileData.phone_number || "",
            discord_id: profileData.discord_id || "",
            facebook_id: profileData.facebook_id || "",
          });
          setCreatedAt(profile.created_at);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "There was a problem loading your profile.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No user found');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          full_name: values.full_name,
          phone_number: values.phone_number || null,
          discord_id: values.discord_id || null,
          facebook_id: values.facebook_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Profile Settings</h2>
        <p className="text-muted-foreground mb-8">
          This is how others will see you on the site.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name. You have to put your IGN here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              disabled
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-muted" />
                  </FormControl>
                  <FormDescription>
                    Your verified email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Role</FormLabel>
              <div className="p-3 bg-muted rounded-md">
                {getRoleDisplay()}
              </div>
              <FormDescription>
                Your role in the KingsRock organization.
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+880 1XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your contact phone number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discord_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord ID</FormLabel>
                  <FormControl>
                    <Input placeholder="username#1234 or username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Discord username for team communication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facebook_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook Profile ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="facebook.com/yourprofile" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Facebook profile URL or ID.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Member Since</FormLabel>
              <div className="p-3 bg-muted rounded-md">
                {createdAt ? format(new Date(createdAt), 'PPP') : 'Loading...'}
              </div>
              <FormDescription>
                The date you joined KingsRock.
              </FormDescription>
            </div>

            <Button type="submit" disabled={loading}>
              Update profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}