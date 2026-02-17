import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Trash2, LayoutList, BarChart3 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRole } from "@/contexts/RoleContext";

type ViewMode = "summary" | "detail";

interface PlayerSummary {
    userId: string;
    username: string;
    present: number;
    late: number;
    absent: number;
}

function AttendenceList() {
    const [attendanceRecords, setAttendanceRecords] = useState<Tables<'attendance'>[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [userMap, setUserMap] = useState<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<ViewMode>("summary");
    const recordsPerPage = 10;
    const { role } = useRole();
    const isAdmin = role === "kr_admin";

    useEffect(() => {
        fetchAttendance();
        fetchUsers();
    }, []);

    const fetchAttendance = async () => {
        const { data, error } = await supabase
            .from("attendance")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching attendance:", error);
        } else {
            setAttendanceRecords(data);
        }
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username");

        if (error) {
            console.error("Error fetching users:", error);
        } else {
            const map: Record<string, string> = {};
            data?.forEach((user) => {
                map[user.id] = user.username || "N/A";
            });
            setUserMap(map);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const bdtTime = date.toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka",
            dateStyle: "medium",
            timeStyle: "short"
        });

        const relativeTime = formatDistanceToNow(
            new Date(date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })),
            { addSuffix: true }
        );

        return `${bdtTime} (${relativeTime})`;
    };

    const getStatusDisplay = (status: string) => {
        switch (status.toLowerCase()) {
            case "present":
                return "✅ Present";
            case "absent":
                return "❌ Absent";
            case "late":
                return "🚀 Late";
            default:
                return status;
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("attendance").delete().eq("id", id);
        if (!error) {
            setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
            setSelectedIds((prev) => {
                const updated = new Set(prev);
                updated.delete(id);
                return updated;
            });
        }
    };

    const handleBulkDelete = async () => {
        const idsToDelete = Array.from(selectedIds);
        const { error } = await supabase.from("attendance").delete().in("id", idsToDelete);
        if (!error) {
            setAttendanceRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)));
            setSelectedIds(new Set());
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const ids = paginatedRecords.map((r) => r.id);
        setSelectedIds(checked ? new Set(ids) : new Set());
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setSelectedIds(newSet);
    };

    const months = [...new Set(
        attendanceRecords
            .filter(r => r.date)
            .map(r => r.date!.slice(0, 7))
    )];

    const filteredByMonth = selectedMonth
        ? attendanceRecords.filter((r) => r.date?.startsWith(selectedMonth))
        : attendanceRecords;

    const searchedRecords = filteredByMonth.filter((r) => {
        const username = userMap[r.user_id] || "";
        const lowerSearch = searchTerm.toLowerCase();
        return (
            r.user_id?.toLowerCase().includes(lowerSearch) ||
            username.toLowerCase().includes(lowerSearch) ||
            r.date?.includes(searchTerm)
        );
    });

    const totalPages = Math.ceil(searchedRecords.length / recordsPerPage);
    const paginatedRecords = searchedRecords.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    // ── Summary data: aggregate per-player P / L / A counts ──
    const playerSummaries: PlayerSummary[] = useMemo(() => {
        const map = new Map<string, PlayerSummary>();
        searchedRecords.forEach((r) => {
            if (!map.has(r.user_id)) {
                map.set(r.user_id, {
                    userId: r.user_id,
                    username: userMap[r.user_id] || "N/A",
                    present: 0,
                    late: 0,
                    absent: 0,
                });
            }
            const entry = map.get(r.user_id)!;
            const status = r.status.toLowerCase();
            if (status === "present") entry.present++;
            else if (status === "late") entry.late++;
            else if (status === "absent") entry.absent++;
        });
        return Array.from(map.values()).sort((a, b) =>
            a.username.localeCompare(b.username)
        );
    }, [searchedRecords, userMap]);

    const downloadCSV = () => {
        const headers = ["ID", "User ID", "Username", "Date", "Status", "Notes", "Created At"];
        const rows = searchedRecords.map((r) => [
            r.id,
            r.user_id,
            userMap[r.user_id] || "N/A",
            r.date,
            r.status,
            r.notes ?? "",
            r.created_at
        ]);

        const csvContent =
            [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedMonth || "all"}_attendance-sheet.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Calculate column count for empty-state colspan
    const colCount = isAdmin ? 9 : 6;

    return (
        <div className="space-y-4">
            <PageHeader title="Manage Attendance" description="View all attendance records" />

            {/* Filters + View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2 items-center">
                    <Select onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[200px]">
                            {selectedMonth || "Filter by Month"}
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* View mode toggle */}
                    <div className="flex rounded-lg border overflow-hidden">
                        <button
                            onClick={() => setViewMode("summary")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "summary"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            Summary
                        </button>
                        <button
                            onClick={() => setViewMode("detail")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "detail"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <LayoutList className="h-3.5 w-3.5" />
                            Detail Log
                        </button>
                    </div>
                </div>

                <Input
                    type="text"
                    placeholder={isAdmin ? "Search by Username or UID" : "Search by Username"}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border px-3 py-1 rounded-md text-sm"
                />

                {isAdmin && (
                    <div className="flex items-center gap-2">
                        {viewMode === "detail" && selectedIds.size > 0 && (
                            <Button variant="destructive" onClick={handleBulkDelete}>
                                Delete Selected
                            </Button>
                        )}
                        {searchedRecords.length > 0 && (
                            <Button onClick={downloadCSV}>
                                Download CSV
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════ SUMMARY VIEW ═══════════ */}
            {viewMode === "summary" && (
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="[&>th]:text-center">
                                <TableHead className="!text-left font-bold text-foreground w-16">ID</TableHead>
                                <TableHead className="!text-left font-bold text-foreground">Player Name</TableHead>
                                <TableHead className="!text-left font-bold text-foreground">IGN</TableHead>
                                <TableHead
                                    className="font-bold text-white w-20"
                                    style={{ backgroundColor: "#22c55e" }}
                                >
                                    P
                                </TableHead>
                                <TableHead
                                    className="font-bold text-white w-20"
                                    style={{ backgroundColor: "#f97316" }}
                                >
                                    L
                                </TableHead>
                                <TableHead
                                    className="font-bold text-white w-20"
                                    style={{ backgroundColor: "#ef4444" }}
                                >
                                    A
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {playerSummaries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                        No Attendance Records Found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                playerSummaries.map((player, index) => {
                                    const total = player.present + player.late + player.absent;
                                    // Highlight row if player has more absences than anything else
                                    const isHighAbsent = player.absent > 0 && player.absent >= total / 2;
                                    return (
                                        <TableRow
                                            key={player.userId}
                                            className={isHighAbsent ? "bg-red-50 dark:bg-red-950/20" : ""}
                                        >
                                            <TableCell className="font-medium">
                                                {10001 + index}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {player.username}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {player.username}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-emerald-600">
                                                {player.present}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-orange-500">
                                                {player.late}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-red-500">
                                                {player.absent}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Summary footer */}
                    {playerSummaries.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
                            <span className="text-sm text-muted-foreground">
                                {playerSummaries.length} player{playerSummaries.length !== 1 ? "s" : ""} •{" "}
                                {searchedRecords.length} total record{searchedRecords.length !== 1 ? "s" : ""}
                            </span>
                            <div className="flex gap-4 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    Present: {playerSummaries.reduce((s, p) => s + p.present, 0)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                                    Late: {playerSummaries.reduce((s, p) => s + p.late, 0)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                    Absent: {playerSummaries.reduce((s, p) => s + p.absent, 0)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════ DETAIL LOG VIEW ═══════════ */}
            {viewMode === "detail" && (
                <>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isAdmin && (
                                        <TableHead>
                                            <Checkbox
                                                checked={paginatedRecords.length > 0 && selectedIds.size === paginatedRecords.length}
                                                indeterminate={selectedIds.size > 0 && selectedIds.size < paginatedRecords.length}
                                                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead>No.</TableHead>
                                    <TableHead>Date</TableHead>
                                    {isAdmin && <TableHead>UID</TableHead>}
                                    <TableHead>Username</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Present Given At</TableHead>
                                    {isAdmin && <TableHead>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={colCount} className="text-center text-gray-500">
                                            No Attendance Records Found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRecords.map((record, index) => (
                                        <TableRow key={record.id}>
                                            {isAdmin && (
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(record.id)}
                                                        onCheckedChange={() => toggleSelect(record.id)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>{(currentPage - 1) * recordsPerPage + index + 1}</TableCell>
                                            <TableCell>{record.date}</TableCell>
                                            {isAdmin && <TableCell>{record.user_id}</TableCell>}
                                            <TableCell>{userMap[record.user_id] || "N/A"}</TableCell>
                                            <TableCell>{getStatusDisplay(record.status)}</TableCell>
                                            <TableCell>{record.notes || "no notes given"}</TableCell>
                                            <TableCell>{formatDate(record.created_at)}</TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(record.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-4">
                            <Button
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default AttendenceList;
