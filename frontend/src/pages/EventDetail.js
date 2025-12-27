import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/api/axios';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpData, setRsvpData] = useState({
    name: '',
    email: '',
    phone: '',
    attendees: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/events/${id}/rsvp`, {
        ...rsvpData,
        event_id: id,
        user_id: 'guest',
      });
      toast.success('RSVP successful! See you there!');
      setRsvpData({ name: '', email: '', phone: '', attendees: 1 });
      fetchEvent(); // Refresh event data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'RSVP failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Event not found</p>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          onClick={() => navigate('/events')}
          variant="ghost"
          className="mb-6"
          data-testid="back-to-events-btn"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <Card>
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              )}
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-4" data-testid="event-detail-title">{event.title}</h1>
                
                <div className="space-y-3 text-gray-600 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>{new Date(event.date).toLocaleString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.max_attendees && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>
                        {event.attendees_count} / {event.max_attendees} registered
                      </span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-3">About this event</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RSVP Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">RSVP</h2>
                <form onSubmit={handleRSVP} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
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
                      value={rsvpData.attendees}
                      onChange={(e) => setRsvpData({ ...rsvpData, attendees: parseInt(e.target.value) })}
                      required
                      data-testid="rsvp-attendees-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                    data-testid="rsvp-submit-btn"
                  >
                    {submitting ? 'Submitting...' : 'RSVP Now'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
