import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDonationStatus } from "@/lib/api";

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkStatus(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const checkStatus = async (sessionId) => {
    try {
      const data = await getDonationStatus(sessionId);
      setStatus(data);
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-padding">
      <div className="max-w-2xl mx-auto text-center">
        {loading ? (
          <p className="text-lg text-muted-foreground">Confirming your donation...</p>
        ) : status && status.payment_status === "paid" ? (
          <div data-testid="donation-success-message">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="font-heading text-4xl lg:text-5xl font-bold mb-4 text-primary">
              Thank You for Your Generosity!
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your donation of ${(status.amount_total / 100).toFixed(2)} has been received successfully.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Your contribution will make a real difference in the lives of children we serve. May God bless you abundantly!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg">Return Home</Button>
              </Link>
              <Link to="/donations">
                <Button variant="outline" size="lg">
                  Make Another Donation
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-heading text-4xl font-bold mb-4 text-primary">Donation Status</h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're processing your donation. Please check back shortly.
            </p>
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationSuccess;