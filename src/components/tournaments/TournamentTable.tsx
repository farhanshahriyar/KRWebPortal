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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, MoreHorizontal, ExternalLink } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Tournament, participationStatusOptions } from "./types";
import TournamentEditDialog from "./TournamentEditDialog";
import TournamentDeleteDialog from "./TournamentDeleteDialog";

const getStatusBadge = (status: string) => {
  const statusOption = participationStatusOptions.find((s) => s.value === status);
  if (!statusOption) {
    return <Badge variant="outline" className="rounded-full px-5 py-1.5 text-sm cursor-default hover:bg-transparent">{status}</Badge>;
  }
  return (
    <Badge className={`${statusOption.color} rounded-full px-5 py-1.5 text-sm font-medium border-0 cursor-default hover:opacity-100`}>
      {statusOption.label}
    </Badge>
  );
};

const TournamentTable = () => {
  const { role, canAccess } = useRole();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Fetch tournaments
  const { data: tournaments = [], isLoading, isError, error } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Update status mutation (Admin only)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("tournaments")
        .update({ participation_status: status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    },
  });

  const handleEdit = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setEditDialogOpen(true);
  };

  const handleDelete = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = (tournamentId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: tournamentId, status: newStatus });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    return timeStr;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingIndicator />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            Failed to load tournaments: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tournament Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {role === "kr_member" && (
                "There is no tournament participation from KingsRock clan."
              )}
              {role === "kr_manager" && (
                "No tournaments found. Click 'Add Tournament' to create one."
              )}
              {role === "kr_admin" && (
                "We are not going any tournament right now, Mods are searching on it."
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Tournament Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Match Day</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Hoster</TableHead>
                    <TableHead>Roster</TableHead>
                    <TableHead>Price Pool</TableHead>
                    <TableHead>Entry Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Links</TableHead>
                    {canAccess("tournaments.edit") && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>
                        <div className="font-medium">{tournament.name}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {tournament.activity_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(tournament.start_date)}</TableCell>
                      <TableCell>{formatTime(tournament.start_time)}</TableCell>
                      <TableCell>{tournament.match_day || "-"}</TableCell>
                      <TableCell>{tournament.location}</TableCell>
                      <TableCell>{tournament.hoster_name || "-"}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {tournament.roster_players || "-"}
                      </TableCell>
                      <TableCell>{tournament.price_pool || "-"}</TableCell>
                      <TableCell>{tournament.entry_fee || "Free"}</TableCell>
                      <TableCell>
                        {/* Only Admin can change status, Members and Managers see badge */}
                        {role === "kr_admin" ? (
                          <Select
                            value={tournament.participation_status}
                            onValueChange={(value) => handleStatusChange(tournament.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {participationStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          getStatusBadge(tournament.participation_status)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {tournament.discord_server_link && (
                            <a
                              href={tournament.discord_server_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              Discord <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {tournament.tournament_link && (
                            <a
                              href={tournament.tournament_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              Link <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      {canAccess("tournaments.edit") && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(tournament)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {canAccess("tournaments.delete") && (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(tournament)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <TournamentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tournament={selectedTournament}
      />

      {/* Delete Dialog */}
      <TournamentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tournament={selectedTournament}
      />
    </>
  );
};

export default TournamentTable;