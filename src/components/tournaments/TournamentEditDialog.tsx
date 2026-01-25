import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tournament, participationStatusOptions } from "./types";
import { Loader2 } from "lucide-react";

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

interface TournamentEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tournament: Tournament | null;
}

const TournamentEditDialog = ({
    open,
    onOpenChange,
    tournament,
}: TournamentEditDialogProps) => {
    const { role } = useRole();
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

    // Reset form when tournament changes
    useEffect(() => {
        if (tournament) {
            form.reset({
                name: tournament.name || "",
                activity_type: tournament.activity_type || "",
                start_date: tournament.start_date || "",
                start_time: tournament.start_time || "",
                match_day: tournament.match_day || "",
                location: tournament.location || "Online",
                hoster_name: tournament.hoster_name || "",
                discord_server_link: tournament.discord_server_link || "",
                roster_players: tournament.roster_players || "",
                tournament_link: tournament.tournament_link || "",
                price_pool: tournament.price_pool || "",
                entry_fee: tournament.entry_fee || "",
                participation_status: tournament.participation_status || "pending",
                notes: tournament.notes || "",
            });
        }
    }, [tournament, form]);

    const updateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            if (!tournament) throw new Error("No tournament selected");

            const updateData: Record<string, unknown> = {
                name: data.name,
                activity_type: data.activity_type,
                start_date: data.start_date,
                start_time: data.start_time || null,
                match_day: data.match_day || null,
                location: data.location,
                hoster_name: data.hoster_name || null,
                discord_server_link: data.discord_server_link || null,
                roster_players: data.roster_players || null,
                tournament_link: data.tournament_link || null,
                price_pool: data.price_pool || null,
                entry_fee: data.entry_fee || null,
                notes: data.notes || null,
                updated_at: new Date().toISOString(),
            };

            // Only Admin can update status (explicit role check)
            if (role === "kr_admin") {
                updateData.participation_status = data.participation_status;
            }

            const { error } = await supabase
                .from("tournaments")
                .update(updateData)
                .eq("id", tournament.id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Tournament updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tournaments"] });
            onOpenChange(false);
        },
        onError: (err) => {
            const message = err instanceof Error ? err.message : "Failed to update tournament";
            toast.error(message);
        },
    });

    const onSubmit = (data: FormData) => {
        updateMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Tournament</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tournament Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
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
                                        <FormLabel>Activity Type *</FormLabel>
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
                                            <Input placeholder="e.g., Day 1, Finals" {...field} />
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
                                            <Input placeholder="Online or venue" {...field} />
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
                                        <FormLabel>Hoster Name</FormLabel>
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
                                        <FormLabel>Roster/Players</FormLabel>
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
                                            <Input placeholder="e.g., $1000" {...field} />
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
                                            <Input placeholder="e.g., Free, $50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Participation Status - Only visible to Admin (explicit role check) */}
                            {role === "kr_admin" && (
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
                                    <FormItem className="col-span-2">
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Any additional notes..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Tournament"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TournamentEditDialog;
