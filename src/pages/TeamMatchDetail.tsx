import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    ArrowLeft,
    CalendarDays,
    Clock,
    Users,
    Video,
    StickyNote,
    Gamepad2,
    User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { mockMatches, mockMembers, mockAvailability, mockVods } from "@/components/team/mockData";

export default function TeamMatchDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const match = mockMatches.find((m) => m.id === id);

    if (!match) {
        return (
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <Button variant="ghost" onClick={() => navigate("/team/matches")} className="mb-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Matches
                </Button>
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold">Match Not Found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            The match you're looking for doesn't exist.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const matchAvail = mockAvailability.filter((a) => a.matchId === match.id);
    const matchVod = match.vodId ? mockVods.find((v) => v.id === match.vodId) : null;
    const isWin = match.score && match.score.us > match.score.them;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate("/team/matches")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Matches
            </Button>

            {/* Match Header */}
            <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                            <Trophy className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">vs {match.opponent}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4" />
                                    {new Date(match.date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {new Date(match.date).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Score */}
                    {match.score && (
                        <div className="text-center">
                            <Badge
                                className={`text-lg px-4 py-2 ${isWin
                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                        : "bg-red-500 hover:bg-red-600"
                                    }`}
                            >
                                {isWin ? "WIN" : "LOSS"} {match.score.us}-{match.score.them}
                            </Badge>
                        </div>
                    )}

                    {match.status === "upcoming" && (
                        <Badge variant="secondary" className="text-sm px-3 py-1.5">
                            Upcoming
                        </Badge>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Roster Confirmation */}
                <Card className="p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Confirmed Roster
                    </h3>
                    {match.confirmedRoster.length > 0 ? (
                        <div className="space-y-2">
                            {match.confirmedRoster.map((id) => {
                                const member = mockMembers.find((m) => m.id === id);
                                if (!member) return null;
                                return (
                                    <div
                                        key={id}
                                        className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">{member.ign}</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {member.role}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No roster confirmed yet.</p>
                    )}
                </Card>

                {/* Planned Comp */}
                <Card className="p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4" />
                        Planned Composition
                    </h3>
                    {match.plannedComp && match.plannedComp.length > 0 ? (
                        <div className="space-y-2">
                            {match.plannedComp.map((comp) => {
                                const member = mockMembers.find((m) => m.id === comp.memberId);
                                return (
                                    <div
                                        key={comp.memberId}
                                        className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
                                    >
                                        <span className="font-medium text-sm">
                                            {member?.ign || comp.memberId}
                                        </span>
                                        <Badge variant="secondary">{comp.agent}</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No comp planned yet.</p>
                    )}
                </Card>

                {/* Availability */}
                {matchAvail.length > 0 && (
                    <Card className="p-5">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                            Availability
                        </h3>
                        <div className="space-y-2">
                            {matchAvail.map((a) => (
                                <div
                                    key={a.id}
                                    className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
                                >
                                    <span className="font-medium text-sm">{a.memberIgn}</span>
                                    <Badge
                                        variant="outline"
                                        className={
                                            a.status === "yes"
                                                ? "border-emerald-500 text-emerald-600"
                                                : a.status === "maybe"
                                                    ? "border-amber-500 text-amber-600"
                                                    : a.status === "no"
                                                        ? "border-red-500 text-red-600"
                                                        : ""
                                        }
                                    >
                                        {a.status === "yes"
                                            ? "Confirmed"
                                            : a.status === "maybe"
                                                ? "Maybe"
                                                : a.status === "no"
                                                    ? "Unavailable"
                                                    : "Pending"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Map Breakdown */}
                {match.maps && match.maps.length > 0 && (
                    <Card className="p-5">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                            Map Breakdown
                        </h3>
                        <div className="space-y-2">
                            {match.maps.map((map, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-3 px-3 rounded-md bg-muted/50"
                                >
                                    <span className="font-medium">{map.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-lg font-bold ${map.scoreUs > map.scoreThem
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {map.scoreUs}
                                        </span>
                                        <span className="text-muted-foreground">-</span>
                                        <span
                                            className={`text-lg font-bold ${map.scoreThem > map.scoreUs
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {map.scoreThem}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* VOD Attachment */}
            {matchVod && (
                <Card className="p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        VOD
                    </h3>
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate("/team/vods")}
                    >
                        <div className="relative aspect-video max-w-lg rounded-lg overflow-hidden bg-muted">
                            <iframe
                                src={matchVod.youtubeUrl}
                                title={matchVod.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <p className="text-sm font-medium mt-2">{matchVod.title}</p>
                    </div>
                </Card>
            )}

            {/* Post-Match Review */}
            {match.review && (
                <Card className="p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <StickyNote className="h-4 w-4" />
                        Post-Match Review
                    </h3>
                    <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="font-medium">{match.review.summary}</p>
                            {match.review.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {match.review.notes}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Written by {match.review.author} •{" "}
                            {new Date(match.review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
