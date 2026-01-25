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
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tournament } from "./types";
import { Loader2 } from "lucide-react";

interface TournamentDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tournament: Tournament | null;
}

const TournamentDeleteDialog = ({
    open,
    onOpenChange,
    tournament,
}: TournamentDeleteDialogProps) => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!tournament) throw new Error("No tournament selected");

            const { error } = await supabase
                .from("tournaments")
                .delete()
                .eq("id", tournament.id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Tournament deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tournaments"] });
            onOpenChange(false);
        },
        onError: (err) => {
            const message = err instanceof Error ? err.message : "Failed to delete tournament";
            toast.error(message);
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{tournament?.name}</span>? This
                        action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default TournamentDeleteDialog;
