export type MemberStatus = "active" | "sub" | "trial";
export type InGameRole = "Duelist" | "Initiator" | "Controller" | "Sentinel" | "IGL" | "Flex";
export type AvailabilityStatus = "yes" | "no" | "maybe" | "pending";
export type VodNoteTag = "Mistake" | "Strategy" | "Good Play";
export type MatchStatus = "upcoming" | "completed" | "cancelled";

export interface TeamMember {
    id: string;
    ign: string;
    realName?: string;
    role: InGameRole;
    status: MemberStatus;
    agentPool: string[];
    joinDate: string;
    avatarUrl?: string;
    internalNotes?: string;
}

export interface Match {
    id: string;
    opponent: string;
    opponentLogo?: string;
    date: string; // ISO string
    checkInTime: string; // ISO string
    status: MatchStatus;
    map?: string;
    maps?: MapResult[];
    plannedComp?: PlannedComp[];
    confirmedRoster: string[]; // member IDs
    score?: { us: number; them: number };
    vodId?: string;
    review?: MatchReview;
}

export interface MapResult {
    name: string;
    scoreUs: number;
    scoreThem: number;
}

export interface PlannedComp {
    memberId: string;
    agent: string;
}

export interface Availability {
    id: string;
    matchId: string;
    memberId: string;
    memberIgn: string;
    status: AvailabilityStatus;
}

export interface Vod {
    id: string;
    title: string;
    youtubeUrl: string;
    matchId?: string;
    matchLabel?: string;
    uploadedAt: string;
    uploadedBy: string;
    notes: VodNote[];
}

export interface VodNote {
    id: string;
    timestamp: string; // e.g. "12:34"
    content: string;
    tag: VodNoteTag;
    author: string;
}

export interface MatchReview {
    summary: string;
    notes: string;
    author: string;
    createdAt: string;
}

export interface PlayerStats {
    memberId: string;
    ign: string;
    kills: number;
    deaths: number;
    assists: number;
    acs: number;
    winRate: number;
    matchHistory: MatchHistoryEntry[];
}

export interface MatchHistoryEntry {
    matchId: string;
    date: string;
    opponent: string;
    kills: number;
    deaths: number;
    assists: number;
    acs: number;
    won: boolean;
}

export interface WeeklyFocus {
    note: string;
    updatedBy: string;
    updatedAt: string;
}
