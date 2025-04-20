import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TournamentTable from "@/components/tournaments/TournamentTable";
import TournamentForm from "@/components/tournaments/TournamentForm";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { useRole } from "@/contexts/RoleContext";

const TournamentsMatches = () => {
  const { canAccess } = useRole();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tournaments & Matches</h1>
      
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Tournament List</TabsTrigger>
          <ProtectedComponent feature="tournaments.create">
            <TabsTrigger value="add">Add Tournament</TabsTrigger>
          </ProtectedComponent>
        </TabsList>
        <TabsContent value="list">
          <TournamentTable />
        </TabsContent>
        <ProtectedComponent feature="tournaments.create">
          <TabsContent value="add">
            <TournamentForm />
          </TabsContent>
        </ProtectedComponent>
      </Tabs>
    </div>
  );
};

export default TournamentsMatches;