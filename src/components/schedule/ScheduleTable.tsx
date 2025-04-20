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

// Mock data - will be replaced with real data later
const mockSchedules = [
  {
    id: 1,
    title: "Team Meeting",
    date: "2024-04-15",
    startTime: "10:00",
    endTime: "11:00",
    location: "Discord Voice Channel",
    description: "Weekly team sync-up meeting",
    priority: "medium",
    status: "Upcoming",
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
    "Upcoming": "bg-green-500",
    "In Progress": "bg-blue-500",
    "Completed": "bg-gray-500",
    "Cancelled": "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

export function ScheduleTable() {
  const handleEdit = (id: number) => {
    console.log("Edit schedule:", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete schedule:", id);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockSchedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.title}</TableCell>
              <TableCell>{schedule.date}</TableCell>
              <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
              <TableCell>{schedule.location}</TableCell>
              <TableCell>
                <Badge className={getPriorityColor(schedule.priority)}>
                  {schedule.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(schedule.status)}>
                  {schedule.status}
                </Badge>
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