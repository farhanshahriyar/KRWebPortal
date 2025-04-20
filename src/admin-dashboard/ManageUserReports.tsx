import React, { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Tables } from "../integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditReportDialog } from "./EditReportDialog";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PageHeader } from "@/components/ui/page-header";

// ManageUserReports component
export function ManageUserReports() {
  const [reports, setReports] = useState<Tables<'user_reports'>[]>([]);
  const [selectedReport, setSelectedReport] = useState<Tables<'user_reports'> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch the reports data from Supabase
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*');

      if (error) {
        console.error("Error fetching reports:", error);
      } else {
        setReports(data);
      }
    };

    fetchReports();

    // For supabase-js v2.x, use `.channel` for real-time subscription
    const reportChannel = supabase
      .channel('user_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_reports' }, payload => {
        if (payload.eventType === 'INSERT') {
          setReports((prevReports) => [...prevReports, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setReports((prevReports) =>
            prevReports.map((report) =>
              report.id === payload.new.id ? payload.new : report
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setReports((prevReports) =>
            prevReports.filter((report) => report.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      reportChannel.unsubscribe();
    };
  }, []);

  const handleDelete = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error("Error deleting report:", error);
      } else {
        setReports((prevReports) => prevReports.filter((report) => report.id !== reportId));
      }
    } catch (error) {
      console.error("Error in deleting report:", error);
    }
  };

  const handleEdit = (report: Tables<'user_reports'>) => {
    setSelectedReport(report);
    setIsEditDialogOpen(true);
  };

  const handleUpdateReport = async (updatedReport: Tables<'user_reports'>) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update(updatedReport)
        .eq('id', updatedReport.id);

      if (error) {
        console.error("Error updating report:", error);
      } else {
        setReports((prevReports) =>
          prevReports.map((report) => (report.id === updatedReport.id ? updatedReport : report))
        );
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error in updating report:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manage Reports"
        description="View all report records"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No User Reports Available or Found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report, index) => (
                <TableRow key={report.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.subject}</TableCell>
                  <TableCell>{report.report_type}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <ProtectedComponent feature="reports.edit">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </ProtectedComponent>
                      <ProtectedComponent feature="reports.delete">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </ProtectedComponent>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditReportDialog
        report={selectedReport}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateReport}
      />
    </div>
  );
}
