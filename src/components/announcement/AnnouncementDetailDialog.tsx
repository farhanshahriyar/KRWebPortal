import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    CalendarDays,
    Eye,
    Pin,
    Trophy,
    Users,
    MessageSquare,
    AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

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

interface AnnouncementDetailDialogProps {
    announcement: Announcement | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    viewCount?: number;
}

export function AnnouncementDetailDialog({
    announcement,
    open,
    onOpenChange,
    viewCount,
}: AnnouncementDetailDialogProps) {
    const { role } = useRole();
    const [hasRecordedView, setHasRecordedView] = useState(false);

    // Record view when the dialog opens
    useEffect(() => {
        if (!open || !announcement || hasRecordedView) return;

        const recordView = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Upsert — won't duplicate due to UNIQUE constraint
            await supabase
                .from("announcement_views")
                .upsert(
                    {
                        announcement_id: announcement.id,
                        user_id: user.id,
                    },
                    { onConflict: "announcement_id,user_id" }
                );

            setHasRecordedView(true);
        };

        recordView();
    }, [open, announcement, hasRecordedView]);

    // Reset when announcement changes
    useEffect(() => {
        setHasRecordedView(false);
    }, [announcement?.id]);

    if (!announcement) return null;

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
                <DialogHeader>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
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
                        {role === "kr_admin" && viewCount !== undefined && (
                            <Badge variant="outline" className="gap-1 ml-auto">
                                <Eye className="h-3 w-3" />
                                {viewCount} {viewCount === 1 ? "view" : "views"}
                            </Badge>
                        )}
                    </div>
                    <DialogTitle className="text-xl leading-tight">
                        {announcement.title}
                    </DialogTitle>
                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                        {new Date(announcement.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                </DialogHeader>

                <Separator />

                <ScrollArea className="max-h-[50vh] pr-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                        {announcement.content}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
