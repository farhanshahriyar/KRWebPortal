import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Mock data - will be replaced with real data later
const mockTournaments = [
  {
    id: 1,
    name: "KR Summer Championship",
    startTime: "2024-06-15T10:00:00",
    location: "Tokyo, Japan",
    hostersName: "John Doe",
    discordLink: "https://discord.gg/example",
    roster: "KingsRock Official",
    tournamentLink: "https://tournament.example.com",
    pricePool: "$1000",
    entryFee: "$50",
    status: "Registered",
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Registered": "bg-green-500",
    "Pending Confirm": "bg-yellow-500",
    "Not Going": "bg-red-500",
    "Interested": "bg-blue-500",
    "Ongoing": "bg-purple-500",
    "Done": "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
};

const TournamentTable = () => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tournament Name</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Hoster</TableHead>
            <TableHead>Roster</TableHead>
            <TableHead>Price Pool</TableHead>
            <TableHead>Entry Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Links</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTournaments.map((tournament) => (
            <TableRow key={tournament.id}>
              <TableCell className="font-medium">{tournament.name}</TableCell>
              <TableCell>{new Date(tournament.startTime).toLocaleString()}</TableCell>
              <TableCell>{tournament.location}</TableCell>
              <TableCell>{tournament.hostersName}</TableCell>
              <TableCell>{tournament.roster}</TableCell>
              <TableCell>{tournament.pricePool}</TableCell>
              <TableCell>{tournament.entryFee}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(tournament.status)}>
                  {tournament.status}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <a
                  href={tournament.discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Discord
                </a>
                <a
                  href={tournament.tournamentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Tournament
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TournamentTable;