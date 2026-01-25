import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { participationStatusOptions } from "./TournamentTable";

const activityTypeOptions = [
  "Valorant",
  "CS2",
  "League of Legends",
  "Dota 2",
  "PUBG",
  "Fortnite",
  "Apex Legends",
  "Overwatch 2",
  "Other",
];

const rosterOptions = [
  "KingsRock Official",
  "KR Rivals",
  "KR Delta",
  "KR Academy",
  "Mixed Roster",
];

const formSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  activity_type: z.string().min(1, "Activity type is required"),
  start_date: z.string().min(1, "Start date is required"),
  start_time: z.string().optional(),
  match_day: z.string().optional(),
  location: z.string().default("Online"),
  hoster_name: z.string().optional(),
  discord_server_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  roster_players: z.string().optional(),
  tournament_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price_pool: z.string().optional(),
  entry_fee: z.string().optional(),
  participation_status: z.string().default("pending"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const TournamentForm = () => {
  const { canAccess } = useRole();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      activity_type: "",
      start_date: "",
      start_time: "",
      match_day: "",
      location: "Online",
      hoster_name: "",
      discord_server_link: "",
      roster_players: "",
      tournament_link: "",
      price_pool: "",
      entry_fee: "",
      participation_status: "pending",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You must be logged in");

      const insertData = {
        name: data.name,
        activity_type: data.activity_type,
        start_date: data.start_date,
        start_time: data.start_time || null,
        match_day: data.match_day || null,
        location: data.location || "Online",
        hoster_name: data.hoster_name || null,
        discord_server_link: data.discord_server_link || null,
        roster_players: data.roster_players || null,
        tournament_link: data.tournament_link || null,
        price_pool: data.price_pool || null,
        entry_fee: data.entry_fee || null,
        participation_status: canAccess("tournaments.status")
          ? data.participation_status
          : "pending", // Managers always start with pending
        notes: data.notes || null,
        created_by: userData.user.id,
      };

      const { error } = await supabase
        .from("tournaments")
        .insert([insertData]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tournament added successfully!");
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      form.reset();
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to add tournament";
      toast.error(message);
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tournament Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Tournament Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tournament name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activity Type */}
              <FormField
                control={form.control}
                name="activity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type (Game) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Match Day */}
              <FormField
                control={form.control}
                name="match_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Day</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Day 1, Quarterfinals, Finals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Online or venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hoster Name */}
              <FormField
                control={form.control}
                name="hoster_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hoster/Organizer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tournament organizer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discord Server Link */}
              <FormField
                control={form.control}
                name="discord_server_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord Server Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://discord.gg/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tournament Link */}
              <FormField
                control={form.control}
                name="tournament_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roster/Players */}
              <FormField
                control={form.control}
                name="roster_players"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roster/Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select roster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rosterOptions.map((roster) => (
                          <SelectItem key={roster} value={roster}>
                            {roster}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Pool */}
              <FormField
                control={form.control}
                name="price_pool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Pool</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $1,000 or 10,000/- BDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Entry Fee */}
              <FormField
                control={form.control}
                name="entry_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Fee</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Free, $50, 500/- BDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Participation Status - Only visible to Admin when creating */}
              {canAccess("tournaments.status") && (
                <FormField
                  control={form.control}
                  name="participation_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participation Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {participationStatusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this tournament..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info message for managers */}
            {!canAccess("tournaments.status") && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <strong>Note:</strong> Your tournament will be added with "Pending" status.
                An admin will review and update the participation status.
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Tournament"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TournamentForm;