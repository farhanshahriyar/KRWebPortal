import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Swords,
    Trophy,
    Plus,
    Users,
    Shield,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    Cell,
} from "recharts";
import { useRole } from "@/contexts/RoleContext";
import { mockPlayerStats, mockMembers } from "@/components/team/mockData";
import { PlayerStats } from "@/components/team/types";
import { toast } from "sonner";

export default function TeamStats() {
    const { canAccess } = useRole();
    const [stats, setStats] = useState<PlayerStats[]>(mockPlayerStats);
    const [selectedPlayer, setSelectedPlayer] = useState<string>(stats[0]?.memberId || "");

    // Input form
    const [inputOpen, setInputOpen] = useState(false);
    const [inputPlayer, setInputPlayer] = useState("");
    const [inputOpponent, setInputOpponent] = useState("");
    const [inputKills, setInputKills] = useState("");
    const [inputDeaths, setInputDeaths] = useState("");
    const [inputAssists, setInputAssists] = useState("");
    const [inputAcs, setInputAcs] = useState("");
    const [inputWon, setInputWon] = useState("true");

    const currentPlayerStats = stats.find((s) => s.memberId === selectedPlayer);

    const chartData = currentPlayerStats?.matchHistory.map((m) => ({
        match: `vs ${m.opponent}`,
        ACS: m.acs,
        Kills: m.kills,
        Deaths: m.deaths,
    })).reverse() || [];

    // ── Team-wide aggregated match history ──
    const teamChartData = useMemo(() => {
        // Collect all unique matches by matchId, preserving order from first player
        const matchMap = new Map<string, {
            matchId: string;
            opponent: string;
            date: string;
            won: boolean;
            totalKills: number;
            totalDeaths: number;
            totalAssists: number;
            totalAcs: number;
            playerCount: number;
        }>();

        stats.forEach((player) => {
            player.matchHistory.forEach((m) => {
                if (!matchMap.has(m.matchId)) {
                    matchMap.set(m.matchId, {
                        matchId: m.matchId,
                        opponent: m.opponent,
                        date: m.date,
                        won: m.won,
                        totalKills: 0,
                        totalDeaths: 0,
                        totalAssists: 0,
                        totalAcs: 0,
                        playerCount: 0,
                    });
                }
                const entry = matchMap.get(m.matchId)!;
                entry.totalKills += m.kills;
                entry.totalDeaths += m.deaths;
                entry.totalAssists += m.assists;
                entry.totalAcs += m.acs;
                entry.playerCount++;
            });
        });

        return Array.from(matchMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((m) => ({
                match: `vs ${m.opponent}`,
                "Avg ACS": Math.round(m.totalAcs / m.playerCount),
                "Team Kills": m.totalKills,
                "Team Deaths": m.totalDeaths,
                won: m.won,
                date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            }));
    }, [stats]);

    const teamWins = teamChartData.filter((m) => m.won).length;
    const teamLosses = teamChartData.length - teamWins;
    const teamWinRate = teamChartData.length > 0 ? Math.round((teamWins / teamChartData.length) * 100) : 0;

    const handleAddStat = () => {
        if (!inputPlayer || !inputOpponent || !inputKills || !inputDeaths || !inputAcs) {
            toast.error("All fields except assists are required");
            return;
        }

        const entry = {
            matchId: `stat${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            opponent: inputOpponent,
            kills: parseInt(inputKills),
            deaths: parseInt(inputDeaths),
            assists: parseInt(inputAssists) || 0,
            acs: parseInt(inputAcs),
            won: inputWon === "true",
        };

        setStats((prev) =>
            prev.map((s) => {
                if (s.memberId === inputPlayer) {
                    const newHistory = [entry, ...s.matchHistory].slice(0, 10);
                    const totalK = newHistory.reduce((sum, m) => sum + m.kills, 0);
                    const totalD = newHistory.reduce((sum, m) => sum + m.deaths, 0);
                    const totalA = newHistory.reduce((sum, m) => sum + m.assists, 0);
                    const avgAcs = Math.round(newHistory.reduce((sum, m) => sum + m.acs, 0) / newHistory.length);
                    const wins = newHistory.filter((m) => m.won).length;
                    return {
                        ...s,
                        kills: totalK,
                        deaths: totalD,
                        assists: totalA,
                        acs: avgAcs,
                        winRate: Math.round((wins / newHistory.length) * 100),
                        matchHistory: newHistory,
                    };
                }
                return s;
            })
        );

        toast.success("Stat entry added");
        setInputOpen(false);
        setInputOpponent("");
        setInputKills("");
        setInputDeaths("");
        setInputAssists("");
        setInputAcs("");
    };

    const getKda = (s: PlayerStats) => {
        if (s.deaths === 0) return "∞";
        return ((s.kills + s.assists) / s.deaths).toFixed(2);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Performance Stats</h1>
                        <p className="text-sm text-muted-foreground">
                            Player performance across recent matches
                        </p>
                    </div>
                </div>
                {canAccess("team.matches.manage") && (
                    <Button
                        onClick={() => {
                            setInputPlayer(stats[0]?.memberId || "");
                            setInputOpen(true);
                        }}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Stat Entry
                    </Button>
                )}
            </div>

            {/* ═══════════ TEAM MATCH HISTORY CHART ═══════════ */}
            {teamChartData.length > 0 && (
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Team Match History
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Aggregated team performance across all matches
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-semibold text-emerald-600">{teamWins}W</span>
                            </div>
                            <span className="text-muted-foreground">/</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-red-500">{teamLosses}L</span>
                            </div>
                            <Badge
                                className={
                                    teamWinRate >= 50
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                }
                            >
                                {teamWinRate}% WR
                            </Badge>
                        </div>
                    </div>

                    {/* W/L Result Indicators */}
                    <div className="flex gap-1.5 mb-4">
                        {teamChartData.map((m, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                <Badge
                                    className={`text-[10px] px-1.5 py-0 ${m.won
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                                            : "bg-red-500 hover:bg-red-600 text-white border-0"
                                        }`}
                                >
                                    {m.won ? "W" : "L"}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{m.date}</span>
                            </div>
                        ))}
                    </div>

                    {/* Team Avg ACS Bar Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamChartData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey="match"
                                    tick={{ fontSize: 11 }}
                                    className="text-muted-foreground"
                                />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid hsl(var(--border))",
                                        backgroundColor: "hsl(var(--popover))",
                                        color: "hsl(var(--popover-foreground))",
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Avg ACS" radius={[4, 4, 0, 0]}>
                                    {teamChartData.map((entry, index) => (
                                        <Cell
                                            key={`acs-${index}`}
                                            fill={entry.won ? "#10B981" : "#EF4444"}
                                            fillOpacity={0.85}
                                        />
                                    ))}
                                </Bar>
                                <Bar dataKey="Team Kills" radius={[4, 4, 0, 0]} fill="#3B82F6" fillOpacity={0.7} />
                                <Bar dataKey="Team Deaths" radius={[4, 4, 0, 0]} fill="#6B7280" fillOpacity={0.5} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Player Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((player) => {
                    const kda = getKda(player);
                    const isSelected = player.memberId === selectedPlayer;
                    return (
                        <Card
                            key={player.memberId}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected
                                ? "ring-2 ring-primary border-primary shadow-md"
                                : "hover:border-primary/20"
                                }`}
                            onClick={() => setSelectedPlayer(player.memberId)}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{player.ign}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {mockMembers.find((m) => m.id === player.memberId)?.role}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={player.winRate >= 50 ? "default" : "secondary"}
                                        className={
                                            player.winRate >= 50
                                                ? "bg-emerald-500 hover:bg-emerald-600"
                                                : ""
                                        }
                                    >
                                        {player.winRate}% WR
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 rounded-md bg-muted/50">
                                        <p className="text-xs text-muted-foreground">KDA</p>
                                        <p className="text-lg font-bold">{kda}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-md bg-muted/50">
                                        <p className="text-xs text-muted-foreground">ACS</p>
                                        <p className="text-lg font-bold">{player.acs}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-md bg-muted/50">
                                        <p className="text-xs text-muted-foreground">K/D</p>
                                        <p className="text-lg font-bold">
                                            {player.deaths > 0
                                                ? (player.kills / player.deaths).toFixed(1)
                                                : "∞"}
                                        </p>
                                    </div>
                                </div>

                                {/* Mini trend */}
                                <div className="flex items-center gap-1 text-xs">
                                    {player.matchHistory.slice(0, 5).map((m, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 flex-1 rounded-full ${m.won ? "bg-emerald-500" : "bg-red-400"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Detailed Chart Section */}
            {currentPlayerStats && (
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {currentPlayerStats.ign} — Match History Trend
                        </h3>
                        <div className="flex items-center gap-2">
                            {currentPlayerStats.winRate >= 50 ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey="match"
                                    tick={{ fontSize: 11 }}
                                    className="text-muted-foreground"
                                />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid hsl(var(--border))",
                                        backgroundColor: "hsl(var(--popover))",
                                        color: "hsl(var(--popover-foreground))",
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="ACS"
                                    stroke="#EA4335"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Kills"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Deaths"
                                    stroke="#6B7280"
                                    strokeWidth={1.5}
                                    strokeDasharray="5 5"
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Match History Table */}
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Recent Matches
                        </h4>
                        <div className="space-y-1.5">
                            {currentPlayerStats.matchHistory.map((m) => (
                                <div
                                    key={m.matchId}
                                    className={`flex items-center justify-between py-2 px-3 rounded-md text-sm ${m.won
                                        ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50"
                                        : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={
                                                m.won
                                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                                                    : "bg-red-500 hover:bg-red-600 text-white border-0"
                                            }
                                        >
                                            {m.won ? "W" : "L"}
                                        </Badge>
                                        <span className="flex items-center gap-1.5">
                                            <Trophy className="h-3 w-3 text-muted-foreground" />
                                            vs {m.opponent}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(m.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Swords className="h-3 w-3 text-muted-foreground" />
                                            {m.kills}/{m.deaths}/{m.assists}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Target className="h-3 w-3 text-muted-foreground" />
                                            ACS {m.acs}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Add Stat Entry Dialog */}
            <Dialog open={inputOpen} onOpenChange={setInputOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Stat Entry</DialogTitle>
                        <DialogDescription>
                            Manually record a player's match performance.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Player *</Label>
                            <Select value={inputPlayer} onValueChange={setInputPlayer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select player..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {stats.map((s) => (
                                        <SelectItem key={s.memberId} value={s.memberId}>
                                            {s.ign}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="statOpp">Opponent *</Label>
                            <Input
                                id="statOpp"
                                value={inputOpponent}
                                onChange={(e) => setInputOpponent(e.target.value)}
                                placeholder="e.g. Team Nexus"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="statK">Kills *</Label>
                                <Input
                                    id="statK"
                                    type="number"
                                    value={inputKills}
                                    onChange={(e) => setInputKills(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="statD">Deaths *</Label>
                                <Input
                                    id="statD"
                                    type="number"
                                    value={inputDeaths}
                                    onChange={(e) => setInputDeaths(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="statA">Assists</Label>
                                <Input
                                    id="statA"
                                    type="number"
                                    value={inputAssists}
                                    onChange={(e) => setInputAssists(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="statAcs">ACS *</Label>
                                <Input
                                    id="statAcs"
                                    type="number"
                                    value={inputAcs}
                                    onChange={(e) => setInputAcs(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Result</Label>
                            <Select value={inputWon} onValueChange={setInputWon}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Win</SelectItem>
                                    <SelectItem value="false">Loss</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setInputOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddStat}>Add Entry</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
