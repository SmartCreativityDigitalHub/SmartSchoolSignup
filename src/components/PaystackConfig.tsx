import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings } from "lucide-react";

const PaystackConfig = () => {
  const [config, setConfig] = useState({
    publicKey: localStorage.getItem("paystack_public_key") || "",
    secretKey: localStorage.getItem("paystack_secret_key") || "",
  });
  const [isVisible, setIsVisible] = useState(false);

  const handleSave = () => {
    localStorage.setItem("paystack_public_key", config.publicKey);
    localStorage.setItem("paystack_secret_key", config.secretKey);
    toast.success("Paystack configuration saved!");
    setIsVisible(false);
  };

  const handleClear = () => {
    localStorage.removeItem("paystack_public_key");
    localStorage.removeItem("paystack_secret_key");
    setConfig({ publicKey: "", secretKey: "" });
    toast.success("Paystack configuration cleared!");
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Paystack Config
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Paystack Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="publicKey">Public Key</Label>
            <Input
              id="publicKey"
              placeholder="pk_test_..."
              value={config.publicKey}
              onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={config.secretKey}
              onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Get your keys from{" "}
            <a
              href="https://dashboard.paystack.com/settings/developer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Paystack Dashboard
            </a>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="ghost" onClick={() => setIsVisible(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaystackConfig;