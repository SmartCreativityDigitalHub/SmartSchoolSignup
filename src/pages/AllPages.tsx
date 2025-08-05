import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Home, FileText, CreditCard, DollarSign, MessageSquare, RefreshCw, BarChart3, Users } from "lucide-react";

const AllPages = () => {
  const pages = [
    {
      name: "Home",
      path: "/",
      description: "Main landing page",
      icon: Home
    },
    {
      name: "Sign Up",
      path: "/sign-up",
      description: "School registration form",
      icon: Users
    },
    {
      name: "Contact Us",
      path: "/contact",
      description: "Contact support form",
      icon: MessageSquare
    },
    {
      name: "Renew Subscription",
      path: "/renew",
      description: "Subscription renewal form",
      icon: RefreshCw
    },
    {
      name: "Offline Payment",
      path: "/offline-payment",
      description: "Bank transfer payment evidence",
      icon: DollarSign
    },
    {
      name: "Payment Success",
      path: "/payment-success",
      description: "Payment confirmation page",
      icon: CreditCard
    },
    {
      name: "Renewal Success",
      path: "/renewal-success",
      description: "Renewal confirmation page",
      icon: CreditCard
    },
    {
      name: "Admin Dashboard",
      path: "/admin",
      description: "Administrative dashboard",
      icon: BarChart3
    },
    {
      name: "Report",
      path: "/report",
      description: "Data reports and analytics",
      icon: FileText
    }
  ];

  const openPage = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">All Pages Directory</h1>
          <p className="text-lg text-muted-foreground">
            Quick access to all available pages in the system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => {
            const IconComponent = page.icon;
            return (
              <Card key={page.path} className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    {page.name}
                  </CardTitle>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => openPage(page.path)} 
                    className="w-full"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Page
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllPages;