import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Phone, MessageCircle, Facebook, Calendar, Shield, User as UserIcon, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ViewMemberDialogProps {
    user: Tables<'profiles'> | null;
    email?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Helper function to format role names
export function formatRoleName(role: string | null): string {
    if (!role) return "Unknown";
    const roleMap: Record<string, string> = {
        kr_admin: "KR Admin",
        kr_manager: "KR Manager",
        kr_igl: "KR IGL",
        kr_member: "KR Member",
    };
    return roleMap[role] || role;
}

export function ViewMemberDialog({ user, email, open, onOpenChange }: ViewMemberDialogProps) {
    if (!user) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const InfoRow = ({ icon: Icon, label, value, copyable = false }: { icon: React.ElementType; label: string; value: string | null; copyable?: boolean }) => (
        <div className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{value || "Not provided"}</span>
                {copyable && value && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(value, label)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Member Details</DialogTitle>
                    <DialogDescription>View detailed information about this member.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username || "Member"} />
                        <AvatarFallback className="text-2xl">{user.username?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">{user.full_name || user.username || "Unknown"}</h3>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <Badge variant="secondary" className="mt-2">{formatRoleName(user.role)}</Badge>
                    </div>
                </div>

                <div className="space-y-1">
                    <InfoRow icon={UserIcon} label="UID" value={user.id} copyable />
                    <InfoRow icon={Mail} label="Email" value={email || null} copyable />
                    <InfoRow icon={Phone} label="Phone" value={(user as any).phone_number} copyable />
                    <InfoRow icon={MessageCircle} label="Discord" value={(user as any).discord_id} copyable />
                    <InfoRow icon={Facebook} label="Facebook" value={(user as any).facebook_id} />
                    <InfoRow icon={Calendar} label="Member Since" value={user.created_at ? format(new Date(user.created_at), 'PPP') : null} />
                    <InfoRow icon={Calendar} label="Last Updated" value={user.updated_at ? format(new Date(user.updated_at), 'PPP') : null} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
