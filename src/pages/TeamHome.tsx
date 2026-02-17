import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Swords,
    Clock,
    CheckCircle2,
    HelpCircle,
    XCircle,
    Trophy,
    Video,
    CalendarCheck,
    Pencil,
    Save,
    X,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import {
    mockMatches,
    mockAvailability,
    mockWeeklyFocus,
    mockMembers,
} from "@/components/team/mockData";

export default function TeamHome() {
    const { canAccess } = useRole();
    const navigate = useNavigate();

    // Find next upcoming match
    const upcomingMatch = mockMatches
        .filter((m) => m.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    // Find latest completed match
    const latestResult = mockMatches
        .filter((m) => m.status === "completed")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // Weekly focus state
    const [weeklyFocus, setWeeklyFocus] = useState(mockWeeklyFocus);
    const [isEditingFocus, setIsEditingFocus] = useState(false);
    const [focusDraft, setFocusDraft] = useState(weeklyFocus.note);

    // Countdown timer
    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        if (!upcomingMatch) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const target = new Date(upcomingMatch.date).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setCountdown("LIVE NOW");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setCountdown(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [upcomingMatch]);

    // Availability for upcoming match
    const matchAvailability = upcomingMatch
        ? mockAvailability.filter((a) => a.matchId === upcomingMatch.id)
        : [];

    const confirmedCount = matchAvailability.filter((a) => a.status === "yes").length;
    const maybeCount = matchAvailability.filter((a) => a.status === "maybe").length;
    const pendingCount = matchAvailability.filter(
        (a) => a.status === "pending" || a.status === "no"
    ).length;

    const saveFocus = () => {
        setWeeklyFocus({
            ...weeklyFocus,
            note: focusDraft,
            updatedAt: new Date().toISOString(),
        });
        setIsEditingFocus(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Swords className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team KingsRock</h1>
                    <p className="text-sm text-muted-foreground">
                        Command center for your Valorant team
                    </p>
                </div>
            </div>

            {/* Top Row: Next Match + Availability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Next Match Card */}
                <Card className="p-5 border-l-4 border-l-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
                    <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Next Match
                            </h3>
                            {countdown && (
                                <Badge
                                    variant={countdown === "LIVE NOW" ? "destructive" : "secondary"}
                                    className="font-mono text-xs"
                                >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {countdown}
                                </Badge>
                            )}
                        </div>

                        {upcomingMatch ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                        <Trophy className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">
                                            vs {upcomingMatch.opponent}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(upcomingMatch.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}{" "}
                                            •{" "}
                                            {new Date(upcomingMatch.date).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CalendarCheck className="h-3.5 w-3.5" />
                                    Check-in:{" "}
                                    {new Date(upcomingMatch.checkInTime).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                                {/* Confirmed Roster */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {upcomingMatch.confirmedRoster.map((id) => {
                                        const member = mockMembers.find((m) => m.id === id);
                                        return member ? (
                                            <Badge key={id} variant="outline" className="text-xs">
                                                {member.ign}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                        )}
                    </div>
                </Card>

                {/* Availability Summary */}
                <Card className="p-5">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        Availability Summary
                    </h3>
                    {upcomingMatch ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
                                    <p className="text-xs text-muted-foreground">Confirmed</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <HelpCircle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-amber-600">{maybeCount}</p>
                                    <p className="text-xs text-muted-foreground">Maybe</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
                                    <p className="text-xs text-muted-foreground">No Response</p>
                                </div>
                            </div>
                            {/* Individual status */}
                            <div className="space-y-1.5">
                                {matchAvailability.map((a) => (
                                    <div
                                        key={a.id}
                                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm font-medium">{a.memberIgn}</span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                a.status === "yes"
                                                    ? "border-emerald-500 text-emerald-600"
                                                    : a.status === "maybe"
                                                        ? "border-amber-500 text-amber-600"
                                                        : a.status === "no"
                                                            ? "border-red-500 text-red-600"
                                                            : "border-muted text-muted-foreground"
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
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No upcoming match to show availability for.
                        </p>
                    )}
                </Card>
            </div>

            {/* Second Row: Latest Result + Weekly Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Latest Result */}
                <Card
                    className="p-5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => latestResult && navigate(`/team/matches/${latestResult.id}`)}
                >
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Latest Result
                    </h3>
                    {latestResult ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">vs {latestResult.opponent}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(latestResult.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {latestResult.score && (
                                        <Badge
                                            variant={
                                                latestResult.score.us > latestResult.score.them
                                                    ? "default"
                                                    : "destructive"
                                            }
                                            className={
                                                latestResult.score.us > latestResult.score.them
                                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                                    : ""
                                            }
                                        >
                                            {latestResult.score.us > latestResult.score.them ? "WIN" : "LOSS"}{" "}
                                            {latestResult.score.us}-{latestResult.score.them}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {/* Map breakdown */}
                            {latestResult.maps && (
                                <div className="flex gap-2">
                                    {latestResult.maps.map((map, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {map.name}: {map.scoreUs}-{map.scoreThem}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {latestResult.review && (
                                <p className="text-sm text-muted-foreground italic line-clamp-2">
                                    "{latestResult.review.summary}"
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No match results yet.</p>
                    )}
                </Card>

                {/* Weekly Focus Note */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Weekly Focus
                        </h3>
                        {canAccess("team.announcements.manage") && !isEditingFocus && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFocusDraft(weeklyFocus.note);
                                    setIsEditingFocus(true);
                                }}
                            >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                            </Button>
                        )}
                    </div>
                    {isEditingFocus ? (
                        <div className="space-y-3">
                            <Textarea
                                value={focusDraft}
                                onChange={(e) => setFocusDraft(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditingFocus(false)}
                                >
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={saveFocus}>
                                    <Save className="h-3.5 w-3.5 mr-1" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm leading-relaxed">{weeklyFocus.note}</p>
                            <p className="text-xs text-muted-foreground">
                                Updated by {weeklyFocus.updatedBy} •{" "}
                                {new Date(weeklyFocus.updatedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-5">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/team/matches")}
                        className="gap-2"
                    >
                        <CalendarCheck className="h-4 w-4" />
                        Update Availability
                    </Button>
                    {canAccess("team.matches.manage") && (
                        <Button
                            variant="outline"
                            onClick={() => navigate("/team/matches")}
                            className="gap-2"
                        >
                            <Trophy className="h-4 w-4" />
                            Add Match Result
                        </Button>
                    )}
                    {canAccess("team.vods.manage") && (
                        <Button
                            variant="outline"
                            onClick={() => navigate("/team/vods")}
                            className="gap-2"
                        >
                            <Video className="h-4 w-4" />
                            Upload VOD
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
