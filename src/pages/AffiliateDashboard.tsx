import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, DollarSign, Users, TrendingUp, Wallet } from "lucide-react";

interface AffiliateProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  total_referrals: number;
}

interface ReferralData {
  id: string;
  referral_code: string;
  visited_at: string;
  converted: boolean;
  commission_earned: number;
  commission_status: string;
}

const AffiliateDashboard = () => {
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const { toast } = useToast();

  const referralUrl = profile ? `${window.location.origin}/?ref=${profile.username}` : "";

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your dashboard.",
          variant: "destructive",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/affiliate-login';
        }, 2000);
        return;
      }

      // Fetch affiliate profile using maybeSingle to handle no results gracefully
      const { data: profileData, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load your affiliate profile. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      if (!profileData) {
        toast({
          title: "Profile Not Found",
          description: "No affiliate profile found. Please complete your signup first.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/affiliate-signup';
        }, 2000);
        return;
      }

      setProfile(profileData);

      // Fetch referral data
      const { data: referralData, error: referralError } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('affiliate_id', profileData.id)
        .order('visited_at', { ascending: false });

      if (referralError) {
        console.error('Error fetching referrals:', referralError);
        // Don't return here, just log the error and continue with empty referrals
      }

      setReferrals(referralData || []);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Copied!",
      description: "Referral URL copied to clipboard.",
    });
  };

  const handleWithdrawal = async () => {
    if (!profile || !withdrawAmount) return;

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > profile.pending_earnings) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your pending earnings.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingWithdrawal(true);

    try {
      const { error } = await supabase
        .from('affiliate_withdrawals')
        .insert({
          affiliate_id: profile.id,
          amount: amount,
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for review.",
      });

      setWithdrawAmount("");
      fetchAffiliateData();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to submit withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <p>Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Affiliate Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {profile.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(profile.total_earnings)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Wallet className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(profile.pending_earnings)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.total_referrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referrals.length > 0 ? 
                  `${Math.round((referrals.filter(r => r.converted).length / referrals.length) * 100)}%` : 
                  '0%'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral URL Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to earn commissions when schools sign up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                value={referralUrl} 
                readOnly 
                className="flex-1"
              />
              <Button onClick={copyReferralUrl} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>
              Available for withdrawal: {formatCurrency(profile.pending_earnings)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="withdrawAmount">Amount</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={profile.pending_earnings}
                />
              </div>
              <Button 
                onClick={handleWithdrawal}
                disabled={isSubmittingWithdrawal || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                {isSubmittingWithdrawal ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              Track your referral performance and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      {new Date(referral.visited_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{referral.referral_code}</TableCell>
                    <TableCell>
                      <Badge variant={referral.converted ? "default" : "secondary"}>
                        {referral.converted ? "Converted" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.converted ? formatCurrency(referral.commission_earned) : "₦0"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          referral.commission_status === 'paid' ? 'default' : 
                          referral.commission_status === 'approved' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {referral.commission_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {referrals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No referrals yet. Start sharing your referral link!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;