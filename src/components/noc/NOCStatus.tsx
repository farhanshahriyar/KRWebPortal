import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// This will be replaced with actual data from Supabase later
const mockNocs = [
  {
    id: 1,
    reason: "Family Issue",
    message: "Away bye ajh, So I cant join........",
    status: "Approved",
  },
  {
    id: 2,
    reason: "Personal Issue",
    message: "Depressed for something ............",
    status: "Rejected",
  },
  {
    id: 3,
    reason: "Exam Issue",
    message: "Exam Hobe 22-30 Tank porjonto...",
    status: "Under Review",
  },
];

const NOCStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Last Top 10 NOC Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>NOC Reason</TableHead>
              <TableHead>NOC Message</TableHead>
              <TableHead>NOC Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockNocs.map((noc, index) => (
              <TableRow key={noc.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{noc.reason}</TableCell>
                <TableCell>{noc.message}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      noc.status === "Approved"
                        ? "default"
                        : noc.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {noc.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-sm text-muted-foreground mt-2">
            0 of 100 row(s) selected. Rows per page: 10 Page 1 of 10
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NOCStatus;