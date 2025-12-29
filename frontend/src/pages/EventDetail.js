import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '@/api/axios';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart, 
  Bookmark, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [rsvpCount, setRsvpCount] = useState(0);

  const [rsvpData, setRsvpData] = useState({
    name: '',
    email: '',
    phone: '',
    attendees: 1,
    notes: ''
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event) => {
    if (!event) return 'past';
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) return 'past';
    if (!event.registration_open) return 'closed';
    if (event.max_attendees && event.attendees_count >= event.max_attendees) return 'full';
    return 'upcoming';
  };

  const getEventBadgeVariant = (event) => {
    const status = getEventStatus(event);
    switch (status) {
      case 'past': return 'secondary';
      case 'closed': return 'secondary';
      case 'full': return 'destructive';
      case 'upcoming': return 'default';
      default: return 'outline';
    }
  };

  const getEventBadgeText = (event) => {
    const status = getEventStatus(event);
    switch (status) {
      case 'past': return 'Past Event';
      case 'closed': return 'Registration Closed';
      case 'full': return 'Fully Booked';
      case 'upcoming': return 'Registration Open';
      default: return '';
    }
  };

  const getEventBadgeIcon = (event) => {
    const status = getEventStatus(event);
    switch (status) {
      case 'past': return <Clock className="h-3 w-3 mr-1" />;
      case 'closed': return <XCircle className="h-3 w-3 mr-1" />;
      case 'full': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'upcoming': return <CheckCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/events/${id}`);
      setEvent(response.data);
      
      // Fetch related events based on category
      if (response.data.category) {
        const relatedResponse = await api.get('/api/events', {
          params: {
            category: response.data.category,
            upcoming: true,
            limit: 3
          }
        });
        setRelatedEvents(relatedResponse.data.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRsvpCount = useCallback(async () => {
    try {
      const response = await api.get(`/api/events/${id}/rsvps`);
      setRsvpCount(response.data.length);
    } catch (error) {
      console.error('Error fetching RSVP count:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
    fetchRsvpCount();
  }, [fetchEvent, fetchRsvpCount]);

  const handleRSVP = async (e) => {
    e.preventDefault();
    
    if (!rsvpData.name || !rsvpData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    if (rsvpData.attendees < 1) {
      toast.error('Please enter at least 1 attendee');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/api/events/${id}/rsvp`, {
        ...rsvpData,
        event_id: id,
        attendees: Number(rsvpData.attendees),
      });

      toast.success('RSVP successful! See you there!');
      setRsvpData({ 
        name: '', 
        email: '', 
        phone: '', 
        attendees: 1, 
        notes: '' 
      });
      
      // Refresh event data to update attendees count
      fetchEvent();
      fetchRsvpCount();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'RSVP failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const addToCalendar = () => {
    const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.end_date 
      ? new Date(event.end_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus(event);
  const canRegister = eventStatus === 'upcoming' && event.registration_open !== false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-green-800 to-blue-900 text-white py-12"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/event-detail-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => navigate('/events')}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
            data-testid="back-to-events-btn"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={getEventBadgeVariant(event)} className="text-sm">
                  {getEventBadgeIcon(event)}
                  {getEventBadgeText(event)}
                </Badge>
                {event.category && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {event.category}
                  </Badge>
                )}
                {event.registration_required && (
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                    Registration Required
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="event-detail-title">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(event.date)}</span>
                </div>
                {event.end_date && (
                  <div className="flex items-center gap-2">
                    <span className="opacity-70">to</span>
                    <span>{formatDate(event.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/20"
                onClick={shareEvent}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/20"
                onClick={addToCalendar}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <div className="relative h-64 md:h-96">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center rounded-t-lg">
                      <Calendar className="h-16 w-16 text-white opacity-80" />
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Location</h3>
                        <p className="text-gray-600">{event.location || 'Location to be announced'}</p>
                        {event.address && (
                          <p className="text-sm text-gray-500 mt-1">{event.address}</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Attendance</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-gray-600">
                            {event.attendees_count || 0} attending
                          </span>
                          {event.max_attendees && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">
                                Capacity: {event.max_attendees}
                              </span>
                              <div className="flex-1 max-w-xs">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-600"
                                    style={{ 
                                      width: `${Math.min(100, ((event.attendees_count || 0) / event.max_attendees) * 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {event.description && (
                    <div className="prose max-w-none">
                      <h2 className="text-2xl font-bold mb-6">About this Event</h2>
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {event.description}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6">
                  <div className="text-sm text-gray-500">
                    Created on {new Date(event.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareEvent}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Related Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedEvents.map((relatedEvent) => (
                      <Card 
                        key={relatedEvent.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/events/${relatedEvent.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg line-clamp-2">
                            {relatedEvent.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(relatedEvent.date)}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="ghost" size="sm" className="w-full">
                            View Details
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RSVP Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Register for Event</CardTitle>
                  <CardDescription>
                    {canRegister 
                      ? 'Complete the form below to reserve your spot'
                      : 'Registration is no longer available for this event'
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {canRegister ? (
                    <form onSubmit={handleRSVP} className="space-y-5">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={rsvpData.name}
                          onChange={(e) =>
                            setRsvpData({ ...rsvpData, name: e.target.value })
                          }
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={rsvpData.email}
                          onChange={(e) =>
                            setRsvpData({ ...rsvpData, email: e.target.value })
                          }
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(123) 456-7890"
                          value={rsvpData.phone}
                          onChange={(e) =>
                            setRsvpData({ ...rsvpData, phone: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="attendees">
                          Number of Attendees *
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => 
                              setRsvpData({ 
                                ...rsvpData, 
                                attendees: Math.max(1, rsvpData.attendees - 1) 
                              })
                            }
                            disabled={rsvpData.attendees <= 1 || submitting}
                          >
                            -
                          </Button>
                          <Input
                            id="attendees"
                            type="number"
                            min="1"
                            max={event.max_attendees ? Math.min(10, event.max_attendees - (event.attendees_count || 0)) : 10}
                            value={rsvpData.attendees}
                            onChange={(e) =>
                              setRsvpData({
                                ...rsvpData,
                                attendees: Math.max(1, Number(e.target.value)),
                              })
                            }
                            className="text-center"
                            required
                            disabled={submitting}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => 
                              setRsvpData({ 
                                ...rsvpData, 
                                attendees: rsvpData.attendees + 1 
                              })
                            }
                            disabled={
                              submitting || 
                              (event.max_attendees && 
                               rsvpData.attendees >= Math.min(10, event.max_attendees - (event.attendees_count || 0)))
                            }
                          >
                            +
                          </Button>
                        </div>
                        {event.max_attendees && (
                          <p className="text-xs text-gray-500">
                            Maximum {Math.min(10, event.max_attendees - (event.attendees_count || 0))} spots available per registration
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Additional Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Any dietary restrictions, special requirements, or questions..."
                          value={rsvpData.notes}
                          onChange={(e) =>
                            setRsvpData({ ...rsvpData, notes: e.target.value })
                          }
                          rows={3}
                          disabled={submitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={submitting}
                        size="lg"
                      >
                        {submitting ? 'Processing...' : 'Confirm Registration'}
                        <CheckCircle className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {eventStatus === 'past' 
                          ? 'This event has already taken place'
                          : eventStatus === 'full'
                          ? 'This event is fully booked'
                          : 'Registration is closed'
                        }
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {eventStatus === 'past'
                          ? 'Check out our upcoming events for future gatherings.'
                          : 'Please check back for future events or contact us for more information.'
                        }
                      </p>
                      <Button onClick={() => navigate('/events')} className="bg-green-600 hover:bg-green-700">
                        Browse Upcoming Events
                      </Button>
                    </div>
                  )}
                </CardContent>
                
                {canRegister && (
                  <CardFooter className="border-t pt-6">
                    <div className="text-xs text-gray-500 text-center w-full">
                      <p>By registering, you agree to receive event updates via email.</p>
                      <p className="mt-1">Your information will only be used for event coordination.</p>
                    </div>
                  </CardFooter>
                )}
              </Card>

              {/* Event Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Date & Time</h4>
                        <p className="text-gray-600">{formatDate(event.date)}</p>
                        {event.end_date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Ends: {formatDate(event.end_date)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Location</h4>
                        <p className="text-gray-600">{event.location || 'TBD'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Attendance</h4>
                        <p className="text-gray-600">
                          {event.attendees_count || 0} registered
                          {event.max_attendees && ` of ${event.max_attendees}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:events@heavenlynature.org?subject=Question about: ${event.title}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Event Coordinator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
