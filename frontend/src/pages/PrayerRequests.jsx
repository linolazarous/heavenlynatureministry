import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPrayerRequest, getPrayers } from "@/lib/api";
import { toast } from "sonner";

const PrayerRequests = () => {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    request_text: "",
    category: "general",
    is_anonymous: false,
    public_sharing_allowed: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const data = await getPrayers(0, 20);
      setPrayers(data);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPrayerRequest(formData);
      toast.success("Prayer Request Submitted", { description: "We will be praying for you!" });
      setFormData({
        name: "",
        email: "",
        phone: "",
        request_text: "",
        category: "general",
        is_anonymous: false,
        public_sharing_allowed: false,
      });
      fetchPrayers();
    } catch (error) {
      toast.error("Submission Failed", { description: error.response?.data?.detail || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6 text-primary">
            Prayer Requests
          </h1>
          <p className="text-xl text-muted-foreground">
            Share your prayer needs with us. We believe in the power of prayer.
          </p>
        </div>
      </section>

      {/* FORM + RECENT REQUESTS */}
      <section className="section-padding bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* SUBMIT FORM */}
          <Card className="shadow-lg" data-testid="prayer-form-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Submit Prayer Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={formData.is_anonymous}
                    data-testid="prayer-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="prayer-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="prayer-phone-input"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="prayer-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="healing">Healing</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="finances">Finances</SelectItem>
                      <SelectItem value="guidance">Guidance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="request">Prayer Request *</Label>
                  <Textarea
                    id="request"
                    placeholder="Share your prayer request..."
                    value={formData.request_text}
                    onChange={(e) => setFormData({ ...formData, request_text: e.target.value })}
                    required
                    rows={5}
                    data-testid="prayer-request-textarea"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
                    data-testid="prayer-anonymous-checkbox"
                  />
                  <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                    Submit anonymously
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={formData.public_sharing_allowed}
                    onCheckedChange={(checked) => setFormData({ ...formData, public_sharing_allowed: checked })}
                    data-testid="prayer-public-checkbox"
                  />
                  <Label htmlFor="public" className="text-sm cursor-pointer">
                    Allow others to pray for this request
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  data-testid="prayer-submit-button"
                >
                  {submitting ? "Submitting..." : "Submit Prayer Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* RECENT REQUESTS */}
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary mb-6">
              Recent Prayer Requests
            </h2>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : prayers.length > 0 ? (
              <div className="space-y-4">
                {prayers.slice(0, 5).map((prayer) => (
                  <Card key={prayer.id} className="shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-semibold">{prayer.name || "Anonymous"}</span> • {prayer.category}
                      </p>
                      <p className="text-muted-foreground">{prayer.request_text}</p>
                      {prayer.testimony && (
                        <p className="text-sm text-accent mt-2 italic">
                          Testimony: {prayer.testimony}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No prayer requests to display yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrayerRequests;
