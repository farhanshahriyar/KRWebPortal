import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Loader2, Eye, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ValorantProfile {
    id: string;
    user_id: string;
    tracker_url: string;
    riot_name: string;
    riot_tag: string;
    player_data: any;
    status: string;
    created_at: string;
    full_name: string;
    email: string;
}

export function ManageValorantStats() {
    const [profiles, setProfiles] = useState<ValorantProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<ValorantProfile | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            // Fetch all valorant profiles (no join — FK points to auth.users, not profiles)
            const { data: valorantData, error: valorantError } = await supabase
                .from("valorant_profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (valorantError) throw valorantError;
            if (!valorantData || valorantData.length === 0) {
                setProfiles([]);
                return;
            }

            // Collect user IDs to fetch associated profile names and emails
            const userIds = valorantData.map((p) => p.user_id);

            // Fetch full_name from profiles table
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", userIds);

            // Fetch emails via RPC (email lives in auth.users, not profiles)
            const { data: emailsData } = await supabase.rpc("get_user_emails");

            // Build lookup maps
            const nameMap = new Map<string, string>();
            profilesData?.forEach((p) => nameMap.set(p.id, p.full_name || "Unknown"));

            const emailMap = new Map<string, string>();
            emailsData?.forEach((e: { id: string; email: string }) =>
                emailMap.set(e.id, e.email)
            );

            // Merge data
            const merged: ValorantProfile[] = valorantData.map((vp) => ({
                ...vp,
                full_name: nameMap.get(vp.user_id) || "Unknown",
                email: emailMap.get(vp.user_id) || "",
            }));

            setProfiles(merged);
        } catch (error) {
            console.error("Error fetching profiles:", error);
            toast.error("Failed to load profiles");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDeletion = async (profile: ValorantProfile) => {
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("valorant_profiles")
                .delete()
                .eq("id", profile.id);

            if (error) throw error;

            toast.success("Profile deleted successfully");
            await fetchProfiles();
        } catch (error) {
            console.error("Error deleting profile:", error);
            toast.error("Failed to delete profile");
        } finally {
            setActionLoading(false);
            setShowDeleteDialog(false);
            setSelectedProfile(null);
        }
    };

    const handleForceDelete = async (profile: ValorantProfile) => {
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from("valorant_profiles")
                .delete()
                .eq("id", profile.id);

            if (error) throw error;

            toast.success("Profile force deleted");
            await fetchProfiles();
        } catch (error) {
            console.error("Error force deleting profile:", error);
            toast.error("Failed to delete profile");
        } finally {
            setActionLoading(false);
            setShowDeleteDialog(false);
            setSelectedProfile(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Manage Valorant Members Stats</h1>
                <p className="text-muted-foreground">
                    View and manage all member Valorant profiles
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Profiles ({profiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Riot ID</TableHead>
                                <TableHead>Rank</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No profiles found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profiles.map((profile) => (
                                    <TableRow key={profile.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{profile.full_name || "Unknown"}</div>
                                                <div className="text-sm text-muted-foreground">{profile.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm">
                                                {profile.riot_name}#{profile.riot_tag}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {profile.player_data?.mmr?.current_data?.currenttierpatched || "Unranked"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {profile.player_data?.mmr?.current_data?.elo || 0} MMR
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="text-white" variant={profile.status === "active" ? "default" : "destructive"}>
                                                {profile.status === "active" ? "Active" : "Pending Delete"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedProfile(profile);
                                                        setShowViewDialog(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {profile.status === "pending_delete" ? (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedProfile(profile);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedProfile(profile);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Dialog */}
            <AlertDialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedProfile?.riot_name}#{selectedProfile?.riot_tag}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Profile details for {selectedProfile?.full_name}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Tracker URL</div>
                                <a
                                    href={selectedProfile?.tracker_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    View on tracker.gg
                                </a>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Current Rank</div>
                                <div className="font-semibold">
                                    {selectedProfile?.player_data?.mmr?.current_data?.currenttierpatched || "Unranked"}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">MMR</div>
                                <div className="font-semibold">
                                    {selectedProfile?.player_data?.mmr?.current_data?.elo || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Account Level</div>
                                <div className="font-semibold">
                                    {selectedProfile?.player_data?.account?.account_level || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedProfile?.status === "pending_delete" ? "Approve Deletion?" : "Delete Profile?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedProfile?.status === "pending_delete"
                                ? `Approve the deletion request from ${selectedProfile?.full_name}? This action cannot be undone.`
                                : `Force delete ${selectedProfile?.full_name}'s Valorant profile? This action cannot be undone.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedProfile?.status === "pending_delete") {
                                    handleApproveDeletion(selectedProfile);
                                } else if (selectedProfile) {
                                    handleForceDelete(selectedProfile);
                                }
                            }}
                            disabled={actionLoading}
                            className="bg-destructive text-destructive-foreground"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
