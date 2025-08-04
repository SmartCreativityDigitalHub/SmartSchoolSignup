import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface PricingData {
  students: number;
  plan: "starter" | "standard";
  discount: number;
  total: number;
}

interface PricingCalculatorProps {
  onSignUp: (data: PricingData) => void;
}

const PricingCalculator = ({ onSignUp }: PricingCalculatorProps) => {
  const [students, setStudents] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "standard">("starter");

  const planPrices = {
    starter: 1000,
    standard: 2000,
  };

  const calculatePricing = () => {
    const basePrice = planPrices[selectedPlan] * students;
    const discount = students > 100 ? 0.2 : 0;
    const discountAmount = basePrice * discount;
    const total = basePrice - discountAmount;

    return {
      basePrice,
      discount: discountAmount,
      total,
      discountPercentage: discount * 100,
    };
  };

  const pricing = calculatePricing();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSignUp = () => {
    onSignUp({
      students,
      plan: selectedPlan,
      discount: pricing.discount,
      total: pricing.total,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-bg bg-clip-text text-transparent">
          SmartSchool Pricing Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Calculate your termly pricing based on student count and plan selection
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card className="shadow-elegant transition-smooth hover:shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl">Calculate Your Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Count Input */}
            <div className="space-y-2">
              <Label htmlFor="students" className="text-lg font-medium">
                Number of Students
              </Label>
              <Input
                id="students"
                type="number"
                placeholder="Enter number of students"
                value={students || ""}
                onChange={(e) => setStudents(parseInt(e.target.value) || 0)}
                className="text-lg h-12 transition-smooth focus:shadow-glow"
                min="0"
              />
            </div>

            {/* Plan Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Select Plan</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as "starter" | "standard")}
                className="grid gap-4 md:grid-cols-2"
              >
                {/* Starter Plan */}
                <div className="relative">
                  <RadioGroupItem
                    value="starter"
                    id="starter"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="starter"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-smooth hover:shadow-elegant"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-xl font-bold">Starter</div>
                      <div className="text-2xl font-bold text-primary">
                        ₦1,000
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per student/term
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Standard Plan */}
                <div className="relative">
                  <RadioGroupItem
                    value="standard"
                    id="standard"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="standard"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-smooth hover:shadow-elegant"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-xl font-bold">Standard</div>
                      <div className="text-2xl font-bold text-primary">
                        ₦2,000
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per student/term
                      </div>
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        Popular
                      </Badge>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card className="shadow-elegant transition-smooth">
          <CardHeader>
            <CardTitle className="text-2xl">Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span>Students:</span>
                <span className="font-semibold">{students.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg">
                <span>Plan:</span>
                <span className="font-semibold capitalize">{selectedPlan}</span>
              </div>

              <div className="flex justify-between items-center text-lg">
                <span>Base Amount:</span>
                <span className="font-semibold">{formatCurrency(pricing.basePrice)}</span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between items-center text-lg text-green-600">
                  <span>Discount (20%):</span>
                  <span className="font-semibold">-{formatCurrency(pricing.discount)}</span>
                </div>
              )}

              {students > 100 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    🎉 You qualify for a 20% discount for having more than 100 students!
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatCurrency(pricing.total)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSignUp}
              disabled={students === 0}
              className="w-full h-12 text-lg font-semibold gradient-bg hover:opacity-90 transition-smooth shadow-elegant hover:shadow-glow"
            >
              Sign Up Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingCalculator;