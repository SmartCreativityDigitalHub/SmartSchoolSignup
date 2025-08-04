import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, DollarSign, Users, TrendingUp, Link } from "lucide-react";

const AffiliateDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
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

    if (profile?.role !== "affiliate") {
      navigate("/");
      return;
    }

    setUser(session.user);
    await loadAffiliateData(session.user.id);
  };

  const loadAffiliateData = async (userId: string) => {
    setLoading(true);
    try {
      // Load affiliate data
      const { data: affiliateData } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (affiliateData) {
        setAffiliate(affiliateData);

        // Load referrals and withdrawals
        const [referralsResult, withdrawalsResult] = await Promise.all([
          supabase
            .from("referrals")
            .select("*, school_signups(*)")
            .eq("affiliate_id", affiliateData.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("withdrawal_requests")
            .select("*")
            .eq("affiliate_id", affiliateData.id)
            .order("created_at", { ascending: false }),
        ]);

        setReferrals(referralsResult.data || []);
        setWithdrawalRequests(withdrawalsResult.data || []);
      }
    } catch (error: any) {
      toast.error("Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/?ref=${affiliate?.affiliate_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const requestWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    const pendingAmount = affiliate?.pending_amount || 0;

    if (amount > pendingAmount) {
      toast.error("Withdrawal amount cannot exceed pending earnings");
      return;
    }

    // Check minimum withdrawal
    const { data: config } = await supabase
      .from("admin_configs")
      .select("config_value")
      .eq("config_key", "minimum_withdrawal")
      .single();

    const minimumWithdrawal = parseFloat(config?.config_value || "5000");
    if (amount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₦${minimumWithdrawal.toLocaleString()}`);
      return;
    }

    const { error } = await supabase
      .from("withdrawal_requests")
      .insert({
        affiliate_id: affiliate.id,
        amount: amount,
      });

    if (error) {
      toast.error("Failed to submit withdrawal request");
    } else {
      toast.success("Withdrawal request submitted successfully");
      setWithdrawalAmount("");
      loadAffiliateData(user.id);
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

  if (affiliate?.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your affiliate account is currently {affiliate?.status || "pending"}. 
              Please wait for admin approval before you can start earning commissions.
            </p>
            <Button
              onClick={() => supabase.auth.signOut()}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${affiliate?.affiliate_code}`;
  const totalLeads = referrals.length;
  const convertedLeads = referrals.filter(r => r.status === "converted").length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
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

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">₦{affiliate?.total_earnings?.toLocaleString() || "0"}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold">₦{affiliate?.pending_amount?.toLocaleString() || "0"}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{totalLeads}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={referralLink} readOnly />
              <Button onClick={copyReferralLink} size="sm">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this link to earn {affiliate?.commission_rate}% commission on every school that signs up through your referral.
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="withdrawal-amount">Amount (₦)</Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter withdrawal amount"
                  max={affiliate?.pending_amount || 0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ₦{affiliate?.pending_amount?.toLocaleString() || "0"}
                </p>
              </div>
              <Button onClick={requestWithdrawal} disabled={!withdrawalAmount}>
                Request Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        {referral.school_signups?.school_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {referral.school_signups?.selected_plan || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={referral.status === "converted" ? "default" : "secondary"}>
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₦{referral.commission_amount?.toLocaleString() || "0"}</TableCell>
                      <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {referrals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No referrals yet. Start sharing your link to earn commissions!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>₦{request.amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={request.status === "paid" ? "default" : "secondary"}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.admin_notes || "N/A"}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {withdrawalRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No withdrawal requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;