// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Tables } from "@/integrations/supabase/types";

// interface Props {
//   report: Tables<"user_reports"> | null;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (report: Tables<"user_reports">) => void;
// }

// export function EditReportDialog({ report, open, onOpenChange, onSave }: Props) {
//   const [formData, setFormData] = useState<Tables<"user_reports">>({
//     id: "",
//     subject: "",
//     description: "",
//     report_type: "",
//     status: "",
//     created_at: "",
//     updated_at: "",
//     user_id: "", // if this exists in your schema
//   });

//   useEffect(() => {
//     if (report) {
//       setFormData(report);
//     }
//   }, [report]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = () => {
//     if (report) {
//       onSave({ ...report, ...formData });
//     }
//   };

//   if (!report) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Edit Report</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div>
//             <Label>Subject</Label>
//             <Input name="subject" value={formData.subject} onChange={handleChange} />
//           </div>
//           <div>
//             <Label>Description</Label>
//             <Textarea name="description" value={formData.description} onChange={handleChange} />
//           </div>
//           <div>
//             <Label>Report Type</Label>
//             <Input name="report_type" value={formData.report_type} onChange={handleChange} />
//           </div>
//           <div>
//             <Label>Status</Label>
//             <Input name="status" value={formData.status} onChange={handleChange} />
//           </div>
//           <div>
//             <Label>Created At</Label>
//             <Input name="created_at" value={formData.created_at} readOnly />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit}>Save Changes</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

interface Props {
  report: Tables<"user_reports"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (report: Tables<"user_reports">) => void;
}

export function EditReportDialog({ report, open, onOpenChange, onSave }: Props) {
  const [formData, setFormData] = useState<Tables<"user_reports">>({
    id: "",
    subject: "",
    description: "",
    report_type: "",
    status: "",
    created_at: "",
    updated_at: "",
    user_id: "",
  });

  useEffect(() => {
    if (report) {
      setFormData(report);
    }
  }, [report]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = () => {
    if (report) {
      onSave({ ...report, ...formData });
    }
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input name="subject" value={formData.subject} onChange={handleChange} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div>
            <Label>Report Type</Label>
            <Input name="report_type" value={formData.report_type} onChange={handleChange} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Created At</Label>
            <Input name="created_at" value={formData.created_at} readOnly />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
