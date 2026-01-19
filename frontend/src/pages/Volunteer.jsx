import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createVolunteer } from "@/lib/api";
import { toast } from "sonner";

const Volunteer = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    areas_of_interest: [],
    availability: "",
    skills: "",
    experience: "",
    motivation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const interestAreas = [
    "Children's Ministry",
    "Teaching",
    "Counseling",
    "Administration",
    "Media/Tech",
    "Event Planning",
    "Fundraising",
    "Prayer Team",
  ];

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      areas_of_interest: prev.areas_of_interest.includes(interest)
        ? prev.areas_of_interest.filter((i) => i !== interest)
        : [...prev.areas_of_interest, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createVolunteer(formData);
      toast.success("Application Submitted!", { description: "We will contact you soon. Thank you for volunteering!" });
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        areas_of_interest: [],
        availability: "",
        skills: "",
        experience: "",
        motivation: "",
      });
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
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6 text-primary">
            Volunteer With Us
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our team and make an eternal impact in the lives of children
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="section-padding bg-background">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Volunteer Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Areas of Interest */}
                <div>
                  <Label className="mb-3 block">Areas of Interest *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {interestAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={formData.areas_of_interest.includes(area)}
                          onCheckedChange={() => toggleInterest(area)}
                        />
                        <Label htmlFor={area} className="text-sm cursor-pointer">{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <Label htmlFor="availability">Availability *</Label>
                  <Textarea
                    id="availability"
                    placeholder="When are you available to volunteer? (e.g., weekends, weekdays)"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    required
                  />
                </div>

                {/* Skills, Experience, Motivation */}
                <div>
                  <Label htmlFor="skills">Skills & Talents</Label>
                  <Textarea
                    id="skills"
                    placeholder="What skills or talents can you contribute?"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Relevant Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Do you have any experience in ministry or working with children?"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="motivation">Why do you want to volunteer?</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Share your motivation for wanting to serve..."
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  />
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full text-lg py-6" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;
