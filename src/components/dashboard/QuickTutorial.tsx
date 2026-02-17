import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    ClipboardList,
    History,
    Bell,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Megaphone,
    Gamepad2,
    UserCog,
    Users,
    Shield,
    Settings,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

interface TutorialStep {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
}

// ─── Shared steps (both Members and Managers) ───────────────────────────────
const sharedSteps: TutorialStep[] = [
    {
        icon: LayoutDashboard,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-100",
        title: "Your Dashboard",
        description:
            "The Dashboard is your home base. It shows your attendance chart over the last 7, 14, or 30 days, your stat cards (attendance rate, remaining NOC requests, and remaining leave days), plus any recent updates about your performance.",
    },
    {
        icon: Calendar,
        iconColor: "text-green-500",
        iconBg: "bg-green-100",
        title: "Attendance",
        description:
            "Mark your daily attendance here. Select a date, choose your status (Present, Late, or Absent), optionally add notes, and submit. Your attendance history is also shown below so you can review past records anytime.",
    },
    {
        icon: FileText,
        iconColor: "text-purple-500",
        iconBg: "bg-purple-100",
        title: "NOC List",
        description:
            "NOC stands for No Objection Certificate. You can submit up to 4 NOC requests per year. Use this page to create new requests, track their status (pending, approved, or rejected), and view past submissions.",
    },
    {
        icon: ClipboardList,
        iconColor: "text-red-500",
        iconBg: "bg-red-100",
        title: "Leave Request",
        description:
            "Need time off? Submit a leave request here. You can request up to 7 leave days per month. Select multiple dates on the calendar, provide a reason and message, then submit. You can also edit or delete pending requests.",
    },
    {
        icon: History,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-100",
        title: "Update Logs",
        description:
            "Stay in the loop! Update Logs show the latest announcements, changes, and news posted by the management team. Check here regularly so you never miss an important update.",
    },
    {
        icon: Megaphone,
        iconColor: "text-pink-500",
        iconBg: "bg-pink-100",
        title: "Announcements",
        description:
            "View important announcements from the management team. Pinned announcements appear at the top. Click on any announcement to read its full content — your view is automatically recorded so management knows you've seen it.",
    },
    {
        icon: Gamepad2,
        iconColor: "text-violet-500",
        iconBg: "bg-violet-100",
        title: "Valorant Stats",
        description:
            "Check your Valorant performance stats! This page shows your current rank, peak rank, competitive overview, and recent match history — all synced from your tracker profile. Great for tracking your progress over time.",
    },
    {
        icon: UserCog,
        iconColor: "text-indigo-500",
        iconBg: "bg-indigo-100",
        title: "Profile & Settings",
        description:
            "Update your profile photo, display name, and contact details from the Profile page. Head to Settings to manage your account preferences, privacy options, and submit reports if needed.",
    },
    {
        icon: Bell,
        iconColor: "text-cyan-500",
        iconBg: "bg-cyan-100",
        title: "Sidebar & Notifications",
        description:
            "Use the sidebar on the left to navigate between pages. The 🔔 bell icon in the top bar shows real-time notifications for your attendance, leave, and NOC status updates. Click the sun/moon icon to switch between light and dark themes.",
    },
];

// ─── KR Member tutorial ─────────────────────────────────────────────────────
const memberSteps: TutorialStep[] = [
    {
        icon: Sparkles,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-100",
        title: "Welcome to KingsRock Portal! 🎉",
        description:
            "This quick tutorial will walk you through the main features of your member dashboard. You'll learn how to navigate and make the most of every tool available to you. Let's get started!",
    },
    ...sharedSteps,
];

// ─── KR Manager tutorial ────────────────────────────────────────────────────
const managerSteps: TutorialStep[] = [
    {
        icon: Sparkles,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-100",
        title: "Welcome, Manager! 🎉",
        description:
            "As a KR Manager, you have access to everything a member can do plus additional management tools. This tutorial will walk you through all your capabilities — let's dive in!",
    },
    ...sharedSteps,
    {
        icon: Users,
        iconColor: "text-teal-500",
        iconBg: "bg-teal-100",
        title: "Manage Members",
        description:
            "View and manage all KingsRock members from this page. You can see each member's profile details, role, and contact information. Use the View button to inspect a member's full profile including their phone number, Discord ID, and Facebook profile.",
    },
    {
        icon: Calendar,
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-100",
        title: "Manage Attendance",
        description:
            "Review the attendance records of all members. Filter by date range, check who was present, late, or absent, and monitor attendance patterns across the team. This helps you keep track of overall team activity.",
    },
    {
        icon: Shield,
        iconColor: "text-sky-500",
        iconBg: "bg-sky-100",
        title: "Your Management Role",
        description:
            "As a Manager, you can approve or reject NOC and leave requests from team members directly from each list page. Keep an eye on pending requests and respond promptly to keep operations running smoothly.",
    },
    {
        icon: Settings,
        iconColor: "text-slate-500",
        iconBg: "bg-slate-100",
        title: "You're All Set! 🚀",
        description:
            "That's everything you need to know! Remember — you can always replay this tutorial from the dashboard. If you have any questions reach out to your KR Admin. Now go manage your team like a pro!",
    },
];

// Per-role storage keys so each role gets its own tutorial
const getTutorialKey = (role: string) => `kr_tutorial_completed_${role}`;

export function QuickTutorial() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const { role } = useRole();

    // Select steps based on current role
    const steps = useMemo(() => {
        if (role === "kr_manager") return managerSteps;
        return memberSteps;
    }, [role]);

    // Auto-open on first visit for non-admin users
    useEffect(() => {
        if (role && role !== "kr_admin") {
            const completed = localStorage.getItem(getTutorialKey(role));
            if (!completed) {
                const timer = setTimeout(() => setIsOpen(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [role]);

    const handleClose = () => {
        setIsOpen(false);
        setCurrentStep(0);
        if (role) localStorage.setItem(getTutorialKey(role), "true");
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleOpen = () => {
        setCurrentStep(0);
        setIsOpen(true);
    };

    // Attach open function to the window for external triggering
    useEffect(() => {
        (window as any).__openQuickTutorial = handleOpen;
        return () => {
            delete (window as any).__openQuickTutorial;
        };
    }, []);

    // Don't render for admins
    if (role === "kr_admin") return null;

    const step = steps[currentStep];
    const StepIcon = step.icon;
    const isLastStep = currentStep === steps.length - 1;
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                {/* Progress bar */}
                <div className="h-1.5 bg-muted w-full">
                    <div
                        className="h-full bg-red-500 transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-6 pt-4">
                    {/* Step counter */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-muted-foreground">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
                            onClick={handleClose}
                        >
                            Skip Tutorial
                        </Button>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div
                            className={`h-16 w-16 rounded-2xl ${step.iconBg} flex items-center justify-center`}
                        >
                            <StepIcon className={`h-8 w-8 ${step.iconColor}`} />
                        </div>
                    </div>

                    <DialogHeader className="text-center space-y-3">
                        <DialogTitle className="text-xl">{step.title}</DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step dots */}
                    <div className="flex justify-center gap-1.5 my-5">
                        {steps.map((_, i) => (
                            <button
                                key={i}
                                className={`h-2 rounded-full transition-all duration-200 ${i === currentStep
                                    ? "w-6 bg-red-500"
                                    : i < currentStep
                                        ? "w-2 bg-red-300"
                                        : "w-2 bg-muted-foreground/20"
                                    }`}
                                onClick={() => setCurrentStep(i)}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleBack}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        )}
                        <Button
                            className={`flex-1 bg-red-600 hover:bg-red-700 text-white ${currentStep === 0 ? "w-full" : ""
                                }`}
                            onClick={handleNext}
                        >
                            {isLastStep ? (
                                <>
                                    <GraduationCap className="h-4 w-4 mr-1" />
                                    Finish
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
