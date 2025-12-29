import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/axios';
import { Calendar, Play, BookOpen, Heart, ArrowRight, Users, MapPin } from 'lucide-react';

const Home = () => {
  const [sermons, setSermons] = useState([]);
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sermonsRes, eventsRes, blogsRes] = await Promise.all([
        api.get('/api/sermons?limit=3'),
        api.get('/api/events?limit=3'),
        api.get('/api/blog?limit=3'),
      ]);
      setSermons(sermonsRes.data);
      setEvents(eventsRes.data);
      setBlogs(blogsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-20 text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <img 
                src="/images/logo.png" 
                alt="Heavenly Nature Ministry Logo" 
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
              Heavenly Nature Ministry
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200" data-testid="hero-subtitle">
              Where Faith Meets Nature, and Souls Find Peace
            </p>
            
            {/* Service Times */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-semibold mb-4">Join Us This Sunday</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-300" />
                  <div>
                    <p className="font-medium">Sunday Service</p>
                    <p className="text-gray-300">9:00 AM & 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-6 w-6 text-blue-300" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-300">123 Church Street</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                data-testid="visit-us-btn"
              >
                <Link to="/about">Learn More About Us</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
                data-testid="sermons-btn"
              >
                <Link to="/sermons">Watch Sermons</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Our Family</h2>
          <p className="text-lg text-gray-600 mb-8">
            At Heavenly Nature Ministry, we believe in creating a space where you can connect with God, 
            grow in faith, and build meaningful relationships. Our doors are open to everyone seeking 
            spiritual growth and community.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Users className="h-12 w-12 text-blue-600" />
            <div className="text-left">
              <p className="text-2xl font-bold text-blue-600">All Are Welcome</p>
              <p className="text-gray-600">Come as you are, leave transformed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Sermons</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[60px]">
                  Watch and listen to inspiring messages from our pastors
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/sermons">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[60px]">
                  Join us for worship services, bible studies, and community events
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/events">View Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Blog</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[60px]">
                  Read articles and reflections on faith and spiritual growth
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/blog">Read Blog <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Give</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[60px]">
                  Support our mission and ministry through your generous giving
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/donate">Donate Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Sermons */}
      {sermons.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-800">Recent Sermons</h2>
              <Button asChild variant="outline">
                <Link to="/sermons">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sermons.map((sermon) => (
                <Card 
                  key={sermon.id} 
                  data-testid={`sermon-card-${sermon.id}`}
                  className="hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    {sermon.thumbnail_url ? (
                      <img
                        src={sermon.thumbnail_url}
                        alt={sermon.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {sermon.series || 'Sermon'}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{sermon.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{sermon.speaker}</span>
                      <span>•</span>
                      <span>{new Date(sermon.date).toLocaleDateString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sermon.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {sermon.description}
                      </p>
                    )}
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link to={`/sermons/${sermon.id}`}>Watch Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
              <Button asChild variant="outline">
                <Link to="/events">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  data-testid={`event-card-${event.id}`}
                  className="hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        <CardDescription>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.location && (
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    <Button asChild className="w-full">
                      <Link to={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section 
        className="py-16 text-white relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/logo.png" 
              alt="Heavenly Nature Ministry Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold mb-6">Join Our Community This Sunday</h2>
          <p className="text-xl mb-8 text-gray-200">
            Experience the love of Christ and grow in your faith journey with us.
            We welcome you to be part of our family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link to="/contact">Get in Touch</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link to="/donate">Support Our Mission</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link to="/events">Find an Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
