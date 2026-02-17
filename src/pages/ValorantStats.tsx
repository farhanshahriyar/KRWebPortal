import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Save, Edit2, Trash2, RefreshCw, AlertCircle, Trophy, Target, Crosshair, Shield, Swords, Flame, Clock, MapPin, ExternalLink, Zap } from "lucide-react";
import { toast } from "sonner";
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

interface ValorantProfile {
    id: string;
    tracker_url: string;
    riot_name: string;
    riot_tag: string;
    player_data: any;
    status: string;
}

interface PlayerStats {
    account: any;
    mmr: any;
    matches: any[];
}

// Valorant rank tier color mapping
function getRankColor(tier: string | undefined): string {
    if (!tier) return "text-zinc-400";
    const t = tier.toLowerCase();
    if (t.includes("iron")) return "text-zinc-400";
    if (t.includes("bronze")) return "text-amber-700";
    if (t.includes("silver")) return "text-zinc-300";
    if (t.includes("gold")) return "text-yellow-400";
    if (t.includes("platinum")) return "text-cyan-400";
    if (t.includes("diamond")) return "text-purple-400";
    if (t.includes("ascendant")) return "text-emerald-400";
    if (t.includes("immortal")) return "text-red-400";
    if (t.includes("radiant")) return "text-yellow-300";
    return "text-zinc-400";
}

function getRankGlow(tier: string | undefined): string {
    if (!tier) return "";
    const t = tier.toLowerCase();
    if (t.includes("iron")) return "shadow-zinc-500/20";
    if (t.includes("bronze")) return "shadow-amber-700/20";
    if (t.includes("silver")) return "shadow-zinc-300/20";
    if (t.includes("gold")) return "shadow-yellow-400/30";
    if (t.includes("platinum")) return "shadow-cyan-400/30";
    if (t.includes("diamond")) return "shadow-purple-400/30";
    if (t.includes("ascendant")) return "shadow-emerald-400/30";
    if (t.includes("immortal")) return "shadow-red-400/40";
    if (t.includes("radiant")) return "shadow-yellow-300/50";
    return "";
}

function getRankBg(tier: string | undefined): string {
    if (!tier) return "from-zinc-500/10 to-zinc-600/5";
    const t = tier.toLowerCase();
    if (t.includes("iron")) return "from-zinc-500/10 to-zinc-600/5";
    if (t.includes("bronze")) return "from-amber-800/10 to-amber-900/5";
    if (t.includes("silver")) return "from-zinc-300/10 to-zinc-400/5";
    if (t.includes("gold")) return "from-yellow-500/10 to-yellow-600/5";
    if (t.includes("platinum")) return "from-cyan-500/10 to-cyan-600/5";
    if (t.includes("diamond")) return "from-purple-500/10 to-purple-600/5";
    if (t.includes("ascendant")) return "from-emerald-500/10 to-emerald-600/5";
    if (t.includes("immortal")) return "from-red-500/15 to-red-600/5";
    if (t.includes("radiant")) return "from-yellow-400/15 to-amber-500/5";
    return "from-zinc-500/10 to-zinc-600/5";
}

export default function ValorantStats() {
    const [profile, setProfile] = useState<ValorantProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchUrl, setSearchUrl] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [previewStats, setPreviewStats] = useState<PlayerStats | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("valorant_profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const parseTrackerUrl = (url: string): { name: string; tag: string } | null => {
        const match = url.match(/riot\/([^\/]+)\/overview/);
        if (!match) return null;

        const nameTag = decodeURIComponent(match[1]);
        const [name, tag] = nameTag.split("#");
        return name && tag ? { name, tag } : null;
    };

    const handleSearch = async () => {
        const parsed = parseTrackerUrl(searchUrl);
        if (!parsed) {
            toast.error("Invalid tracker.gg URL. Please use the format: tracker.gg/valorant/profile/riot/Name%23Tag/overview");
            return;
        }

        setIsSearching(true);
        try {
            const { data, error } = await supabase.functions.invoke('valorant-stats', {
                body: { name: parsed.name, tag: parsed.tag }
            });

            if (error) throw error;
            if (!data) throw new Error("No data returned");

            setPreviewStats(data);
            toast.success("Stats loaded successfully!");
        } catch (error: any) {
            console.error("Error fetching stats:", error);
            toast.error(error.message || "Failed to fetch player stats");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSave = async () => {
        if (!previewStats) return;

        const parsed = parseTrackerUrl(searchUrl);
        if (!parsed) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from("valorant_profiles").upsert({
                user_id: user.id,
                tracker_url: searchUrl,
                riot_name: parsed.name,
                riot_tag: parsed.tag,
                player_data: previewStats as any,
                status: "active",
            });

            if (error) throw error;

            toast.success("Profile saved successfully!");
            await fetchProfile();
            setPreviewStats(null);
            setSearchUrl("");
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile");
        }
    };

    const handleRefresh = async () => {
        if (!profile) return;

        setIsSearching(true);
        try {
            const { data, error } = await supabase.functions.invoke('valorant-stats', {
                body: { name: profile.riot_name, tag: profile.riot_tag }
            });

            if (error) throw error;
            if (!data) throw new Error("No data returned");

            const { error: updateError } = await supabase
                .from("valorant_profiles")
                .update({ player_data: data })
                .eq("id", profile.id);

            if (updateError) throw updateError;

            toast.success("Stats refreshed!");
            await fetchProfile();
        } catch (error) {
            console.error("Error refreshing stats:", error);
            toast.error("Failed to refresh stats");
        } finally {
            setIsSearching(false);
        }
    };

    const handleDelete = async () => {
        if (!profile) return;

        try {
            const { error } = await supabase
                .from("valorant_profiles")
                .update({ status: "pending_delete" })
                .eq("id", profile.id);

            if (error) throw error;

            toast.success("Delete request submitted. Awaiting admin approval.");
            await fetchProfile();
        } catch (error) {
            console.error("Error requesting delete:", error);
            toast.error("Failed to request deletion");
        }
        setShowDeleteDialog(false);
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
                    <Loader2 className="h-10 w-10 animate-spin text-red-500 relative" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Loading your stats...</p>
            </div>
        );
    }

    // Pending Delete State
    if (profile?.status === "pending_delete") {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-amber-600/5 p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-start gap-4">
                        <div className="rounded-full bg-amber-500/10 p-3">
                            <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Profile Deletion Pending</h2>
                            <p className="text-muted-foreground">
                                Your Valorant profile deletion request is awaiting admin approval. You'll be notified once it's processed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No Profile / Editing State
    if (!profile || isEditing) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-lg bg-red-500/10 p-2">
                            <Crosshair className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Valorant Stats</h1>
                            <p className="text-muted-foreground">
                                Link your tracker.gg profile to track your competitive journey
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Card */}
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-500/5 via-background to-background p-6 mb-8">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <Search className="h-5 w-5 text-red-500" />
                            <h2 className="text-lg font-semibold">Search Player</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Paste your tracker.gg profile URL • Example: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">tracker.gg/valorant/profile/riot/Name%23Tag/overview</code>
                        </p>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Paste tracker.gg URL here..."
                                    value={searchUrl}
                                    onChange={(e) => setSearchUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="h-11 pl-4 pr-4 bg-background/80 border-muted-foreground/20 focus-visible:ring-red-500/30"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || !searchUrl}
                                className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                Search
                            </Button>
                            {isEditing && (
                                <Button variant="outline" className="h-11" onClick={() => {
                                    setIsEditing(false);
                                    setPreviewStats(null);
                                    setSearchUrl("");
                                }}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {previewStats && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <h2 className="text-xl font-bold">Preview</h2>
                            </div>
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Save className="h-4 w-4 mr-2" />
                                Save Profile
                            </Button>
                        </div>
                        <StatsDisplay stats={previewStats} />
                    </div>
                )}
            </div>
        );
    }

    // Saved Profile State
    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Header with Actions */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500/10 p-2">
                        <Crosshair className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {profile.riot_name}<span className="text-muted-foreground font-normal">#{profile.riot_tag}</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">Your Valorant Statistics</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isSearching}
                        className="gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 transition-colors"
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsEditing(true);
                            setSearchUrl(profile.tracker_url);
                        }}
                        className="gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit URL
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {profile.player_data && <StatsDisplay stats={profile.player_data} />}

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Valorant Profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will submit a deletion request to the admin. Your profile will be marked as pending deletion until approved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Request Deletion
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Stats Display Component — Premium Valorant-themed layout
// ─────────────────────────────────────────────────────────
function StatsDisplay({ stats }: { stats: PlayerStats }) {
    const mmr = stats.mmr?.current_data;
    const account = stats.account;
    const lastMatch = stats.matches?.[0];

    const playerInMatch = lastMatch?.players?.all_players?.find(
        (p: any) => p.name === account?.name && p.tag === account?.tag
    );

    const rankTier = mmr?.currenttierpatched;
    const rankColor = getRankColor(rankTier);
    const rankGlow = getRankGlow(rankTier);
    const rankBg = getRankBg(rankTier);

    const isWin = playerInMatch
        ? (playerInMatch.team === "Red"
            ? lastMatch?.teams?.red?.has_won
            : lastMatch?.teams?.blue?.has_won)
        : false;

    return (
        <div className="space-y-6">
            {/* ─── Player Hero Banner ─── */}
            <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${rankBg} shadow-lg ${rankGlow}`}>
                {/* Background Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/[0.03] rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-500/[0.02] rounded-full blur-3xl" />
                    {/* Diagonal line accent */}
                    <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-red-500/20 via-transparent to-transparent transform rotate-12 origin-top-right" />
                </div>

                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Player Card */}
                        {account?.card?.wide && (
                            <div className="relative group">
                                <div className={`absolute -inset-1 rounded-xl bg-gradient-to-br from-red-500/30 to-red-900/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-white/10">
                                    <img
                                        src={account.card.wide}
                                        alt="Player Card"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                    {account?.name}<span className="text-muted-foreground font-light">#{account?.tag}</span>
                                </h2>
                                <Badge variant="outline" className="text-xs font-semibold border-muted-foreground/30 bg-background/50 backdrop-blur-sm">
                                    Level {account?.account_level || 0}
                                </Badge>
                            </div>

                            {/* Rank Display */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Current Rating</div>
                                    <div className="flex items-center gap-3">
                                        {mmr?.images?.small && (
                                            <img
                                                src={mmr.images.small}
                                                alt={rankTier || "Rank"}
                                                className="w-10 h-10 drop-shadow-lg"
                                            />
                                        )}
                                        <div>
                                            <div className={`text-2xl font-bold ${rankColor}`}>
                                                {rankTier || "Unranked"}
                                            </div>
                                            {mmr && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="text-sm font-semibold text-emerald-500">{mmr.ranking_in_tier || 0} RR</div>
                                                    {mmr.mmr_change_to_last_game != null && (
                                                        <span className={`text-xs font-medium ${mmr.mmr_change_to_last_game >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                            ({mmr.mmr_change_to_last_game >= 0 ? "+" : ""}{mmr.mmr_change_to_last_game})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Peak Rating</div>
                                    <div className="text-xl font-semibold">
                                        {mmr?.old ? `${mmr.old}` : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Competitive Stats Grid ─── */}
            {mmr && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Flame className="h-4 w-4" />}
                        label="MMR"
                        value={String(mmr.elo || 0)}
                        color="text-red-500"
                        bgColor="from-red-500/10 to-red-600/5"
                    />
                    <StatCard
                        icon={<Trophy className="h-4 w-4" />}
                        label="Ranking Points"
                        value={String(mmr.ranking_in_tier || 0)}
                        suffix="RR"
                        color="text-amber-500"
                        bgColor="from-amber-500/10 to-amber-600/5"
                    />
                    <StatCard
                        icon={<Target className="h-4 w-4" />}
                        label="Games to Rank"
                        value={String(mmr.games_needed_for_rating || 0)}
                        color="text-blue-500"
                        bgColor="from-blue-500/10 to-blue-600/5"
                    />
                    <StatCard
                        icon={<MapPin className="h-4 w-4" />}
                        label="Region"
                        value={(account?.region || "N/A").toUpperCase()}
                        color="text-emerald-500"
                        bgColor="from-emerald-500/10 to-emerald-600/5"
                    />
                </div>
            )}

            {/* ─── Last Played Match ─── */}
            {lastMatch && playerInMatch && (
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-background">
                    {/* Win/Loss accent stripe */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${isWin ? "bg-emerald-500" : "bg-red-500"}`} />

                    <div className="p-6 pl-8">
                        {/* Match Header */}
                        <div className="flex items-center gap-2 mb-5">
                            <Swords className={`h-5 w-5 ${isWin ? "text-emerald-500" : "text-red-500"}`} />
                            <h3 className="text-lg font-bold">Last Played Match</h3>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            {/* Map & Mode */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="text-2xl font-bold">{lastMatch.metadata?.map || "Unknown Map"}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                        <span>{lastMatch.metadata?.mode || "Competitive"}</span>
                                        <span>•</span>
                                        <span>{new Date(lastMatch.metadata?.game_start_patched).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Result */}
                            <div className="flex items-center gap-4">
                                <div className={`px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide text-white ${isWin
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                                    : "bg-gradient-to-r from-red-600 to-red-500"
                                    }`}>
                                    {isWin ? "VICTORY" : "DEFEAT"}
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold tabular-nums">
                                        <span className={lastMatch.teams?.red?.has_won ? "text-emerald-500" : "text-muted-foreground"}>
                                            {lastMatch.teams?.red?.rounds_won || 0}
                                        </span>
                                        <span className="text-muted-foreground/40 mx-1.5">—</span>
                                        <span className={lastMatch.teams?.blue?.has_won ? "text-emerald-500" : "text-muted-foreground"}>
                                            {lastMatch.teams?.blue?.rounds_won || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Player Performance */}
                        <div className="mt-6 pt-5 border-t border-border/50">
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                                <MatchStat label="Kills" value={playerInMatch.stats?.kills || 0} highlight />
                                <MatchStat label="Deaths" value={playerInMatch.stats?.deaths || 0} />
                                <MatchStat label="Assists" value={playerInMatch.stats?.assists || 0} />
                                <MatchStat label="ACS" value={playerInMatch.stats?.score || 0} highlight />
                                <MatchStat
                                    label="K/D"
                                    value={((playerInMatch.stats?.kills || 0) / Math.max(playerInMatch.stats?.deaths || 1, 1)).toFixed(2)}
                                />
                                {playerInMatch.character && (
                                    <div className="text-center">
                                        <div className="text-sm font-bold">{playerInMatch.character}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">Agent</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── No Competitive Data ─── */}
            {!mmr && (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-background p-6">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-start gap-3">
                        <div className="rounded-full bg-amber-500/10 p-2.5 mt-0.5">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <div className="font-bold text-amber-600 dark:text-amber-400">No Competitive Data Available</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                This player hasn't played competitive mode yet or data is not available for this region.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Reusable Sub-Components ──

function StatCard({ icon, label, value, suffix, color, bgColor }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    suffix?: string;
    color: string;
    bgColor: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${bgColor} p-5 group hover:shadow-md transition-shadow duration-300`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
                <div className={`${color} mb-3 opacity-70`}>{icon}</div>
                <div className="flex items-baseline gap-1.5">
                    <div className={`text-3xl font-black tabular-nums ${color}`}>{value}</div>
                    {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}

function MatchStat({ label, value, highlight }: {
    label: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div className="text-center">
            <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-red-500" : ""}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
    );
}
