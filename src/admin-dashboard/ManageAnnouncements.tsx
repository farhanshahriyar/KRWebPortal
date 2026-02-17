import { useEffect, useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Eye,
    Pin,
    Megaphone,
    Trophy,
    Users,
    MessageSquare,
    AlertTriangle,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AnnouncementFormDialog } from "@/components/announcement/AnnouncementFormDialog";

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    created_by: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

export function ManageAnnouncements() {
    const { role } = useRole();
    const { toast } = useToast();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        if (role === "kr_admin") {
            fetchAnnouncements();
            fetchViewCounts();
        }
    }, [role]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("announcements")
            .select("*")
            .order("is_pinned", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching announcements:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch announcements.",
            });
        } else {
            setAnnouncements(data as Announcement[]);
        }
        setLoading(false);
    };

    const fetchViewCounts = async () => {
        const { data, error } = await supabase.rpc("get_announcement_view_counts");
        if (!error && data) {
            const counts: Record<string, number> = {};
            data.forEach((row: { announcement_id: string; view_count: number }) => {
                counts[row.announcement_id] = row.view_count;
            });
            setViewCounts(counts);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const { error } = await supabase
            .from("announcements")
            .delete()
            .eq("id", deleteId);

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete announcement.",
            });
        } else {
            toast({
                title: "Deleted",
                description: "Announcement deleted successfully.",
            });
            fetchAnnouncements();
            fetchViewCounts();
        }
        setDeleteId(null);
    };

    const handleEdit = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedAnnouncement(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        fetchAnnouncements();
        fetchViewCounts();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-500/90 text-white hover:bg-red-500";
            case "medium":
                return "bg-amber-500/90 text-white hover:bg-amber-500";
            case "normal":
                return "bg-blue-500/90 text-white hover:bg-blue-500";
            default:
                return "bg-gray-500/90 text-white hover:bg-gray-500";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Tournament":
                return <Trophy className="h-4 w-4" />;
            case "Team":
                return <Users className="h-4 w-4" />;
            case "Important":
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    if (role !== "kr_admin") {
        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            You don't have permission to access this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                        <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Manage Announcements</h1>
                        <p className="text-sm text-muted-foreground">
                            Create, edit, and manage KR announcements
                        </p>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 pb-6">
                                <div className="flex flex-col items-center justify-center text-center py-8">
                                    <Megaphone className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-semibold">No Announcements</h3>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                                        Create your first announcement to get started.
                                    </p>
                                    <Button onClick={handleCreate} variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Announcement
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        announcements.map((announcement) => (
                            <Card key={announcement.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                {announcement.is_pinned && (
                                                    <Badge variant="outline" className="gap-1 text-xs border-amber-400 text-amber-500">
                                                        <Pin className="h-3 w-3" />
                                                        Pinned
                                                    </Badge>
                                                )}
                                                <Badge className={getPriorityColor(announcement.priority)}>
                                                    {announcement.priority.toUpperCase()}
                                                </Badge>
                                                <Badge variant="secondary" className="gap-1">
                                                    {getTypeIcon(announcement.type)}
                                                    {announcement.type}
                                                </Badge>

                                                {/* View count badge */}
                                                <Badge variant="outline" className="gap-1 ml-auto">
                                                    <Eye className="h-3 w-3" />
                                                    {viewCounts[announcement.id] || 0} views
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg line-clamp-1">
                                                {announcement.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {new Date(announcement.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(announcement)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setDeleteId(announcement.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete
                                                            the announcement "{announcement.title}" and all associated
                                                            view records.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDelete}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {announcement.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <AnnouncementFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                announcementToEdit={selectedAnnouncement}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
