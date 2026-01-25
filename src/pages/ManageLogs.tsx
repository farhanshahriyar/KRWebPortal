import { useEffect, useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { UpdateLog, UpdateLogChange } from "@/types/update-logs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UpdateLogDialog } from "@/components/UpdateLogDialog";

const ManageLogs = () => {
    const { role } = useRole();
    const { toast } = useToast();
    const [logs, setLogs] = useState<UpdateLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<UpdateLog | null>(null);

    useEffect(() => {
        if (role !== "kr_admin") {
            // access denied is handled by UI rendering below or could redirect
        } else {
            fetchLogs();
        }
    }, [role]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("update_logs")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching logs:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch update logs.",
            });
        } else {
            // Cast the data to our type, specifically changes from jsonb
            const typedData = data.map((item: any) => ({
                ...item,
                changes: item.changes as UpdateLogChange[]
            })) as UpdateLog[];
            setLogs(typedData);
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const { error } = await supabase
            .from("update_logs")
            .delete()
            .eq("id", deleteId);

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete log.",
            });
        } else {
            toast({
                title: "Success",
                description: "Log deleted successfully.",
            });
            fetchLogs();
        }
        setDeleteId(null);
    };

    const handleEdit = (log: UpdateLog) => {
        setSelectedLog(log);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedLog(null);
        setDialogOpen(true);
    };

    if (role !== "kr_admin") {
        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            You don't have permission to access this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Manage Update Logs</h1>
                    <p className="text-muted-foreground mt-2">
                        Create, edit, and delete update logs.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Log
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {logs.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                No update logs found.
                            </CardContent>
                        </Card>
                    ) : (
                        logs.map((log) => (
                            <Card key={log.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">
                                                v{log.version} - {log.title}
                                            </CardTitle>
                                            <CardDescription>{log.date}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(log)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setDeleteId(log.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the update log
                                                            for version {log.version}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground mb-4">{log.description}</p>
                                    <div className="space-y-2">
                                        {log.changes.map((change, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Badge variant={change.type === 'feature' ? 'default' : change.type === 'improvement' ? 'secondary' : 'destructive'}>
                                                    {change.type}
                                                </Badge>
                                                <span className="text-sm">{change.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <UpdateLogDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                logToEdit={selectedLog}
                onSuccess={fetchLogs}
            />
        </div>
    );
};

export default ManageLogs;
