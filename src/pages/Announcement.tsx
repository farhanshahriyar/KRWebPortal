import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, MessageSquare, Trophy, Users } from "lucide-react";
import { ProtectedComponent } from "@/components/ProtectedComponent";

const announcements = [
  {
    id: 1,
    title: "Upcoming Tournament: KingsRock Invitational",
    type: "Tournament",
    date: "2024-02-20",
    content: "Get ready for our biggest tournament yet! Prize pool: $10,000",
    priority: "high",
  },
  {
    id: 2,
    title: "Team Practice Schedule Update",
    type: "Team",
    date: "2024-02-18",
    content: "New practice schedule for all divisions starting next week",
    priority: "medium",
  },
  {
    id: 3,
    title: "New Team Members Welcome",
    type: "Team",
    date: "2024-02-15",
    content: "Please welcome our new members joining the Valorant division",
    priority: "normal",
  },
];

export default function Announcement() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "normal":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Tournament":
        return <Trophy className="h-5 w-5" />;
      case "Team":
        return <Users className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img
            src="/lovable-uploads/b0b1d1d2-3d40-4aa8-b98e-13b431d76235.png"
            alt="KingsRock Logo"
            className="h-12 w-12"
          />
          <h1 className="text-3xl font-bold">KR Announcements</h1>
        </div>
        <ProtectedComponent feature="announcement.create">
          <Button className="bg-primary">New Announcement</Button>
        </ProtectedComponent>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority.toUpperCase()}
                    </Badge>
                    <div className="flex items-center text-muted-foreground">
                      {getTypeIcon(announcement.type)}
                      <span className="ml-1">{announcement.type}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold">{announcement.title}</h2>
                  <p className="text-muted-foreground">{announcement.content}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {new Date(announcement.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
