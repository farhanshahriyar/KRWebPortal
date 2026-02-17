import {
    TeamMember,
    Match,
    Availability,
    Vod,
    PlayerStats,
    WeeklyFocus,
} from "./types";

// ─── Team Members ────────────────────────────────────────────
export const mockMembers: TeamMember[] = [
    {
        id: "m1",
        ign: "KR Phantom",
        realName: "Farhan",
        role: "Duelist",
        status: "active",
        agentPool: ["Jett", "Raze", "Neon"],
        joinDate: "2025-06-15",
        internalNotes: "Strong aim, needs to work on comms.",
    },
    {
        id: "m2",
        ign: "KR Shade",
        realName: "Abir",
        role: "IGL",
        status: "active",
        agentPool: ["Sova", "Fade", "KAY/O"],
        joinDate: "2025-06-15",
        internalNotes: "Great calls, good leadership.",
    },
    {
        id: "m3",
        ign: "KR Venom",
        realName: "Rifat",
        role: "Controller",
        status: "active",
        agentPool: ["Omen", "Astra", "Harbor"],
        joinDate: "2025-07-01",
        internalNotes: "Consistent smoke timings.",
    },
    {
        id: "m4",
        ign: "KR Frost",
        realName: "Sakib",
        role: "Sentinel",
        status: "active",
        agentPool: ["Killjoy", "Cypher", "Sage"],
        joinDate: "2025-07-10",
    },
    {
        id: "m5",
        ign: "KR Blitz",
        realName: "Tanvir",
        role: "Initiator",
        status: "active",
        agentPool: ["Breach", "Skye", "Gekko"],
        joinDate: "2025-08-01",
    },
    {
        id: "m6",
        ign: "KR Nova",
        realName: "Shanto",
        role: "Flex",
        status: "sub",
        agentPool: ["Reyna", "Chamber", "Iso"],
        joinDate: "2025-09-15",
        internalNotes: "Reliable sub, available weekends.",
    },
    {
        id: "m7",
        ign: "KR Echo",
        realName: "Fahim",
        role: "Duelist",
        status: "trial",
        agentPool: ["Jett", "Yoru"],
        joinDate: "2026-01-20",
        internalNotes: "Trial period — evaluate by end of Feb.",
    },
];

// ─── Matches ─────────────────────────────────────────────────
export const mockMatches: Match[] = [
    {
        id: "match1",
        opponent: "Team Nexus",
        date: "2026-02-20T19:00:00+06:00",
        checkInTime: "2026-02-20T18:30:00+06:00",
        status: "upcoming",
        confirmedRoster: ["m1", "m2", "m3", "m4", "m5"],
        plannedComp: [
            { memberId: "m1", agent: "Jett" },
            { memberId: "m2", agent: "Sova" },
            { memberId: "m3", agent: "Omen" },
            { memberId: "m4", agent: "Killjoy" },
            { memberId: "m5", agent: "Breach" },
        ],
    },
    {
        id: "match2",
        opponent: "Dragon Esports",
        date: "2026-02-25T20:00:00+06:00",
        checkInTime: "2026-02-25T19:30:00+06:00",
        status: "upcoming",
        confirmedRoster: ["m1", "m2", "m3", "m4", "m5"],
    },
    {
        id: "match3",
        opponent: "Shadow Wolves",
        date: "2026-02-10T19:00:00+06:00",
        checkInTime: "2026-02-10T18:30:00+06:00",
        status: "completed",
        confirmedRoster: ["m1", "m2", "m3", "m4", "m5"],
        score: { us: 13, them: 9 },
        maps: [
            { name: "Ascent", scoreUs: 13, scoreThem: 9 },
        ],
        vodId: "vod1",
        review: {
            summary: "Strong T-side. Need to improve retakes.",
            notes: "KR Phantom had a great ace on round 18. Mid control was dominant. Work on post-plant positioning for next match.",
            author: "KR Shade",
            createdAt: "2026-02-11T10:00:00+06:00",
        },
    },
    {
        id: "match4",
        opponent: "Phoenix Rising",
        date: "2026-02-05T19:00:00+06:00",
        checkInTime: "2026-02-05T18:30:00+06:00",
        status: "completed",
        confirmedRoster: ["m1", "m2", "m3", "m4", "m5"],
        score: { us: 8, them: 13 },
        maps: [
            { name: "Bind", scoreUs: 8, scoreThem: 13 },
        ],
        review: {
            summary: "Lost map control early. Struggled with aggressive peeks.",
            notes: "Need to revisit Bind defaults. Opponents punished our A short aggression consistently.",
            author: "KR Shade",
            createdAt: "2026-02-06T11:00:00+06:00",
        },
    },
];

// ─── Availability ────────────────────────────────────────────
export const mockAvailability: Availability[] = [
    { id: "a1", matchId: "match1", memberId: "m1", memberIgn: "KR Phantom", status: "yes" },
    { id: "a2", matchId: "match1", memberId: "m2", memberIgn: "KR Shade", status: "yes" },
    { id: "a3", matchId: "match1", memberId: "m3", memberIgn: "KR Venom", status: "yes" },
    { id: "a4", matchId: "match1", memberId: "m4", memberIgn: "KR Frost", status: "maybe" },
    { id: "a5", matchId: "match1", memberId: "m5", memberIgn: "KR Blitz", status: "pending" },
    { id: "a6", matchId: "match2", memberId: "m1", memberIgn: "KR Phantom", status: "yes" },
    { id: "a7", matchId: "match2", memberId: "m2", memberIgn: "KR Shade", status: "pending" },
    { id: "a8", matchId: "match2", memberId: "m3", memberIgn: "KR Venom", status: "no" },
    { id: "a9", matchId: "match2", memberId: "m4", memberIgn: "KR Frost", status: "pending" },
    { id: "a10", matchId: "match2", memberId: "m5", memberIgn: "KR Blitz", status: "pending" },
];

// ─── VODs ────────────────────────────────────────────────────
export const mockVods: Vod[] = [
    {
        id: "vod1",
        title: "KingsRock vs Shadow Wolves — Ascent",
        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        matchId: "match3",
        matchLabel: "vs Shadow Wolves (W 13-9)",
        uploadedAt: "2026-02-11T12:00:00+06:00",
        uploadedBy: "KR Shade",
        notes: [
            { id: "n1", timestamp: "3:24", content: "Good cross-fire setup on A site", tag: "Good Play", author: "KR Shade" },
            { id: "n2", timestamp: "8:15", content: "Missed smoke on mid — gave away map control", tag: "Mistake", author: "KR Shade" },
            { id: "n3", timestamp: "14:02", content: "Double peek B long with flash — do this more", tag: "Strategy", author: "KR Shade" },
        ],
    },
    {
        id: "vod2",
        title: "KingsRock vs Phoenix Rising — Bind",
        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        matchId: "match4",
        matchLabel: "vs Phoenix Rising (L 8-13)",
        uploadedAt: "2026-02-06T14:00:00+06:00",
        uploadedBy: "KR Shade",
        notes: [
            { id: "n4", timestamp: "5:10", content: "A short rush got punished — need better utility", tag: "Mistake", author: "KR Shade" },
            { id: "n5", timestamp: "11:30", content: "Good TP play by Omen for B retake", tag: "Good Play", author: "KR Venom" },
        ],
    },
    {
        id: "vod3",
        title: "Scrim Review — Haven Practice",
        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        uploadedAt: "2026-02-14T16:00:00+06:00",
        uploadedBy: "KR Shade",
        notes: [
            { id: "n6", timestamp: "7:45", content: "C long execute needs faster timing", tag: "Strategy", author: "KR Shade" },
        ],
    },
];

// ─── Player Stats (last 5 matches) ──────────────────────────
export const mockPlayerStats: PlayerStats[] = [
    {
        memberId: "m1",
        ign: "KR Phantom",
        kills: 98,
        deaths: 72,
        assists: 23,
        acs: 267,
        winRate: 60,
        matchHistory: [
            { matchId: "match3", date: "2026-02-10", opponent: "Shadow Wolves", kills: 24, deaths: 14, assists: 5, acs: 289, won: true },
            { matchId: "match4", date: "2026-02-05", opponent: "Phoenix Rising", kills: 18, deaths: 16, assists: 4, acs: 231, won: false },
            { matchId: "s1", date: "2026-01-30", opponent: "Team Alpha", kills: 21, deaths: 13, assists: 6, acs: 275, won: true },
            { matchId: "s2", date: "2026-01-25", opponent: "Cyber Sharks", kills: 19, deaths: 15, assists: 4, acs: 258, won: false },
            { matchId: "s3", date: "2026-01-20", opponent: "Blaze Esports", kills: 16, deaths: 14, assists: 4, acs: 240, won: true },
        ],
    },
    {
        memberId: "m2",
        ign: "KR Shade",
        kills: 82,
        deaths: 68,
        assists: 45,
        acs: 215,
        winRate: 60,
        matchHistory: [
            { matchId: "match3", date: "2026-02-10", opponent: "Shadow Wolves", kills: 18, deaths: 12, assists: 11, acs: 228, won: true },
            { matchId: "match4", date: "2026-02-05", opponent: "Phoenix Rising", kills: 14, deaths: 15, assists: 9, acs: 198, won: false },
            { matchId: "s1", date: "2026-01-30", opponent: "Team Alpha", kills: 17, deaths: 13, assists: 10, acs: 220, won: true },
            { matchId: "s2", date: "2026-01-25", opponent: "Cyber Sharks", kills: 16, deaths: 14, assists: 8, acs: 210, won: false },
            { matchId: "s3", date: "2026-01-20", opponent: "Blaze Esports", kills: 17, deaths: 14, assists: 7, acs: 218, won: true },
        ],
    },
    {
        memberId: "m3",
        ign: "KR Venom",
        kills: 70,
        deaths: 65,
        assists: 52,
        acs: 192,
        winRate: 60,
        matchHistory: [
            { matchId: "match3", date: "2026-02-10", opponent: "Shadow Wolves", kills: 15, deaths: 11, assists: 12, acs: 204, won: true },
            { matchId: "match4", date: "2026-02-05", opponent: "Phoenix Rising", kills: 12, deaths: 14, assists: 10, acs: 178, won: false },
            { matchId: "s1", date: "2026-01-30", opponent: "Team Alpha", kills: 14, deaths: 13, assists: 11, acs: 195, won: true },
            { matchId: "s2", date: "2026-01-25", opponent: "Cyber Sharks", kills: 13, deaths: 14, assists: 10, acs: 185, won: false },
            { matchId: "s3", date: "2026-01-20", opponent: "Blaze Esports", kills: 16, deaths: 13, assists: 9, acs: 198, won: true },
        ],
    },
    {
        memberId: "m4",
        ign: "KR Frost",
        kills: 75,
        deaths: 70,
        assists: 38,
        acs: 198,
        winRate: 60,
        matchHistory: [
            { matchId: "match3", date: "2026-02-10", opponent: "Shadow Wolves", kills: 16, deaths: 13, assists: 8, acs: 210, won: true },
            { matchId: "match4", date: "2026-02-05", opponent: "Phoenix Rising", kills: 13, deaths: 15, assists: 7, acs: 182, won: false },
            { matchId: "s1", date: "2026-01-30", opponent: "Team Alpha", kills: 15, deaths: 14, assists: 9, acs: 200, won: true },
            { matchId: "s2", date: "2026-01-25", opponent: "Cyber Sharks", kills: 14, deaths: 14, assists: 7, acs: 192, won: false },
            { matchId: "s3", date: "2026-01-20", opponent: "Blaze Esports", kills: 17, deaths: 14, assists: 7, acs: 206, won: true },
        ],
    },
    {
        memberId: "m5",
        ign: "KR Blitz",
        kills: 78,
        deaths: 71,
        assists: 48,
        acs: 205,
        winRate: 60,
        matchHistory: [
            { matchId: "match3", date: "2026-02-10", opponent: "Shadow Wolves", kills: 17, deaths: 13, assists: 10, acs: 218, won: true },
            { matchId: "match4", date: "2026-02-05", opponent: "Phoenix Rising", kills: 14, deaths: 16, assists: 9, acs: 190, won: false },
            { matchId: "s1", date: "2026-01-30", opponent: "Team Alpha", kills: 16, deaths: 13, assists: 11, acs: 212, won: true },
            { matchId: "s2", date: "2026-01-25", opponent: "Cyber Sharks", kills: 15, deaths: 15, assists: 9, acs: 200, won: false },
            { matchId: "s3", date: "2026-01-20", opponent: "Blaze Esports", kills: 16, deaths: 14, assists: 9, acs: 208, won: true },
        ],
    },
];

// ─── Weekly Focus ────────────────────────────────────────────
export const mockWeeklyFocus: WeeklyFocus = {
    note: "Focus on retake setups and post-plant positioning. Review Ascent VOD before next match.",
    updatedBy: "KR Shade",
    updatedAt: "2026-02-16T10:00:00+06:00",
};
