import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Gamepad2,
    CalendarDays,
    StickyNote,
    Shield,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { mockMembers } from "@/components/team/mockData";
import { TeamMember, MemberStatus, InGameRole } from "@/components/team/types";
import { mockPlayerStats } from "@/components/team/mockData";
import { toast } from "sonner";

const statusTab: { value: MemberStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "sub", label: "Sub" },
    { value: "trial", label: "Trial" },
];

const roleOptions: InGameRole[] = ["Duelist", "Initiator", "Controller", "Sentinel", "IGL", "Flex"];

const statusColors: Record<MemberStatus, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    sub: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    trial: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const roleIcons: Record<InGameRole, string> = {
    Duelist: "⚔️",
    Initiator: "🎯",
    Controller: "🌫️",
    Sentinel: "🛡️",
    IGL: "📡",
    Flex: "🔄",
};

export default function TeamRoster() {
    const { canAccess, role } = useRole();
    const [members, setMembers] = useState<TeamMember[]>(mockMembers);
    const [activeTab, setActiveTab] = useState<MemberStatus>("active");
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

    // Form state
    const [formIgn, setFormIgn] = useState("");
    const [formRealName, setFormRealName] = useState("");
    const [formRole, setFormRole] = useState<InGameRole>("Duelist");
    const [formStatus, setFormStatus] = useState<MemberStatus>("active");
    const [formAgentPool, setFormAgentPool] = useState("");
    const [formNotes, setFormNotes] = useState("");

    const filteredMembers = members.filter((m) => m.status === activeTab);

    const openProfile = (member: TeamMember) => {
        setSelectedMember(member);
        setProfileOpen(true);
    };

    const openAddForm = () => {
        setEditingMember(null);
        setFormIgn("");
        setFormRealName("");
        setFormRole("Duelist");
        setFormStatus("active");
        setFormAgentPool("");
        setFormNotes("");
        setFormOpen(true);
    };

    const openEditForm = (member: TeamMember) => {
        setEditingMember(member);
        setFormIgn(member.ign);
        setFormRealName(member.realName || "");
        setFormRole(member.role);
        setFormStatus(member.status);
        setFormAgentPool(member.agentPool.join(", "));
        setFormNotes(member.internalNotes || "");
        setFormOpen(true);
    };

    const handleSave = () => {
        const agentPoolArr = formAgentPool
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);

        if (!formIgn.trim()) {
            toast.error("IGN is required");
            return;
        }

        if (editingMember) {
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === editingMember.id
                        ? {
                            ...m,
                            ign: formIgn,
                            realName: formRealName || undefined,
                            role: formRole,
                            status: formStatus,
                            agentPool: agentPoolArr,
                            internalNotes: formNotes || undefined,
                        }
                        : m
                )
            );
            toast.success("Member updated");
        } else {
            const newMember: TeamMember = {
                id: `m${Date.now()}`,
                ign: formIgn,
                realName: formRealName || undefined,
                role: formRole,
                status: formStatus,
                agentPool: agentPoolArr,
                joinDate: new Date().toISOString().split("T")[0],
                internalNotes: formNotes || undefined,
            };
            setMembers((prev) => [...prev, newMember]);
            toast.success("Member added");
        }
        setFormOpen(false);
    };

    const confirmDelete = (member: TeamMember) => {
        setMemberToDelete(member);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = () => {
        if (memberToDelete) {
            setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
            toast.success("Member removed");
            setDeleteConfirmOpen(false);
            setMemberToDelete(null);
        }
    };

    // Get player stats for profile
    const getPlayerStats = (memberId: string) => {
        return mockPlayerStats.find((s) => s.memberId === memberId);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Roster</h1>
                        <p className="text-sm text-muted-foreground">
                            {members.length} total members
                        </p>
                    </div>
                </div>
                {canAccess("team.roster.manage") && (
                    <Button onClick={openAddForm} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Member
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MemberStatus)}>
                <TabsList>
                    {statusTab.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                            {tab.label}
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {members.filter((m) => m.status === tab.value).length}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {statusTab.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        {filteredMembers.length === 0 ? (
                            <Card className="p-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-semibold">No {tab.label} Members</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        There are no {tab.label.toLowerCase()} members on the roster.
                                    </p>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredMembers.map((member) => (
                                    <Card
                                        key={member.id}
                                        className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
                                        onClick={() => openProfile(member)}
                                    >
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg">
                                                        {roleIcons[member.role]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold group-hover:text-primary transition-colors">
                                                            {member.ign}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={statusColors[member.status]}
                                                >
                                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                                </Badge>
                                            </div>

                                            {/* Agent Pool */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {member.agentPool.map((agent) => (
                                                    <Badge
                                                        key={agent}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {agent}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Actions for manager */}
                                            {canAccess("team.roster.manage") && (
                                                <div className="flex gap-2 pt-1 border-t">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 h-8 text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditForm(member);
                                                        }}
                                                    >
                                                        <Pencil className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(member);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            {/* Player Profile Dialog */}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-xl">{roleIcons[selectedMember?.role || "Duelist"]}</span>
                            {selectedMember?.ign}
                        </DialogTitle>
                        <DialogDescription>Player profile and recent performance</DialogDescription>
                    </DialogHeader>

                    {selectedMember && (
                        <div className="space-y-4">
                            {/* Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Role:</span>
                                    <span className="font-medium">{selectedMember.role}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Joined:</span>
                                    <span className="font-medium">
                                        {new Date(selectedMember.joinDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Agent Pool */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Gamepad2 className="h-3.5 w-3.5" />
                                    Agent Pool
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedMember.agentPool.map((agent) => (
                                        <Badge key={agent} variant="secondary">
                                            {agent}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Last 5 Match Performance */}
                            {(() => {
                                const stats = getPlayerStats(selectedMember.id);
                                if (!stats) return null;
                                return (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Last 5 Matches
                                        </p>
                                        <div className="space-y-1.5">
                                            {stats.matchHistory.slice(0, 5).map((match) => (
                                                <div
                                                    key={match.matchId}
                                                    className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50 text-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                match.won
                                                                    ? "border-emerald-500 text-emerald-600 text-[10px]"
                                                                    : "border-red-500 text-red-600 text-[10px]"
                                                            }
                                                        >
                                                            {match.won ? "W" : "L"}
                                                        </Badge>
                                                        <span className="text-muted-foreground">
                                                            vs {match.opponent}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3 text-xs">
                                                        <span>
                                                            <span className="text-muted-foreground">K/D/A:</span>{" "}
                                                            <span className="font-medium">
                                                                {match.kills}/{match.deaths}/{match.assists}
                                                            </span>
                                                        </span>
                                                        <span>
                                                            <span className="text-muted-foreground">ACS:</span>{" "}
                                                            <span className="font-medium">{match.acs}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Internal Notes — Manager/Admin only */}
                            {(role === "kr_manager" || role === "kr_admin") && selectedMember.internalNotes && (
                                <div className="border-t pt-3">
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                                        <StickyNote className="h-3.5 w-3.5" />
                                        Internal Notes
                                    </p>
                                    <p className="text-sm bg-muted/50 p-3 rounded-md">
                                        {selectedMember.internalNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add/Edit Member Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMember ? "Edit Member" : "Add New Member"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMember
                                ? "Update the member's information."
                                : "Fill in the details to add a new team member."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ign">IGN *</Label>
                            <Input
                                id="ign"
                                value={formIgn}
                                onChange={(e) => setFormIgn(e.target.value)}
                                placeholder="e.g. KR Shadow"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="realName">Real Name</Label>
                            <Input
                                id="realName"
                                value={formRealName}
                                onChange={(e) => setFormRealName(e.target.value)}
                                placeholder="e.g. John"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={formRole} onValueChange={(v) => setFormRole(v as InGameRole)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {roleIcons[r]} {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as MemberStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusTab.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agentPool">Agent Pool (comma-separated)</Label>
                            <Input
                                id="agentPool"
                                value={formAgentPool}
                                onChange={(e) => setFormAgentPool(e.target.value)}
                                placeholder="e.g. Jett, Raze, Neon"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Internal Notes</Label>
                            <Textarea
                                id="notes"
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                placeholder="Notes visible only to managers and admins..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingMember ? "Save Changes" : "Add Member"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remove Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove{" "}
                            <span className="font-semibold">{memberToDelete?.ign}</span> from the
                            roster? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
