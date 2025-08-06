import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, CreditCard, FileText } from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [schoolSignups, setSchoolSignups] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [adminConfigs, setAdminConfigs] = useState<any[]>([]);
  const [paymentEvidence, setPaymentEvidence] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [referralTracking, setReferralTracking] = useState<any[]>([]);
  const [affiliateWithdrawals, setAffiliateWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configuration states
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");

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
      navigate("/admin-login");
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
        pricingPlansResult,
        configsResult,
        evidenceResult,
        affiliatesResult,
        referralTrackingResult,
        affiliateWithdrawalsResult,
      ] = await Promise.all([
        supabase.from("school_signups").select("*").order("created_at", { ascending: false }),
        supabase.from("pricing_plans").select("*").order("sort_order"),
        supabase.from("admin_configs").select("*"),
        supabase.from("payment_evidence").select("*").order("created_at", { ascending: false }),
        supabase.from("affiliate_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("referral_tracking").select(`
          *,
          affiliate_profiles (username, full_name)
        `).order("visited_at", { ascending: false }),
        supabase.from("affiliate_withdrawals").select(`
          *,
          affiliate_profiles (username, full_name)
        `).order("created_at", { ascending: false }),
      ]);

      setSchoolSignups(schoolSignupsResult.data || []);
      setPricingPlans(pricingPlansResult.data || []);
      setAdminConfigs(configsResult.data || []);
      setPaymentEvidence(evidenceResult.data || []);
      setAffiliates(affiliatesResult.data || []);
      setReferralTracking(referralTrackingResult.data || []);
      setAffiliateWithdrawals(affiliateWithdrawalsResult.data || []);

      // Set config values
      const configs = configsResult.data || [];
      setPaystackPublicKey(configs.find(c => c.config_key === "paystack_public_key")?.config_value || "");
      setPaystackSecretKey(configs.find(c => c.config_key === "paystack_secret_key")?.config_value || "");
      setSmtpHost(configs.find(c => c.config_key === "smtp_host")?.config_value || "");
      setSmtpPort(configs.find(c => c.config_key === "smtp_port")?.config_value || "");
      setSmtpUser(configs.find(c => c.config_key === "smtp_user")?.config_value || "");
      setSmtpPassword(configs.find(c => c.config_key === "smtp_password")?.config_value || "");
      setSmtpFromEmail(configs.find(c => c.config_key === "smtp_from_email")?.config_value || "");
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

  const toggleAffiliateStatus = async (affiliateId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("affiliate_profiles")
      .update({ is_active: !isActive })
      .eq("id", affiliateId);

    if (error) {
      toast.error("Failed to update affiliate status");
    } else {
      toast.success("Affiliate status updated");
      loadData();
    }
  };

  const processWithdrawal = async (withdrawalId: string, status: string, notes?: string) => {
    const { error } = await supabase
      .from("affiliate_withdrawals")
      .update({ 
        status, 
        notes,
        processed_at: status === 'approved' ? new Date().toISOString() : null 
      })
      .eq("id", withdrawalId);

    if (error) {
      toast.error("Failed to process withdrawal");
    } else {
      toast.success(`Withdrawal ${status}`);
      loadData();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Payment Evidence
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Affiliates
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Signups</h3>
                  <p className="text-2xl font-bold">{schoolSignups.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Pending Payments</h3>
                  <p className="text-2xl font-bold">{schoolSignups.filter(s => s.payment_status === 'pending').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Completed Payments</h3>
                  <p className="text-2xl font-bold">{schoolSignups.filter(s => s.payment_status === 'completed').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Affiliates</h3>
                  <p className="text-2xl font-bold">{affiliates.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Active Affiliates</h3>
                  <p className="text-2xl font-bold">{affiliates.filter(a => a.is_active).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Referrals</h3>
                  <p className="text-2xl font-bold">{referralTracking.length}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Evidence</TableHead>
                        <TableHead>Submitted Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentEvidence.map((evidence) => (
                        <TableRow key={evidence.id}>
                          <TableCell className="font-medium">{evidence.school_name}</TableCell>
                          <TableCell>{evidence.email}</TableCell>
                          <TableCell>₦{evidence.amount_paid?.toLocaleString()}</TableCell>
                          <TableCell>{evidence.payment_ref}</TableCell>
                          <TableCell>{new Date(evidence.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {evidence.evidence_file_url ? (
                              <a 
                                href={evidence.evidence_file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View File
                              </a>
                            ) : (
                              "No file"
                            )}
                          </TableCell>
                          <TableCell>{new Date(evidence.created_at).toLocaleDateString()}</TableCell>
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
            <div className="space-y-6">
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
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Total Earnings</TableHead>
                          <TableHead>Referrals</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {affiliates.map((affiliate) => (
                          <TableRow key={affiliate.id}>
                            <TableCell className="font-medium">{affiliate.full_name}</TableCell>
                            <TableCell>{affiliate.username}</TableCell>
                            <TableCell>{affiliate.email}</TableCell>
                            <TableCell>{affiliate.phone_number}</TableCell>
                            <TableCell>{formatCurrency(affiliate.total_earnings)}</TableCell>
                            <TableCell>{affiliate.total_referrals}</TableCell>
                            <TableCell>
                              <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                                {affiliate.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAffiliateStatus(affiliate.id, affiliate.is_active)}
                              >
                                {affiliate.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

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
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {affiliateWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell className="font-medium">
                              {withdrawal.affiliate_profiles?.full_name || 'Unknown'}
                            </TableCell>
                            <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  withdrawal.status === 'approved' ? 'default' : 
                                  withdrawal.status === 'rejected' ? 'destructive' : 
                                  'secondary'
                                }
                              >
                                {withdrawal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(withdrawal.requested_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {withdrawal.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => processWithdrawal(withdrawal.id, 'approved')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => processWithdrawal(withdrawal.id, 'rejected', 'Rejected by admin')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referral Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Affiliate</TableHead>
                          <TableHead>Referral Code</TableHead>
                          <TableHead>Converted</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referralTracking.slice(0, 20).map((tracking) => (
                          <TableRow key={tracking.id}>
                            <TableCell>{new Date(tracking.visited_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {tracking.affiliate_profiles?.full_name || 'Unknown'}
                            </TableCell>
                            <TableCell>{tracking.referral_code}</TableCell>
                            <TableCell>
                              <Badge variant={tracking.converted ? "default" : "secondary"}>
                                {tracking.converted ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tracking.converted ? formatCurrency(tracking.commission_earned) : "₦0"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  tracking.commission_status === 'paid' ? 'default' : 
                                  tracking.commission_status === 'approved' ? 'secondary' : 
                                  'outline'
                                }
                              >
                                {tracking.commission_status}
                              </Badge>
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

          {/* Configuration Tab */}
          <TabsContent value="config">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paystack Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Paystack Public Key</Label>
                    <Input
                      value={paystackPublicKey}
                      onChange={(e) => setPaystackPublicKey(e.target.value)}
                      placeholder="pk_test_..."
                    />
                    <Button 
                      className="mt-2" 
                      onClick={() => updateConfig("paystack_public_key", paystackPublicKey)}
                    >
                      Save Public Key
                    </Button>
                  </div>
                  <div>
                    <Label>Paystack Secret Key</Label>
                    <Input
                      type="password"
                      value={paystackSecretKey}
                      onChange={(e) => setPaystackSecretKey(e.target.value)}
                      placeholder="sk_test_..."
                    />
                    <Button 
                      className="mt-2" 
                      onClick={() => updateConfig("paystack_secret_key", paystackSecretKey)}
                    >
                      Save Secret Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SMTP Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>SMTP Username</Label>
                    <Input
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <Label>SMTP Password</Label>
                    <Input
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="your-app-password"
                    />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input
                      value={smtpFromEmail}
                      onChange={(e) => setSmtpFromEmail(e.target.value)}
                      placeholder="noreply@yourschool.com"
                    />
                  </div>
                  <div className="space-x-2">
                    <Button onClick={() => updateConfig("smtp_host", smtpHost)}>Save SMTP Host</Button>
                    <Button onClick={() => updateConfig("smtp_port", smtpPort)}>Save SMTP Port</Button>
                    <Button onClick={() => updateConfig("smtp_user", smtpUser)}>Save SMTP User</Button>
                    <Button onClick={() => updateConfig("smtp_password", smtpPassword)}>Save SMTP Password</Button>
                    <Button onClick={() => updateConfig("smtp_from_email", smtpFromEmail)}>Save From Email</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;