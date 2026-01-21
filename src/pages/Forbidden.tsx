import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="mx-auto p-4 rounded-full bg-destructive/10">
                        <ShieldX className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
                    <CardDescription className="text-base">
                        You don't have permission to access this page.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact the KingsRock management team for assistance.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => navigate("/")}
                            className="w-full"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.href = "mailto:teamkingsrockgg23@gmail.com"}
                            className="w-full"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Contact KR Management
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
