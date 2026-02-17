import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Video,
    Plus,
    Clock,
    MessageSquare,
    AlertTriangle,
    Lightbulb,
    Star,
    CalendarDays,
    User,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { mockVods, mockMatches } from "@/components/team/mockData";
import { Vod, VodNote, VodNoteTag } from "@/components/team/types";
import { toast } from "sonner";

const noteTagConfig: Record<VodNoteTag, { icon: typeof AlertTriangle; color: string; bg: string }> = {
    Mistake: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-500/10 border-red-500/20" },
    Strategy: { icon: Lightbulb, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20" },
    "Good Play": { icon: Star, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

export default function TeamVods() {
    const { canAccess } = useRole();
    const [vods, setVods] = useState<Vod[]>(mockVods);
    const [expandedVod, setExpandedVod] = useState<string | null>(null);

    // Upload VOD form
    const [uploadOpen, setUploadOpen] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formUrl, setFormUrl] = useState("");
    const [formMatchId, setFormMatchId] = useState("");

    // Add note form
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteVodId, setNoteVodId] = useState<string | null>(null);
    const [noteTimestamp, setNoteTimestamp] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [noteTag, setNoteTag] = useState<VodNoteTag>("Strategy");

    const handleUpload = () => {
        if (!formTitle.trim() || !formUrl.trim()) {
            toast.error("Title and YouTube URL are required");
            return;
        }

        // Convert watch URL to embed URL
        let embedUrl = formUrl;
        if (formUrl.includes("watch?v=")) {
            embedUrl = formUrl.replace("watch?v=", "embed/");
        } else if (formUrl.includes("youtu.be/")) {
            const videoId = formUrl.split("youtu.be/")[1]?.split("?")[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        const matchLabel = formMatchId
            ? mockMatches.find((m) => m.id === formMatchId)?.opponent
                ? `vs ${mockMatches.find((m) => m.id === formMatchId)?.opponent}`
                : undefined
            : undefined;

        const newVod: Vod = {
            id: `vod${Date.now()}`,
            title: formTitle,
            youtubeUrl: embedUrl,
            matchId: formMatchId || undefined,
            matchLabel: matchLabel,
            uploadedAt: new Date().toISOString(),
            uploadedBy: "You",
            notes: [],
        };

        setVods((prev) => [newVod, ...prev]);
        toast.success("VOD uploaded");
        setUploadOpen(false);
        setFormTitle("");
        setFormUrl("");
        setFormMatchId("");
    };

    const openAddNote = (vodId: string) => {
        setNoteVodId(vodId);
        setNoteTimestamp("");
        setNoteContent("");
        setNoteTag("Strategy");
        setNoteDialogOpen(true);
    };

    const handleAddNote = () => {
        if (!noteVodId || !noteTimestamp || !noteContent.trim()) {
            toast.error("Timestamp and note content are required");
            return;
        }

        const newNote: VodNote = {
            id: `n${Date.now()}`,
            timestamp: noteTimestamp,
            content: noteContent,
            tag: noteTag,
            author: "You",
        };

        setVods((prev) =>
            prev.map((v) =>
                v.id === noteVodId
                    ? { ...v, notes: [...v.notes, newNote] }
                    : v
            )
        );
        toast.success("Note added");
        setNoteDialogOpen(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                        <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">VOD Review</h1>
                        <p className="text-sm text-muted-foreground">
                            {vods.length} video{vods.length !== 1 ? "s" : ""} uploaded
                        </p>
                    </div>
                </div>
                {canAccess("team.vods.manage") && (
                    <Button onClick={() => setUploadOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Upload VOD
                    </Button>
                )}
            </div>

            {/* VOD List */}
            {vods.length === 0 ? (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Video className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold">No VODs Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Upload a VOD to start reviewing gameplay.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {vods.map((vod) => (
                        <Card key={vod.id} className="overflow-hidden">
                            {/* Video Header */}
                            <div className="p-5">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{vod.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            {vod.matchLabel && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {vod.matchLabel}
                                                </Badge>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {new Date(vod.uploadedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                {vod.uploadedBy}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {canAccess("team.vods.manage") && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openAddNote(vod.id)}
                                                className="gap-1.5"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                Add Note
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setExpandedVod(expandedVod === vod.id ? null : vod.id)
                                            }
                                        >
                                            {expandedVod === vod.id ? "Collapse" : `Notes (${vod.notes.length})`}
                                        </Button>
                                    </div>
                                </div>

                                {/* YouTube Embed */}
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                    <iframe
                                        src={vod.youtubeUrl}
                                        title={vod.title}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>

                            {/* Timestamped Notes */}
                            {expandedVod === vod.id && vod.notes.length > 0 && (
                                <div className="border-t px-5 py-4 bg-muted/30">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        Timestamped Notes
                                    </h4>
                                    <div className="space-y-2">
                                        {vod.notes
                                            .sort((a, b) => {
                                                const timeA = a.timestamp.split(":").reduce((acc, t) => acc * 60 + parseInt(t), 0);
                                                const timeB = b.timestamp.split(":").reduce((acc, t) => acc * 60 + parseInt(t), 0);
                                                return timeA - timeB;
                                            })
                                            .map((note) => {
                                                const config = noteTagConfig[note.tag];
                                                const TagIcon = config.icon;
                                                return (
                                                    <div
                                                        key={note.id}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg}`}
                                                    >
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Badge variant="outline" className="font-mono text-xs border-muted-foreground/30">
                                                                <Clock className="h-2.5 w-2.5 mr-1" />
                                                                {note.timestamp}
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs gap-1 ${config.color}`}
                                                            >
                                                                <TagIcon className="h-2.5 w-2.5" />
                                                                {note.tag}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm">{note.content}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                — {note.author}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload VOD Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload VOD</DialogTitle>
                        <DialogDescription>
                            Add a YouTube VOD for team review.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vodTitle">Title *</Label>
                            <Input
                                id="vodTitle"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="e.g. KingsRock vs Team Nexus — Ascent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vodUrl">YouTube URL *</Label>
                            <Input
                                id="vodUrl"
                                value={formUrl}
                                onChange={(e) => setFormUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Attach to Match (optional)</Label>
                            <Select value={formMatchId} onValueChange={setFormMatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a match..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No match</SelectItem>
                                    {mockMatches.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            vs {m.opponent} —{" "}
                                            {new Date(m.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setUploadOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Timestamped Note</DialogTitle>
                        <DialogDescription>
                            Add a review note at a specific timestamp.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="noteTs">Timestamp *</Label>
                                <Input
                                    id="noteTs"
                                    value={noteTimestamp}
                                    onChange={(e) => setNoteTimestamp(e.target.value)}
                                    placeholder="e.g. 12:34"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tag *</Label>
                                <Select value={noteTag} onValueChange={(v) => setNoteTag(v as VodNoteTag)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mistake">❌ Mistake</SelectItem>
                                        <SelectItem value="Strategy">💡 Strategy</SelectItem>
                                        <SelectItem value="Good Play">⭐ Good Play</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="noteText">Note *</Label>
                            <Textarea
                                id="noteText"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="What happened at this timestamp..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddNote}>Add Note</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
