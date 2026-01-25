export interface Tournament {
    id: string;
    name: string;
    activity_type: string;
    start_date: string;
    start_time: string | null;
    match_day: string | null;
    location: string;
    hoster_name: string | null;
    discord_server_link: string | null;
    roster_players: string | null;
    tournament_link: string | null;
    price_pool: string | null;
    entry_fee: string | null;
    participation_status: string;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// Status options with pill-style badge colors
export const participationStatusOptions = [
    { value: "pending", label: "pending", color: "bg-[#FEF7CD] text-yellow-800" },
    { value: "interested", label: "interested", color: "bg-blue-500 text-white" },
    { value: "registered", label: "registered", color: "bg-[#16a34a] text-white" },
    { value: "going", label: "going", color: "bg-[#16a34a] text-white" },
    { value: "not_going", label: "rejected", color: "bg-[#ea384c] text-white" },
    { value: "ongoing", label: "ongoing", color: "bg-purple-500 text-white" },
    { value: "done", label: "done", color: "bg-gray-500 text-white" },
];
