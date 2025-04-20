import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
export default function Schedule() {
  const [open, setOpen] = useState(false);
  return <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="text-zinc-50">
              <Plus className="w-4 h-4 mr-2" />
              Make Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ScheduleForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <ScheduleTable />
    </div>;
}