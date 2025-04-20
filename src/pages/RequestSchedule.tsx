import { useState } from "react";
import { RequestScheduleTable } from "@/components/schedule/RequestScheduleTable";

export default function RequestSchedule() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Requests</h1>
      </div>
      <RequestScheduleTable />
    </div>
  );
}