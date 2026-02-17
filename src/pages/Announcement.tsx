import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Eye,
  Megaphone,
  MessageSquare,
  Pin,
  Trophy,
  Users,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { AnnouncementDetailDialog } from "@/components/announcement/AnnouncementDetailDialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  created_by: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export default function Announcement() {
  const { role } = useRole();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAnnouncements();
    if (role === "kr_admin") {
      fetchViewCounts();
    }
  }, [role]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
    } else {
      setAnnouncements(data as Announcement[]);
    }
    setLoading(false);
  };

  const fetchViewCounts = async () => {
    const { data, error } = await supabase.rpc("get_announcement_view_counts");
    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((row: { announcement_id: string; view_count: number }) => {
        counts[row.announcement_id] = row.view_count;
      });
      setViewCounts(counts);
    }
  };

  const handleOpenDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/90 text-white hover:bg-red-500";
      case "medium":
        return "bg-amber-500/90 text-white hover:bg-amber-500";
      case "normal":
        return "bg-blue-500/90 text-white hover:bg-blue-500";
      default:
        return "bg-gray-500/90 text-white hover:bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Tournament":
        return <Trophy className="h-4 w-4" />;
      case "Team":
        return <Users className="h-4 w-4" />;
      case "Important":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with the latest KingsRock announcements
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No Announcements</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no announcements yet. Check back later!
            </p>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-3 pr-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
                onClick={() => handleOpenDetail(announcement)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {announcement.is_pinned && (
                        <Badge variant="outline" className="gap-1 text-xs border-amber-400 text-amber-500">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        {getTypeIcon(announcement.type)}
                        {announcement.type}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {announcement.title}
                    </h2>

                    {/* Content preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 mr-1" />
                        {new Date(announcement.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      {/* View count — admin only */}
                      {role === "kr_admin" && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {viewCounts[announcement.id] || 0} views
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Detail Dialog */}
      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          // Refresh view counts when dialog closes (if admin)
          if (!open && role === "kr_admin") {
            fetchViewCounts();
          }
        }}
        viewCount={selectedAnnouncement ? viewCounts[selectedAnnouncement.id] : undefined}
      />
    </div>
  );
}
