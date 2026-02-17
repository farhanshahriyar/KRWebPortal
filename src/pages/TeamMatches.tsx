import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Trophy,
    Plus,
    CalendarDays,
    Clock,
    CheckCircle2,
    HelpCircle,
    XCircle,
    Video,
    ArrowRight,
    Pencil,
    User,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { mockMatches, mockAvailability, mockMembers } from "@/components/team/mockData";
import { Match, Availability, AvailabilityStatus } from "@/components/team/types";
import { toast } from "sonner";

const availStatusColors: Record<AvailabilityStatus, string> = {
    yes: "border-emerald-500 text-emerald-600 bg-emerald-500/10",
    maybe: "border-amber-500 text-amber-600 bg-amber-500/10",
    no: "border-red-500 text-red-600 bg-red-500/10",
    pending: "border-muted text-muted-foreground bg-muted/50",
};

const availStatusLabels: Record<AvailabilityStatus, string> = {
    yes: "Confirmed",
    maybe: "Maybe",
    no: "Unavailable",
    pending: "Pending",
};

export default function TeamMatches() {
    const { canAccess } = useRole();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>(mockMatches);
    const [availability, setAvailability] = useState<Availability[]>(mockAvailability);
    const [activeTab, setActiveTab] = useState<"upcoming" | "results">("upcoming");

    // Form state
    const [formOpen, setFormOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [formOpponent, setFormOpponent] = useState("");
    const [formDate, setFormDate] = useState("");
    const [formCheckIn, setFormCheckIn] = useState("");

    // Availability dialog
    const [availDialogOpen, setAvailDialogOpen] = useState(false);
    const [availMatchId, setAvailMatchId] = useState<string | null>(null);

    // Result form
    const [resultDialogOpen, setResultDialogOpen] = useState(false);
    const [resultMatch, setResultMatch] = useState<Match | null>(null);
    const [resultUs, setResultUs] = useState("");
    const [resultThem, setResultThem] = useState("");
    const [resultMapName, setResultMapName] = useState("");
    const [resultReview, setResultReview] = useState("");

    const upcomingMatches = matches
        .filter((m) => m.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const completedMatches = matches
        .filter((m) => m.status === "completed")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const openCreateMatch = () => {
        setEditingMatch(null);
        setFormOpponent("");
        setFormDate("");
        setFormCheckIn("");
        setFormOpen(true);
    };

    const openEditMatch = (match: Match) => {
        setEditingMatch(match);
        setFormOpponent(match.opponent);
        setFormDate(match.date.slice(0, 16));
        setFormCheckIn(match.checkInTime.slice(0, 16));
        setFormOpen(true);
    };

    const handleSaveMatch = () => {
        if (!formOpponent.trim() || !formDate) {
            toast.error("Opponent and date are required");
            return;
        }

        if (editingMatch) {
            setMatches((prev) =>
                prev.map((m) =>
                    m.id === editingMatch.id
                        ? {
                            ...m,
                            opponent: formOpponent,
                            date: new Date(formDate).toISOString(),
                            checkInTime: formCheckIn
                                ? new Date(formCheckIn).toISOString()
                                : m.checkInTime,
                        }
                        : m
                )
            );
            toast.success("Match updated");
        } else {
            const newMatch: Match = {
                id: `match${Date.now()}`,
                opponent: formOpponent,
                date: new Date(formDate).toISOString(),
                checkInTime: formCheckIn
                    ? new Date(formCheckIn).toISOString()
                    : new Date(formDate).toISOString(),
                status: "upcoming",
                confirmedRoster: [],
            };
            setMatches((prev) => [...prev, newMatch]);
            toast.success("Match created");
        }
        setFormOpen(false);
    };

    const openAvailability = (matchId: string) => {
        setAvailMatchId(matchId);
        setAvailDialogOpen(true);
    };

    const updateMyAvailability = (matchId: string, status: AvailabilityStatus) => {
        // Mock: update the first member's availability (simulating current user)
        const existing = availability.find(
            (a) => a.matchId === matchId && a.memberId === "m1"
        );
        if (existing) {
            setAvailability((prev) =>
                prev.map((a) =>
                    a.id === existing.id ? { ...a, status } : a
                )
            );
        } else {
            setAvailability((prev) => [
                ...prev,
                {
                    id: `a${Date.now()}`,
                    matchId,
                    memberId: "m1",
                    memberIgn: "KR Phantom",
                    status,
                },
            ]);
        }
        toast.success(`Availability set to: ${availStatusLabels[status]}`);
        setAvailDialogOpen(false);
    };

    const openAddResult = (match: Match) => {
        setResultMatch(match);
        setResultUs("");
        setResultThem("");
        setResultMapName("");
        setResultReview("");
        setResultDialogOpen(true);
    };

    const handleSaveResult = () => {
        if (!resultMatch || !resultUs || !resultThem) {
            toast.error("Scores are required");
            return;
        }
        setMatches((prev) =>
            prev.map((m) =>
                m.id === resultMatch.id
                    ? {
                        ...m,
                        status: "completed" as const,
                        score: { us: parseInt(resultUs), them: parseInt(resultThem) },
                        maps: resultMapName
                            ? [
                                {
                                    name: resultMapName,
                                    scoreUs: parseInt(resultUs),
                                    scoreThem: parseInt(resultThem),
                                },
                            ]
                            : undefined,
                        review: resultReview
                            ? {
                                summary: resultReview,
                                notes: "",
                                author: "You",
                                createdAt: new Date().toISOString(),
                            }
                            : undefined,
                    }
                    : m
            )
        );
        toast.success("Result added");
        setResultDialogOpen(false);
    };

    const getMatchAvailability = (matchId: string) => {
        return availability.filter((a) => a.matchId === matchId);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                        <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
                        <p className="text-sm text-muted-foreground">
                            Schedule and results
                        </p>
                    </div>
                </div>
                {canAccess("team.matches.manage") && (
                    <Button onClick={openCreateMatch} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Match
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "results")}>
                <TabsList>
                    <TabsTrigger value="upcoming" className="gap-2">
                        Upcoming
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {upcomingMatches.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="results" className="gap-2">
                        Results
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {completedMatches.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Upcoming */}
                <TabsContent value="upcoming">
                    {upcomingMatches.length === 0 ? (
                        <Card className="p-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                <h3 className="text-lg font-semibold">No Upcoming Matches</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    No matches scheduled yet.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {upcomingMatches.map((match) => {
                                const matchAvail = getMatchAvailability(match.id);
                                return (
                                    <Card key={match.id} className="p-5 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                        <Trophy className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-semibold">vs {match.opponent}</p>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarDays className="h-3.5 w-3.5" />
                                                                {new Date(match.date).toLocaleDateString("en-US", {
                                                                    weekday: "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {new Date(match.date).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Confirmed Roster */}
                                                {match.confirmedRoster.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 ml-13">
                                                        {match.confirmedRoster.map((id) => {
                                                            const member = mockMembers.find((m) => m.id === id);
                                                            return member ? (
                                                                <Badge key={id} variant="outline" className="text-xs">
                                                                    <User className="h-2.5 w-2.5 mr-1" />
                                                                    {member.ign}
                                                                </Badge>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                )}

                                                {/* Availability summary inline */}
                                                {matchAvail.length > 0 && (
                                                    <div className="flex gap-3 ml-13">
                                                        <span className="text-xs flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            {matchAvail.filter((a) => a.status === "yes").length}
                                                        </span>
                                                        <span className="text-xs flex items-center gap-1">
                                                            <HelpCircle className="h-3 w-3 text-amber-500" />
                                                            {matchAvail.filter((a) => a.status === "maybe").length}
                                                        </span>
                                                        <span className="text-xs flex items-center gap-1">
                                                            <XCircle className="h-3 w-3 text-red-500" />
                                                            {matchAvail.filter((a) => a.status === "no" || a.status === "pending").length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                {canAccess("team.matches.availability") && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openAvailability(match.id)}
                                                        className="gap-1.5"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Availability
                                                    </Button>
                                                )}
                                                {canAccess("team.matches.manage") && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openAddResult(match)}
                                                            className="gap-1.5"
                                                        >
                                                            <Trophy className="h-3.5 w-3.5" />
                                                            Add Result
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditMatch(match)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/team/matches/${match.id}`)}
                                                >
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Results */}
                <TabsContent value="results">
                    {completedMatches.length === 0 ? (
                        <Card className="p-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                <h3 className="text-lg font-semibold">No Results Yet</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Completed matches will appear here.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {completedMatches.map((match) => (
                                <Card
                                    key={match.id}
                                    className="p-5 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => navigate(`/team/matches/${match.id}`)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Trophy className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold">vs {match.opponent}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(match.date).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Map breakdown */}
                                            {match.maps && (
                                                <div className="flex gap-2 ml-13">
                                                    {match.maps.map((map, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {map.name}: {map.scoreUs}-{map.scoreThem}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Review summary */}
                                            {match.review && (
                                                <p className="text-sm text-muted-foreground italic ml-13 line-clamp-1">
                                                    "{match.review.summary}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Score */}
                                            {match.score && (
                                                <Badge
                                                    className={`text-sm px-3 py-1 ${match.score.us > match.score.them
                                                            ? "bg-emerald-500 hover:bg-emerald-600"
                                                            : "bg-red-500 hover:bg-red-600"
                                                        }`}
                                                >
                                                    {match.score.us > match.score.them ? "W" : "L"}{" "}
                                                    {match.score.us}-{match.score.them}
                                                </Badge>
                                            )}

                                            {/* VOD link */}
                                            {match.vodId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate("/team/vods");
                                                    }}
                                                >
                                                    <Video className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Availability Dialog */}
            <Dialog open={availDialogOpen} onOpenChange={setAvailDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Update Availability</DialogTitle>
                        <DialogDescription>
                            Let your team know if you can make this match.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            variant="outline"
                            className="flex-col gap-2 h-auto py-4 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500"
                            onClick={() => availMatchId && updateMyAvailability(availMatchId, "yes")}
                        >
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <span className="text-sm font-medium">Yes</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col gap-2 h-auto py-4 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500"
                            onClick={() => availMatchId && updateMyAvailability(availMatchId, "maybe")}
                        >
                            <HelpCircle className="h-6 w-6 text-amber-500" />
                            <span className="text-sm font-medium">Maybe</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col gap-2 h-auto py-4 border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
                            onClick={() => availMatchId && updateMyAvailability(availMatchId, "no")}
                        >
                            <XCircle className="h-6 w-6 text-red-500" />
                            <span className="text-sm font-medium">No</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Match Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMatch ? "Edit Match" : "Create Match"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMatch
                                ? "Update the match details."
                                : "Schedule a new match for your team."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="opponent">Opponent *</Label>
                            <Input
                                id="opponent"
                                value={formOpponent}
                                onChange={(e) => setFormOpponent(e.target.value)}
                                placeholder="e.g. Team Nexus"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="matchDate">Match Date & Time *</Label>
                            <Input
                                id="matchDate"
                                type="datetime-local"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkIn">Check-in Time</Label>
                            <Input
                                id="checkIn"
                                type="datetime-local"
                                value={formCheckIn}
                                onChange={(e) => setFormCheckIn(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveMatch}>
                            {editingMatch ? "Save Changes" : "Create Match"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Result Dialog */}
            <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Match Result</DialogTitle>
                        <DialogDescription>
                            Record the result for{" "}
                            <span className="font-semibold">vs {resultMatch?.opponent}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="scoreUs">Our Score *</Label>
                                <Input
                                    id="scoreUs"
                                    type="number"
                                    value={resultUs}
                                    onChange={(e) => setResultUs(e.target.value)}
                                    placeholder="13"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="scoreThem">Opponent Score *</Label>
                                <Input
                                    id="scoreThem"
                                    type="number"
                                    value={resultThem}
                                    onChange={(e) => setResultThem(e.target.value)}
                                    placeholder="9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mapName">Map</Label>
                            <Input
                                id="mapName"
                                value={resultMapName}
                                onChange={(e) => setResultMapName(e.target.value)}
                                placeholder="e.g. Ascent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reviewSummary">What we learned</Label>
                            <Textarea
                                id="reviewSummary"
                                value={resultReview}
                                onChange={(e) => setResultReview(e.target.value)}
                                placeholder="Key takeaways from this match..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setResultDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveResult}>Save Result</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
