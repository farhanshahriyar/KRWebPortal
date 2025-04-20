import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { differenceInMinutes, differenceInHours, format } from "date-fns";

// Mock data - will be replaced with real data later
const mockSchedules = [
  {
    id: 1,
    userEmail: "john@example.com",
    displayName: "John Doe",
    title: "Team Meeting",
    description: "Weekly team sync-up meeting",
    date: "2024-04-15",
    startTime: "10:00",
    endTime: "11:00",
    priority: "medium",
    status: "Pending",
  },
];

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };
  return colors[priority] || "bg-gray-500";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Accept": "bg-green-500",
    "Reject": "bg-red-500",
    "Approved": "bg-blue-500",
    "Hold": "bg-yellow-500",
    "Pending": "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
};

const calculateDuration = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  const start = new Date(2024, 0, 1, startHour, startMinute);
  const end = new Date(2024, 0, 1, endHour, endMinute);
  
  const minutes = differenceInMinutes(end, start);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = differenceInHours(end, start);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
};

export function RequestScheduleTable() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState(mockSchedules);

  const handleStatusChange = (id: number, newStatus: string) => {
    setSchedules(prevSchedules =>
      prevSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, status: newStatus } : schedule
      )
    );
    toast({
      title: "Status Updated",
      description: `Schedule status has been updated to ${newStatus}`,
    });
  };

  const handleDelete = (id: number) => {
    setSchedules(prevSchedules =>
      prevSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, status: "Reject" } : schedule
      )
    );
    toast({
      title: "Schedule Rejected",
      description: "The schedule has been rejected and moved to rejected status",
    });
  };

  const handleEdit = (id: number) => {
    console.log("Edit schedule:", id);
    // Implement edit functionality
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{schedule.displayName}</span>
                  <span className="text-sm text-muted-foreground">{schedule.userEmail}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{schedule.title}</TableCell>
              <TableCell>{schedule.description}</TableCell>
              <TableCell>{format(new Date(schedule.date), "MMM dd, yyyy")}</TableCell>
              <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
              <TableCell>{calculateDuration(schedule.startTime, schedule.endTime)}</TableCell>
              <TableCell>
                <Badge className={getPriorityColor(schedule.priority)}>
                  {schedule.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[110px]">
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(schedule.id, "Accept")}>
                      Accept
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(schedule.id, "Reject")}>
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(schedule.id, "Approved")}>
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(schedule.id, "Hold")}>
                      Hold
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(schedule.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}