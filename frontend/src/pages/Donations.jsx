import { useState, useEffect } from "react";
import { Heart, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createDonationCheckout, getDonationStatus } from "@/lib/api";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Donations = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [frequency, setFrequency] = useState("one_time");
  const [currency, setCurrency] = useState("USD");
  const [donorInfo, setDonorInfo] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const bankDetails = {
    bankName: "Equity Bank Limited Southern Sudan",
    switchCode: "EQBLSSJB",
    accountName: "Heavenly Nature Ministry",
    accounts: { USD: "2010211361856", SSP: "2010211361855" },
  };

  const mobileMoneyDetails = {
    mobileNumber: "+211 926 006 202",
    network: "MTN South Sudan",
    accountName: "Heavenly Nature Ministry",
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) checkPaymentStatus(sessionId);
  }, [searchParams]);

  const checkPaymentStatus = async (sessionId) => {
    try {
      const status = await getDonationStatus(sessionId);
      if (status.payment_status === "paid") {
        toast.success("Donation Successful!", { description: "Thank you for your generous contribution!" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const result = await createDonationCheckout({
        amount: parseFloat(amount),
        currency: currency.toLowerCase(),
        category,
        frequency,
        donor_name: donorInfo.name || null,
        donor_email: donorInfo.email || null,
        message: donorInfo.message || null,
        anonymous: !donorInfo.name,
      });

      window.location.href = result.url;
    } catch (error) {
      toast.error("Donation Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent/20 to-primary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-5xl font-bold text-primary mb-4">Make a Difference</h1>
          <p className="text-xl text-muted-foreground">
            Your generosity transforms lives and brings hope to children in need
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Online Donation */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Donate Online</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Donation Amount</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SSP">SSP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Donation Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Fund</SelectItem>
                    <SelectItem value="childrens_ministry">Children's Ministry</SelectItem>
                    <SelectItem value="building_fund">Building Fund</SelectItem>
                    <SelectItem value="emergency">Emergency Relief</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-Time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Your Name (Optional)"
                value={donorInfo.name}
                onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email (Optional)"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
              />
              <Textarea
                placeholder="Message (Optional)"
                value={donorInfo.message}
                onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
              />

              <Button className="w-full btn-accent py-6 text-lg" onClick={handleDonate} disabled={loading}>
                {loading ? "Processing..." : "Donate Securely"} <Heart className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Bank & Mobile Money */}
          <div className="space-y-6">
            {/* Bank Transfer */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Bank Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{bankDetails.bankName}</p>

                <p className="text-sm text-muted-foreground">Head Office Switch Code</p>
                <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                  <span>{bankDetails.switchCode}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.switchCode, "Switch Code")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-medium">{bankDetails.accountName}</p>

                <Label>Account Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD Account</SelectItem>
                    <SelectItem value="SSP">SSP Account</SelectItem>
                  </SelectContent>
                </Select>

                <p className="text-sm text-muted-foreground">Account Number ({currency})</p>
                <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                  <span className="font-medium">{bankDetails.accounts[currency]}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.accounts[currency], "Account Number")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Money */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Mobile Money</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Network:</strong> {mobileMoneyDetails.network}</p>
                <p><strong>Account Name:</strong> {mobileMoneyDetails.accountName}</p>
                <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                  <span>{mobileMoneyDetails.mobileNumber}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(mobileMoneyDetails.mobileNumber, "Mobile Number")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="shadow-lg bg-accent/10">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Need help with your donation?</p>
                <a href="https://wa.me/211922273334" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Donation Support
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donations;
