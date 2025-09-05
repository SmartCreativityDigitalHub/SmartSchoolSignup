import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const features = [
  { name: "Unified Login (All Users)", starter: true, standard: true },
  { name: "Dashboard Overview", starter: true, standard: true },
  { name: "Student, Parent, Teacher Portals", starter: true, standard: true },
  { name: "Class, Section, Subject Management", starter: true, standard: true },
  { name: "Assignment Upload", starter: true, standard: true },
  { name: "Timetable / Class Routine", starter: true, standard: true },
  { name: "Results Management", starter: true, standard: true },
  { name: "Attendance (Student/Teacher/Others)", starter: true, standard: true },
  { name: "Internal Messaging", starter: true, standard: true },
  { name: "Digital Library", starter: true, standard: true },
  { name: "Lesson Note", starter: true, standard: true },
  { name: "Email / SMS", starter: false, standard: true },
  { name: "Media Sharing", starter: false, standard: true },
  { name: "School Website", starter: false, standard: true },
  { name: "Online Admission Portal", starter: false, standard: true },
  { name: "Digital ID Cards", starter: false, standard: true },
  { name: "Mark Attendance with ID Card", starter: false, standard: true },
  { name: "Online Payment Integration", starter: false, standard: true },
  { name: "Bulk SMS (1,000 Termly Units)", starter: false, standard: true },
  { name: "Certificate Generation", starter: false, standard: true },
  { name: "Event Management", starter: false, standard: true },
  { name: "Hostel Management", starter: false, standard: true },
  { name: "Inventory System", starter: false, standard: true },
  { name: "Library Management", starter: false, standard: true },
  { name: "Live Class (Zoom/Meet)", starter: false, standard: true },
  { name: "Multi-Class Support", starter: false, standard: true },
  { name: "CBT / Online Exams", starter: false, standard: true },
  { name: "Transport Management", starter: false, standard: true },
];

const FeatureComparison = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold gradient-bg bg-clip-text text-transparent">
          Feature Comparison
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Compare what's included in each plan to make the best choice for your school
        </p>
      </div>

      {/* Feature Comparison Table */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Features by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2 font-semibold">Feature</th>
                  <th className="text-center py-4 px-2">
                    <div className="space-y-2">
                      <div className="text-lg font-bold">Starter</div>
                      <Badge variant="outline" className="text-primary border-primary">
                        ₦1,000/student
                      </Badge>
                    </div>
                  </th>
                  <th className="text-center py-4 px-2">
                    <div className="space-y-2">
                      <div className="text-lg font-bold">Standard</div>
                      <Badge className="gradient-bg text-white">
                        ₦2,000/student
                      </Badge>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-muted/50 transition-smooth"
                  >
                    <td className="py-4 px-2 font-medium">{feature.name}</td>
                    <td className="py-4 px-2 text-center">
                      {feature.starter ? (
                        <Check className="h-6 w-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-2 text-center">
                      {feature.standard ? (
                        <Check className="h-6 w-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Plan Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-muted shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl">Starter Plan Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Perfect for small schools getting started
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Core management features included
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Student, parent, and teacher portals
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Basic attendance and results management
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl">Standard Plan Highlights</CardTitle>
            <Badge className="w-fit gradient-bg text-white">Most Popular</Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Everything in Starter plan, plus:
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Advanced communication tools (Email/SMS)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Digital ID cards and online payments
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Complete school management suite
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureComparison;