import { useRole } from "@/contexts/RoleContext";
import TournamentTable from "@/components/tournaments/TournamentTable";
import TournamentAddDialog from "@/components/tournaments/TournamentAddDialog";

const TournamentsMatches = () => {
  const { canAccess } = useRole();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tournament Schedule</h1>
          <p className="text-muted-foreground mt-1">
            View and manage tournament schedules and participation status.
          </p>
        </div>

        {/* Add Tournament Button - only visible to Manager/Admin */}
        {canAccess("tournaments.create") && (
          <TournamentAddDialog />
        )}
      </div>

      {/* Tournament Table */}
      <TournamentTable />
    </div>
  );
};

export default TournamentsMatches;