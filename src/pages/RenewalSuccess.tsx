import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

const RenewalSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="shadow-elegant">
            <CardHeader className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary">
                Subscription Renewal Successful
              </CardTitle>
              <CardDescription className="text-lg">
                Thank you for choosing SmartSchool. Your renewal has been received.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Your portal renewal will reflect within 24 hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>If it doesn't, please contact us.</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate("/")} 
                  className="w-full"
                >
                  Return to Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/contact")} 
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RenewalSuccess;