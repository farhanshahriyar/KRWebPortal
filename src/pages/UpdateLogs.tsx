import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const updates = [
  // {
  //   version: "1.0.0",
  //   date: "2024-01-27",
  //   title: "Initial Release",
  //   description: "First release of KingsRock Portal",
  //   changes: [
  //     { type: "feature", text: "Added authentication system" },
  //     { type: "feature", text: "Implemented member management" },
  //     { type: "improvement", text: "Enhanced UI/UX design" },
  //   ],
  // },
  {
    version: "0.9.0",
    date: "2025-04-17",
    title: "Beta Release",
    description: "Beta testing phase begins, lets see whats in this version",
    changes: [
      { type: "feature", text: "Added authentication system" },
      { type: "improvement", text: "Enhanced UI/UX design" },
      { type: "bug fix", text: "Fixed a bug in the attendence graph" },
      { type: "feature", text: "Added Noc, Leave request features" },
      { type: "feature", text: "Added Attendence feature" },
    ],
  },
];

const UpdateLogs = () => {
  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Update Logs</h1>
        <p className="text-muted-foreground mt-2">
          Track all changes and updates to the KingsRock Portal
        </p>
      </div>

      <div className="space-y-8">
        {updates.map((update, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    v{update.version} - {update.title}
                  </CardTitle>
                  <CardDescription>{update.date}</CardDescription>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">{update.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {update.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="flex items-start gap-2">
                    <Badge variant={change.type === 'feature' ? 'default' : change.type === 'improvement' ? 'secondary' : 'destructive'}>
                      {change.type}
                    </Badge>
                    <span>{change.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpdateLogs;