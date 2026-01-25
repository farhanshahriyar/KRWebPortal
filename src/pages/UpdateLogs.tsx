import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { UpdateLog, UpdateLogChange } from "@/types/update-logs";
import { Loader2 } from "lucide-react";

const UpdateLogs = () => {
  const [logs, setLogs] = useState<UpdateLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("update_logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      // Cast the data to our type since changes is jsonb
      const typedData = data.map((item: any) => ({
        ...item,
        changes: item.changes as UpdateLogChange[]
      })) as UpdateLog[];
      setLogs(typedData);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Update Logs</h1>
        <p className="text-muted-foreground mt-2">
          Track all changes and updates to the KingsRock Portal
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No update logs yet.
            </div>
          ) : (
            logs.map((update) => (
              <Card key={update.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        v{update.version} - {update.title}
                      </CardTitle>
                      <CardDescription>{update.date}</CardDescription>
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground">{update.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {update.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start gap-2">
                        <Badge variant={change.type === 'feature' ? 'default' : change.type === 'improvement' ? 'secondary' : 'destructive'}>
                          {change.type}
                        </Badge>
                        <span>{change.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateLogs;