import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingIndicator } from "@/components/ui/loading-indicator";


export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [reportType, setReportType] = useState("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const navigate = useNavigate();

  // Report form using react-hook-form
  const reportForm = useForm({
    defaultValues: {
      reportType: "bug",
      subject: "",
      description: ""
    }
  });
  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      getUserReports();
    }
  }, [profile]);

  const getProfile = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const {
        data,
        error
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      setProfile(data);
      setDisplayName(data.username || "");
      setAvatarUrl(data.avatar_url);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getUserReports = async () => {
    try {
      setLoadingReports(true);
      const {
        data,
        error
      } = await supabase.from("user_reports").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setUserReports(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch reports: " + error.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;
      const {
        error: uploadError
      } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const {
        error: updateError
      } = await supabase.from("profiles").update({
        avatar_url: publicUrl
      }).eq("id", profile.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameUpdate = async () => {
    try {
      setLoading(true);
      const {
        error
      } = await supabase.from("profiles").update({
        username: displayName
      }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Display name updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setLoading(true);

      // Validate passwords
      if (!newPassword || !confirmPassword) {
        toast.error("Please fill in both password fields");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (values: any) => {
    try {
      setSubmittingReport(true);
      const {
        data: userData
      } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("You must be logged in to submit a report");
        return;
      }
      const {
        error
      } = await supabase.from("user_reports").insert({
        user_id: userData.user.id,
        report_type: values.reportType,
        subject: values.subject,
        description: values.description
      });
      if (error) throw error;
      toast.success("Report submitted successfully!");
      reportForm.reset({
        reportType: "bug",
        subject: "",
        description: ""
      });

      // Refresh the reports list
      getUserReports();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in-progress":
        return <Info className="h-4 w-4 text-primary" />;
      case "rejected":
        return <Info className="h-4 w-4 text-sky-700" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      case "in-progress":
        return "bg-sky-700/10 text-sky-700 border-sky-700/20";
      case "rejected":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return <div className="max-w-4xl mx-auto space-y-6">

    <Tabs defaultValue="account" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="account">Account Change</TabsTrigger>
        <TabsTrigger value="privacy">Privacy Center</TabsTrigger>
        <TabsTrigger value="report">Report Center</TabsTrigger>
      </TabsList>

      {/* Account tab */}
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your account information here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback>
                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Input type="file" accept="image/*" onChange={handleAvatarChange} disabled={loading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your display name" disabled={loading} />
            </div>
            <Button onClick={handleDisplayNameUpdate} disabled={loading} className="text-zinc-50">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy tab */}
      <TabsContent value="privacy">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Manage your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" disabled={loading} className="pr-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" disabled={loading} className="pr-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <Button onClick={handlePasswordUpdate} disabled={loading || !newPassword || !confirmPassword} className="bg-red-500 hover:bg-red-600 text-zinc-50">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Report tab */}
      <TabsContent value="report">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Report</CardTitle>
              <CardDescription>Report issues, bugs, or suggestions here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...reportForm}>
                <form onSubmit={reportForm.handleSubmit(handleReportSubmit)} className="space-y-4">
                  <FormField control={reportForm.control} name="reportType" render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submittingReport}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="account">Account Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                  <FormField control={reportForm.control} name="subject" rules={{
                    required: "Subject is required"
                  }} render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of your report" {...field} disabled={submittingReport} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                  <FormField control={reportForm.control} name="description" rules={{
                    required: "Description is required"
                  }} render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide details about your report" className="min-h-32" {...field} disabled={submittingReport} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                  <Button type="submit" disabled={submittingReport} className="w-full text-slate-50">
                    {submittingReport ? <>
                      <LoadingIndicator size="sm" />
                      Submitting...
                    </> : "Submit Report"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Reports</CardTitle>
              <CardDescription>View the status of your submitted reports.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReports ? <div className="flex justify-center py-8">
                <LoadingIndicator />
              </div> : userReports.length > 0 ? <div className="space-y-4">
                {userReports.map(report => <div key={report.id} className="border rounded-md p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{report.subject}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(report.status)} flex items-center gap-1`}>
                      {getStatusIcon(report.status)}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm">{report.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    Type: {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                  </div>
                </div>)}
              </div> : <div className="text-center py-8 text-muted-foreground">
                <p>You haven't submitted any reports yet.</p>
              </div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>;
}
