import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/api/axios';
import { Calendar, MapPin, Users, Search, Clock, Filter, TrendingUp, ChevronRight, ArrowRight, Tag, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('upcoming');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      // Extract unique categories
      const categories = [...new Set(events.map(event => event.category).filter(Boolean))];
      setUniqueCategories(categories);
      
      // Extract unique locations
      const locations = [...new Set(events.map(event => event.location).filter(Boolean))];
      setUniqueLocations(locations);
      
      // Find featured event (upcoming events sorted by date, then check for featured flag)
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now && event.registration_open !== false;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const featured = events.find(event => event.featured) || upcomingEvents[0] || events[0];
      setFeaturedEvent(featured);
    }
  }, [events]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events', {
        params: {
          upcoming: showUpcomingOnly
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event) => {
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

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !filterCategory || event.category === filterCategory;
      const matchesLocation = !filterLocation || event.location === filterLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      const now = new Date();
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      
      switch (sortBy) {
        case 'upcoming':
          // Show upcoming events first, then past events
          if (aDate > now && bDate > now) return aDate - bDate;
          if (aDate > now) return -1;
          if (bDate > now) return 1;
          return bDate - aDate; // Most recent past events first
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'popular':
          return (b.attendees_count || 0) - (a.attendees_count || 0);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
    setSortBy('upcoming');
  };

  const toggleEventType = () => {
    setShowUpcomingOnly(!showUpcomingOnly);
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-green-800 to-blue-900 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/event-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="events-title">
              Church Events & Gatherings
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
              Join us for worship services, Bible studies, fellowship gatherings, and community outreach events
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-green-200">
              <Calendar className="h-4 w-4" />
              <span>
                {events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate > new Date() && e.registration_open !== false;
                }).length} upcoming events
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <Card className="mb-8 border-green-100 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Filter Events</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleEventType}
                    className="text-green-600 hover:text-green-700"
                  >
                    {showUpcomingOnly ? 'Show All Events' : 'Show Upcoming Only'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-green-600 hover:text-green-700"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search events by title, location, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="event-search-input"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Locations</SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming First</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || filterCategory || filterLocation) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {filterCategory && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Category: {filterCategory}
                    </Badge>
                  )}
                  {filterLocation && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Location: {filterLocation}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Event */}
          {featuredEvent && !searchTerm && !filterCategory && !filterLocation && getEventStatus(featuredEvent) === 'upcoming' && (
            <div className="mb-12">
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-full">
                    {featuredEvent.image_url ? (
                      <img
                        src={featuredEvent.image_url}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-600 hover:bg-green-700">Featured</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant={getEventBadgeVariant(featuredEvent)}>
                        {getEventBadgeIcon(featuredEvent)}
                        {getEventBadgeText(featuredEvent)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center space-x-4 mb-4">
                      {featuredEvent.category && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {featuredEvent.category}
                        </Badge>
                      )}
                      {featuredEvent.registration_required && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Registration Required
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-2xl mb-4">{featuredEvent.title}</CardTitle>
                    
                    <CardDescription className="mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                          <div>
                            <div className="font-medium">{formatDate(featuredEvent.date)}</div>
                            {featuredEvent.end_date && (
                              <div className="text-sm text-gray-500">
                                Ends: {formatDate(featuredEvent.end_date)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                          <div>
                            <div className="font-medium">{featuredEvent.location || 'Location TBD'}</div>
                          </div>
                        </div>
                      </div>
                    </CardDescription>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {featuredEvent.description || 'Join us for this special event...'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {featuredEvent.max_attendees ? (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {featuredEvent.attendees_count || 0} / {featuredEvent.max_attendees} registered
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {featuredEvent.attendees_count || 0} attending
                          </div>
                        )}
                      </div>
                      <Button 
                        asChild 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Link to={`/events/${featuredEvent.id}`} className="flex items-center">
                          {featuredEvent.registration_required ? 'Register Now' : 'View Details'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tabs for Different Views */}
          <Tabs defaultValue="upcoming" className="mb-8">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
              <TabsTrigger value="all">All Events</TabsTrigger>
              {uniqueCategories.slice(0, 3).map(category => (
                <TabsTrigger key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
              <p className="text-gray-600 mb-4">
                Showing upcoming events. Check back regularly for updates.
              </p>
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              <p className="text-gray-600 mb-4">
                Browse through our past events and gatherings.
              </p>
            </TabsContent>
          </Tabs>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No events found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterCategory || filterLocation 
                    ? "Try adjusting your search filters"
                    : "No events scheduled yet. Check back soon!"}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {filteredEvents.length} of {events.length} events
                  {showUpcomingOnly && ' (upcoming only)'}
                </p>
                <div className="text-sm text-gray-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sorted by: {sortBy === 'upcoming' ? 'Upcoming' : 
                             sortBy === 'newest' ? 'Newest' : 
                             sortBy === 'oldest' ? 'Oldest' : 'Popular'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                    data-testid={`event-card-${event.id}`}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-500 to-blue-600">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        {event.category && (
                          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant={getEventBadgeVariant(event)}>
                          {getEventBadgeIcon(event)}
                          {getEventBadgeText(event)}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-green-600 transition-colors">
                        {event.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="space-y-2 mt-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{formatDateShort(event.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{event.location || 'Location TBD'}</span>
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees_count || 0} attending
                          </div>
                          {event.max_attendees && (
                            <div className="text-xs text-gray-500">
                              Max: {event.max_attendees}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {event.registration_required && (
                            <Badge variant="outline" className="text-xs">
                              RSVP Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        asChild 
                        className="w-full bg-green-600 hover:bg-green-700 group"
                      >
                        <Link to={`/events/${event.id}`} className="flex items-center justify-center">
                          {getEventStatus(event) === 'upcoming' ? 
                            (event.registration_required ? 'Register Now' : 'View Details') : 
                            'View Details'}
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Event Types & Locations */}
          {(uniqueCategories.length > 0 || uniqueLocations.length > 0) && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categories */}
                {uniqueCategories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-green-600" />
                        Browse by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {uniqueCategories.map(category => (
                          <Button
                            key={category}
                            variant={filterCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterCategory(category)}
                            className="mb-2"
                          >
                            {category}
                            <span className="ml-2 text-xs opacity-70">
                              ({events.filter(e => e.category === category).length})
                            </span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Locations */}
                {uniqueLocations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        Browse by Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {uniqueLocations.map(location => (
                          <Button
                            key={location}
                            variant={filterLocation === location ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterLocation(location)}
                            className="mb-2"
                          >
                            {location}
                            <span className="ml-2 text-xs opacity-70">
                              ({events.filter(e => e.location === location).length})
                            </span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="mt-12 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Stay Connected</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive event updates, service schedules, and ministry opportunities directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-grow"
              />
              <Button className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
