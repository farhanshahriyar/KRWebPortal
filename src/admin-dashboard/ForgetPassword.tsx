import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ForgetPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        setLoading(false)

        if (error) {
            toast.error("Failed to send reset link. Please try again.")
        } else {
            toast.success("Password reset link sent. Check your email.")
            setEmail("")
        }
    }
    console.log("Resetting password for:", email)
    console.log("Redirect URL:", `${window.location.origin}/reset-password`)


    return (
        <div className="flex px-2">
            <form
                onSubmit={handlePasswordReset}
                className="w-full max-w-sm p-6 space-y-6 rounded-xl shadow-lg bg-white dark:bg-zinc-900"
            >
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter members email to receive a reset link via their mail.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="members@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full text-white" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </Button>
            </form>
        </div>
    )
}
