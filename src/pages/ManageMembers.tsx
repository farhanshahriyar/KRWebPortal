import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { MembersList } from "@/admin-dashboard/MemberList";
import { Card } from "@/components/ui/card";

const ManageMembers = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manage Members" 
        description="View and manage all member accounts" 
      />
      
      <Card className="p-6">
        <MembersList />
      </Card>
    </div>
  );
};

export default ManageMembers;