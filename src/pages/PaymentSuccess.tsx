import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the signup ID from localStorage as the process is complete
    localStorage.removeItem("signupId");
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center shadow-glow">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-bg bg-clip-text text-transparent">
            Registration Successful!
          </h1>
          <p className="text-xl text-muted-foreground">
            Thank you for choosing SmartSchool. Your registration has been received.
          </p>
        </div>

        {/* Status Card */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Confirmation Email Sent</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email to your registered email address with all the details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Account Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will contact you within 24-48 hours to set up your SmartSchool account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Training & Support</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll provide comprehensive training to help you get the most out of SmartSchool.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                📞 Need immediate assistance? Contact us at +234 906 869 1062
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ Your registration reference has been saved. Check your email for complete details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="px-8 py-3 text-lg transition-smooth hover:shadow-elegant"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => window.open("https://smartschool.sch.ng", "_blank")}
            className="px-8 py-3 text-lg gradient-bg hover:opacity-90 transition-smooth shadow-elegant hover:shadow-glow"
          >
            Visit SmartSchool
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;