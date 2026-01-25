import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { UpdateLog, UpdateLogChange } from "@/types/update-logs";

const changeSchema = z.object({
    type: z.enum(["feature", "improvement", "fix", "bug fix"]),
    text: z.string().min(1, "Change description is required"),
});

const formSchema = z.object({
    version: z.string().min(1, "Version is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().optional(),
    changes: z.array(changeSchema).min(1, "At least one change is required"),
});

interface UpdateLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    logToEdit?: UpdateLog | null;
    onSuccess: () => void;
}

export function UpdateLogDialog({ open, onOpenChange, logToEdit, onSuccess }: UpdateLogDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            version: "",
            title: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            changes: [{ type: "feature", text: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "changes",
    });

    useEffect(() => {
        if (logToEdit) {
            form.reset({
                version: logToEdit.version,
                title: logToEdit.title,
                description: logToEdit.description,
                date: logToEdit.date,
                changes: logToEdit.changes,
            });
        } else {
            form.reset({
                version: "",
                title: "",
                description: "",
                date: new Date().toISOString().split('T')[0],
                changes: [{ type: "feature", text: "" }],
            });
        }
    }, [logToEdit, open, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        const payload = {
            version: values.version,
            title: values.title,
            description: values.description,
            date: values.date || new Date().toISOString().split('T')[0],
            changes: values.changes,
        };

        let error;
        if (logToEdit) {
            const { error: updateError } = await supabase
                .from("update_logs")
                .update(payload)
                .eq("id", logToEdit.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("update_logs")
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to ${logToEdit ? "update" : "create"} log.`,
            });
        } else {
            toast({
                title: "Success",
                description: `Log ${logToEdit ? "updated" : "created"} successfully.`,
            });
            onSuccess();
            onOpenChange(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{logToEdit ? "Edit Update Log" : "Add Update Log"}</DialogTitle>
                    <DialogDescription>
                        {logToEdit ? "Edit existing" : "Create a new"} update log entry for the KingsRock Portal
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="version"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Version</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1.0.0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Update title (e.g. Beta Release)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of the update"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel>Changes</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ type: "feature", text: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Change
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`changes.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="w-[150px]">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="feature">Feature</SelectItem>
                                                        <SelectItem value="improvement">Improvement</SelectItem>
                                                        <SelectItem value="fix">Fix</SelectItem>
                                                        <SelectItem value="bug fix">Bug Fix</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`changes.${index}.text`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input placeholder="Change description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {logToEdit ? "Update Log" : "Create Log"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
