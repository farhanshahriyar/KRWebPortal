import React, { useEffect, useState } from "react";
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
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function AttendenceList() {
    const [attendanceRecords, setAttendanceRecords] = useState<Tables<'attendance'>[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        fetchAttendance();
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

    const searchedRecords = filteredByMonth.filter((r) =>
        r.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.date?.includes(searchTerm)
    );

    const totalPages = Math.ceil(searchedRecords.length / recordsPerPage);
    const paginatedRecords = searchedRecords.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const downloadCSV = () => {
        const headers = ["ID", "User ID", "Date", "Status", "Notes", "Created At"];
        const rows = searchedRecords.map((r) => [
            r.id,
            r.user_id,
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

    return (
        <div className="space-y-4">
            <PageHeader title="Manage Attendance" description="View all attendance records" />

            <div className="flex justify-between items-center gap-4">
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

                </div>
                    <Input
                        type="text"
                        placeholder="Search Date or UID"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border px-3 py-1 rounded-md text-sm"
                    />

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Checkbox
                                    checked={paginatedRecords.length > 0 && selectedIds.size === paginatedRecords.length}
                                    indeterminate={selectedIds.size > 0 && selectedIds.size < paginatedRecords.length}
                                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                />
                            </TableHead>
                            <TableHead>No.</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>UID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Present Given At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-500">
                                    No Attendance Records Found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRecords.map((record, index) => (
                                <TableRow key={record.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(record.id)}
                                            onCheckedChange={() => toggleSelect(record.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{(currentPage - 1) * recordsPerPage + index + 1}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.user_id}</TableCell>
                                    <TableCell>{getStatusDisplay(record.status)}</TableCell>
                                    <TableCell>{record.notes || "no notes given"}</TableCell>
                                    <TableCell>{formatDate(record.created_at)}</TableCell>
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
        </div>
    );
}

export default AttendenceList;

