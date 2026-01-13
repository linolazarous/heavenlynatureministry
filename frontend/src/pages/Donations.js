import { useState } from "react";
import { Heart, Download, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createDonationCheckout, getDonationStatus } from "@/lib/api";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Donations = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [frequency, setFrequency] = useState("one_time");
  const [donorInfo, setDonorInfo] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const bankDetails = {
    bankName: "Commercial Bank of South Sudan",
    accountName: "Heavenly Nature Ministry",
    accountNumber: "1234567890",
    swiftCode: "CBSSSSJB",
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const checkPaymentStatus = async (sessionId) => {
    try {
      const status = await getDonationStatus(sessionId);
      if (status.payment_status === "paid") {
        toast.success("Donation Successful!", { description: "Thank you for your generous contribution!" });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const donationData = {
        amount: parseFloat(amount),
        currency: "usd",
        category,
        frequency,
        donor_name: donorInfo.name || null,
        donor_email: donorInfo.email || null,
        message: donorInfo.message || null,
        anonymous: !donorInfo.name,
      };

      const result = await createDonationCheckout(donationData);
      window.location.href = result.url;
    } catch (error) {
      toast.error("Donation Failed", { description: error.response?.data?.detail || "Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-accent/20 to-primary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6 text-primary">Make a Difference</h1>
          <p className="text-xl text-muted-foreground">
            Your generosity transforms lives and brings hope to children in need
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-lg" data-testid="donation-form-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Donate Online</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Donation Amount (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="50.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="donation-amount-input"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Donation Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="donation-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Fund</SelectItem>
                      <SelectItem value="childrens_ministry">Children's Ministry</SelectItem>
                      <SelectItem value="building_fund">Building Fund</SelectItem>
                      <SelectItem value="emergency">Emergency Relief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger data-testid="donation-frequency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="donor-name">Your Name (Optional)</Label>
                  <Input
                    id="donor-name"
                    placeholder="John Doe"
                    value={donorInfo.name}
                    onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                    data-testid="donor-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="donor-email">Email (Optional)</Label>
                  <Input
                    id="donor-email"
                    type="email"
                    placeholder="john@example.com"
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                    data-testid="donor-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share why you're giving..."
                    value={donorInfo.message}
                    onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                    data-testid="donor-message-input"
                  />
                </div>

                <Button
                  className="w-full btn-accent text-lg py-6"
                  onClick={handleDonate}
                  disabled={loading}
                  data-testid="donate-now-button"
                >
                  {loading ? "Processing..." : "Donate Now"}
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Bank Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Bank Name</p>
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                      <p className="font-medium">{bankDetails.bankName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                        data-testid="copy-bank-name"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Name</p>
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                      <p className="font-medium">{bankDetails.accountName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                        data-testid="copy-account-name"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                      <p className="font-medium">{bankDetails.accountNumber}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                        data-testid="copy-account-number"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">SWIFT Code</p>
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                      <p className="font-medium">{bankDetails.swiftCode}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.swiftCode, "SWIFT code")}
                        data-testid="copy-swift-code"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-accent/10">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Contact us via WhatsApp for any questions about donations
                  </p>
                  <a href="https://wa.me/211922273334" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="outline" data-testid="whatsapp-button">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donations;