import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, CreditCard, Star, DollarSign, FileText } from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [schoolSignups, setSchoolSignups] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [adminConfigs, setAdminConfigs] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [paymentEvidence, setPaymentEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configuration states
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [affiliateCommissionRate, setAffiliateCommissionRate] = useState("");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState("");

  // Plan management states
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    features: "",
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      navigate("/");
      return;
    }

    setUser(session.user);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [
        schoolSignupsResult,
        affiliatesResult,
        pricingPlansResult,
        configsResult,
        withdrawalsResult,
        evidenceResult,
      ] = await Promise.all([
        supabase.from("school_signups").select("*").order("created_at", { ascending: false }),
        supabase.from("affiliates").select("*, profiles(full_name, phone)").order("created_at", { ascending: false }),
        supabase.from("pricing_plans").select("*").order("sort_order"),
        supabase.from("admin_configs").select("*"),
        supabase.from("withdrawal_requests").select("*, affiliates(affiliate_code, profiles(full_name))").order("created_at", { ascending: false }),
        supabase.from("payment_evidence").select("*").order("created_at", { ascending: false }),
      ]);

      setSchoolSignups(schoolSignupsResult.data || []);
      setAffiliates(affiliatesResult.data || []);
      setPricingPlans(pricingPlansResult.data || []);
      setAdminConfigs(configsResult.data || []);
      setWithdrawalRequests(withdrawalsResult.data || []);
      setPaymentEvidence(evidenceResult.data || []);

      // Set config values
      const configs = configsResult.data || [];
      setPaystackPublicKey(configs.find(c => c.config_key === "paystack_public_key")?.config_value || "");
      setPaystackSecretKey(configs.find(c => c.config_key === "paystack_secret_key")?.config_value || "");
      setAffiliateCommissionRate(configs.find(c => c.config_key === "affiliate_commission_rate")?.config_value || "");
      setMinimumWithdrawal(configs.find(c => c.config_key === "minimum_withdrawal")?.config_value || "");
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, value: string) => {
    const { error } = await supabase
      .from("admin_configs")
      .upsert({ config_key: key, config_value: value });

    if (error) {
      toast.error("Failed to update configuration");
    } else {
      toast.success("Configuration updated");
    }
  };

  const updateAffiliateStatus = async (affiliateId: string, status: string) => {
    const { error } = await supabase
      .from("affiliates")
      .update({ status })
      .eq("id", affiliateId);

    if (error) {
      toast.error("Failed to update affiliate status");
    } else {
      toast.success("Affiliate status updated");
      loadData();
    }
  };

  const updateWithdrawalRequest = async (requestId: string, status: string, notes?: string) => {
    const { error } = await supabase
      .from("withdrawal_requests")
      .update({ status, admin_notes: notes })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to update withdrawal request");
    } else {
      toast.success("Withdrawal request updated");
      loadData();
    }
  };

  const createPricingPlan = async () => {
    if (!newPlan.name || !newPlan.price) {
      toast.error("Please fill in required fields");
      return;
    }

    const features = newPlan.features.split(',').map(f => f.trim()).filter(f => f);
    
    const { error } = await supabase
      .from("pricing_plans")
      .insert({
        name: newPlan.name,
        description: newPlan.description,
        price: parseFloat(newPlan.price),
        features: JSON.stringify(features),
      });

    if (error) {
      toast.error("Failed to create pricing plan");
    } else {
      toast.success("Pricing plan created");
      setNewPlan({ name: "", description: "", price: "", features: "" });
      loadData();
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("pricing_plans")
      .update({ is_active: !isActive })
      .eq("id", planId);

    if (error) {
      toast.error("Failed to update plan status");
    } else {
      toast.success("Plan status updated");
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Affiliates
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Payment Evidence
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Schools Tab */}
          <TabsContent value="schools">
            <Card>
              <CardHeader>
                <CardTitle>School Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schoolSignups.map((school) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium">{school.school_name}</TableCell>
                          <TableCell>{school.admin_name}</TableCell>
                          <TableCell>{school.email}</TableCell>
                          <TableCell>{school.selected_plan}</TableCell>
                          <TableCell>
                            <Badge variant={school.payment_status === "paid" ? "default" : "secondary"}>
                              {school.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>₦{school.total_amount?.toLocaleString()}</TableCell>
                          <TableCell>{new Date(school.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliates Tab */}
          <TabsContent value="affiliates">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Commission Rate</TableHead>
                        <TableHead>Total Earnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>{affiliate.profiles?.full_name}</TableCell>
                          <TableCell>{affiliate.affiliate_code}</TableCell>
                          <TableCell>{affiliate.commission_rate}%</TableCell>
                          <TableCell>₦{affiliate.total_earnings?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={affiliate.status === "approved" ? "default" : "secondary"}>
                              {affiliate.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={affiliate.status}
                              onValueChange={(value) => updateAffiliateStatus(affiliate.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Pricing Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Plan Name</Label>
                      <Input
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Price (₦)</Label>
                      <Input
                        type="number"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Features (comma-separated)</Label>
                    <Textarea
                      value={newPlan.features}
                      onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                      placeholder="Feature 1, Feature 2, Feature 3"
                    />
                  </div>
                  <Button onClick={createPricingPlan}>Create Plan</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Pricing Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pricingPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>₦{plan.price?.toLocaleString()}</TableCell>
                            <TableCell>
                              {JSON.parse(plan.features || "[]").join(", ")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={plan.is_active ? "default" : "secondary"}>
                                {plan.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                              >
                                {plan.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.affiliates?.profiles?.full_name}</TableCell>
                          <TableCell>{request.affiliates?.affiliate_code}</TableCell>
                          <TableCell>₦{request.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={request.status === "paid" ? "default" : "secondary"}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Withdrawal Request</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Status</Label>
                                    <Select
                                      defaultValue={request.status}
                                      onValueChange={(value) => updateWithdrawalRequest(request.id, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Admin Notes</Label>
                                    <Textarea
                                      defaultValue={request.admin_notes || ""}
                                      onBlur={(e) => updateWithdrawalRequest(request.id, request.status, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Evidence Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Ref</TableHead>
                        <TableHead>Evidence</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentEvidence.map((evidence) => (
                        <TableRow key={evidence.id}>
                          <TableCell>{evidence.school_name}</TableCell>
                          <TableCell>{evidence.email}</TableCell>
                          <TableCell>₦{evidence.amount_paid?.toLocaleString()}</TableCell>
                          <TableCell>{evidence.payment_ref}</TableCell>
                          <TableCell>
                            {evidence.evidence_file_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(evidence.evidence_file_url, '_blank')}
                              >
                                View
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>{new Date(evidence.payment_date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Paystack Public Key</Label>
                    <Input
                      type="password"
                      value={paystackPublicKey}
                      onChange={(e) => setPaystackPublicKey(e.target.value)}
                      onBlur={() => updateConfig("paystack_public_key", paystackPublicKey)}
                    />
                  </div>
                  <div>
                    <Label>Paystack Secret Key</Label>
                    <Input
                      type="password"
                      value={paystackSecretKey}
                      onChange={(e) => setPaystackSecretKey(e.target.value)}
                      onBlur={() => updateConfig("paystack_secret_key", paystackSecretKey)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default Commission Rate (%)</Label>
                    <Input
                      type="number"
                      value={affiliateCommissionRate}
                      onChange={(e) => setAffiliateCommissionRate(e.target.value)}
                      onBlur={() => updateConfig("affiliate_commission_rate", affiliateCommissionRate)}
                    />
                  </div>
                  <div>
                    <Label>Minimum Withdrawal Amount (₦)</Label>
                    <Input
                      type="number"
                      value={minimumWithdrawal}
                      onChange={(e) => setMinimumWithdrawal(e.target.value)}
                      onBlur={() => updateConfig("minimum_withdrawal", minimumWithdrawal)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;