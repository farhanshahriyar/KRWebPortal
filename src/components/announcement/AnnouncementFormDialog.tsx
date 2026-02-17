import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

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

interface AnnouncementFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    announcementToEdit: Announcement | null;
    onSuccess: () => void;
}

export function AnnouncementFormDialog({
    open,
    onOpenChange,
    announcementToEdit,
    onSuccess,
}: AnnouncementFormDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("General");
    const [priority, setPriority] = useState("normal");
    const [isPinned, setIsPinned] = useState(false);

    const isEditing = !!announcementToEdit;

    // Populate form when editing
    useEffect(() => {
        if (announcementToEdit) {
            setTitle(announcementToEdit.title);
            setContent(announcementToEdit.content);
            setType(announcementToEdit.type);
            setPriority(announcementToEdit.priority);
            setIsPinned(announcementToEdit.is_pinned);
        } else {
            setTitle("");
            setContent("");
            setType("General");
            setPriority("normal");
            setIsPinned(false);
        }
    }, [announcementToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Title and content are required.",
            });
            return;
        }

        setLoading(true);

        try {
            if (isEditing) {
                const { error } = await supabase
                    .from("announcements")
                    .update({
                        title: title.trim(),
                        content: content.trim(),
                        type,
                        priority,
                        is_pinned: isPinned,
                    })
                    .eq("id", announcementToEdit.id);

                if (error) throw error;

                toast({
                    title: "Updated",
                    description: "Announcement updated successfully.",
                });
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { error } = await supabase
                    .from("announcements")
                    .insert({
                        title: title.trim(),
                        content: content.trim(),
                        type,
                        priority,
                        is_pinned: isPinned,
                        created_by: user.id,
                    });

                if (error) throw error;

                toast({
                    title: "Created",
                    description: "Announcement created successfully.",
                });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving announcement:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to save announcement.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit Announcement" : "New Announcement"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Update the announcement details below."
                                : "Create a new announcement for all KR members."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Announcement title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Content */}
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Write your announcement here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                required
                                className="resize-none"
                            />
                        </div>

                        {/* Type & Priority row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Tournament">Tournament</SelectItem>
                                        <SelectItem value="Team">Team</SelectItem>
                                        <SelectItem value="Important">Important</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Pin toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="pinned" className="text-sm font-medium">
                                    Pin Announcement
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Pinned announcements appear at the top of the list.
                                </p>
                            </div>
                            <Switch
                                id="pinned"
                                checked={isPinned}
                                onCheckedChange={setIsPinned}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
