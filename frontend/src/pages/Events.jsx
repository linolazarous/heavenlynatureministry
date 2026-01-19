import { useEffect, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEvents, createRSVP } from "@/lib/api";
import { toast } from "sonner";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState({ name: "", email: "", phone: "", number_of_attendees: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents(0, 50, true);
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRSVP = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    try {
      await createRSVP(selectedEvent.id, { ...rsvpData, event_id: selectedEvent.id });
      toast.success("RSVP Confirmed!", { description: "You will receive a confirmation email shortly." });
      setRsvpData({ name: "", email: "", phone: "", number_of_attendees: 1 });
      setSelectedEvent(null);
    } catch (error) {
      toast.error("RSVP Failed", { description: error.response?.data?.detail || "Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6">Events</h1>
          <p className="text-xl text-white/90">Join us for upcoming ministry events and gatherings</p>
        </div>
      </section>

      {/* Events List */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} className="card-hover" data-testid={`event-card-${event.id}`}>
                  {event.image_url && (
                    <div className="relative aspect-video overflow-hidden rounded-t-xl">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-heading">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.start_date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      {event.attendees_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees_count} attending</span>
                        </div>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedEvent(event)} data-testid={`rsvp-button-${event.id}`}>
                          RSVP Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="rsvp-dialog">
                        <DialogHeader>
                          <DialogTitle>RSVP for {event.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRSVP} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={rsvpData.name}
                              onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                              required
                              data-testid="rsvp-name-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={rsvpData.email}
                              onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                              required
                              data-testid="rsvp-email-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={rsvpData.phone}
                              onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })}
                              data-testid="rsvp-phone-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="attendees">Number of Attendees</Label>
                            <Input
                              id="attendees"
                              type="number"
                              min="1"
                              value={rsvpData.number_of_attendees}
                              onChange={(e) => setRsvpData({ ...rsvpData, number_of_attendees: parseInt(e.target.value) })}
                              data-testid="rsvp-attendees-input"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={submitting} data-testid="rsvp-submit-button">
                            {submitting ? "Submitting..." : "Confirm RSVP"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
