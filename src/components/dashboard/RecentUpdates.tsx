
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, FileText, Users } from "lucide-react";

interface Update {
  type: string;
  content: string;
  timestamp: string;
}

interface RecentUpdatesProps {
  updates: Update[];
}

// Helper function to get the appropriate icon for each update type
const getUpdateIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "attendance":
      return Calendar;
    case "noc":
      return FileText;
    case "member":
      return Users;
    default:
      return Bell;
  }
};

// Helper function to get the appropriate color for each update type
const getUpdateColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "attendance":
      return "text-blue-500";
    case "noc":
      return "text-amber-500";
    case "member":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

export function RecentUpdates({ updates }: RecentUpdatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update, index) => {
            const Icon = getUpdateIcon(update.type);
            const colorClass = getUpdateColor(update.type);
            
            return (
              <div 
                key={index} 
                className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`mt-0.5 p-2 rounded-full bg-background ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{update.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {update.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
