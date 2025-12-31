import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/axios';
import { Calendar, Play, BookOpen, Heart, ArrowRight, Users, MapPin, Clock } from 'lucide-react';

const Home = () => {
  const [sermons, setSermons] = useState([]);
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

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
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(/images/herobg.jpg)',
        }}
      >
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Gradient overlay for visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/images/logo.png" 
                alt="Heavenly Nature Ministry Logo" 
                className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-lg animate-fade-in"
              />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Heavenly Nature <span className="text-blue-300">Ministry</span>
            </h1>
            
            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow-lg">
              Where Faith, Nature, and Community Converge for Spiritual Transformation
            </p>
            
            {/* Service Times Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-4xl mx-auto mb-10 border border-white/20 shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Join Our Worship Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sunday Service */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Calendar className="h-8 w-8 text-blue-300" />
                    <h4 className="text-xl font-semibold text-white">Sunday Service</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-300" />
                      <div>
                        <p className="font-medium text-white">Morning Worship</p>
                        <p className="text-gray-300">9:00 AM - 11:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-300" />
                      <div>
                        <p className="font-medium text-white">Afternoon Service</p>
                        <p className="text-gray-300">11:30 AM - 1:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <MapPin className="h-8 w-8 text-blue-300" />
                    <h4 className="text-xl font-semibold text-white">Our Location</h4>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-300 leading-relaxed">
                      Gudele 2 Joppa Block 3<br />
                      Juba, South Sudan
                    </p>
                    <div className="pt-2">
                      <p className="text-sm text-blue-300 font-medium">
                        Ample Parking Available
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Midweek Service */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Calendar className="h-8 w-8 text-blue-300" />
                    <h4 className="text-xl font-semibold text-white">Midweek Service</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-300" />
                      <div>
                        <p className="font-medium text-white">Bible Study</p>
                        <p className="text-gray-300">Wednesday 7:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-pink-300" />
                      <div>
                        <p className="font-medium text-white">Youth Fellowship</p>
                        <p className="text-gray-300">Friday 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/sermons')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Sermons
              </Button>
              <Button
                onClick={() => navigate('/events')}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Events
              </Button>
              <Button
                onClick={() => navigate('/about')}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Learn About Us
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">150+</div>
                <div className="text-gray-300">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">52</div>
                <div className="text-gray-300">Weekly Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">10+</div>
                <div className="text-gray-300">Ministries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">5</div>
                <div className="text-gray-300">Years Serving</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                Welcome to Our <span className="text-blue-600">Spiritual Family</span>
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-600">
                  At Heavenly Nature Ministry, we are more than just a church - we are a community 
                  of believers committed to growing together in faith, love, and service.
                </p>
                <p className="text-lg text-gray-600">
                  Our mission is to create a welcoming space where you can experience God's presence, 
                  connect with others on the same spiritual journey, and discover your purpose in Christ.
                </p>
                <p className="text-lg text-gray-600">
                  Whether you're exploring faith for the first time or looking to deepen your 
                  relationship with God, you'll find a home here among us.
                </p>
              </div>
              <div className="mt-8">
                <Button 
                  onClick={() => navigate('/about')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Our Story & Mission
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Right side - Image/Graphic */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto mb-6 text-white/80" />
                  <h3 className="text-2xl font-bold mb-4">You Belong Here</h3>
                  <p className="text-lg mb-6">
                    Join our diverse community of believers from all walks of life
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="text-2xl font-bold">All Ages</div>
                      <div className="text-sm">Children to Seniors</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="text-2xl font-bold">Every Background</div>
                      <div className="text-sm">Welcomed & Valued</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Experience Our <span className="text-blue-600">Ministries</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the various ways you can grow, serve, and connect with our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Play className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Sermons & Teaching</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg min-h-[80px] mb-6">
                  Transformative biblical teaching for spiritual growth and practical living
                </CardDescription>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Link to="/sermons">
                    Explore Sermons
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Events & Fellowship</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg min-h-[80px] mb-6">
                  Connect with others through worship services, small groups, and community events
                </CardDescription>
                <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Link to="/events">
                    View Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Spiritual Resources</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg min-h-[80px] mb-6">
                  Articles, devotionals, and resources to support your faith journey
                </CardDescription>
                <Button asChild className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <Link to="/blog">
                    Read Blog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Giving & Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg min-h-[80px] mb-6">
                  Partner with us in ministry through your generous giving and prayers
                </CardDescription>
                <Button asChild className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700">
                  <Link to="/donate">
                    Give Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Sermons Section */}
      {sermons.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Latest <span className="text-blue-600">Sermons</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Watch and listen to inspiring messages from our recent worship services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sermons.map((sermon) => (
                <Card 
                  key={sermon.id} 
                  className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="relative h-56 overflow-hidden">
                    {sermon.thumbnail_url ? (
                      <img
                        src={sermon.thumbnail_url}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Play className="h-16 w-16 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {sermon.series || 'Sermon'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {sermon.title}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-3">
                      <span className="font-medium">{sermon.speaker}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {new Date(sermon.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sermon.description && (
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {sermon.description}
                      </p>
                    )}
                    <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Link to={`/sermons/${sermon.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                onClick={() => navigate('/sermons')}
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View All Sermons
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Upcoming <span className="text-emerald-600">Events</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join us for worship, fellowship, and community gatherings
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const eventDate = new Date(event.date);
                const isThisWeek = eventDate > new Date() && eventDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <Card 
                    key={event.id} 
                    className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
                            {eventDate.toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                          <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                          {isThisWeek && (
                            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                              This Week
                            </div>
                          )}
                        </div>
                        <div className="text-center bg-white/20 p-3 rounded-xl">
                          <div className="text-3xl font-bold">
                            {eventDate.getDate()}
                          </div>
                          <div className="text-sm uppercase">
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Calendar className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p className="text-sm">
                              {eventDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })} at {eventDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center space-x-3 text-gray-600">
                            <MapPin className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-sm">{event.location}</p>
                            </div>
                          </div>
                        )}
                        
                        {event.description && (
                          <div>
                            <p className="text-gray-600 line-clamp-3">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        asChild 
                        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                      >
                        <Link to={`/events/${event.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                onClick={() => navigate('/events')}
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Final Call to Action */}
      <section 
        className="relative py-20 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <img 
              src="/images/logo.png" 
              alt="Heavenly Nature Ministry Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Join Our Family?
          </h2>
          
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Take the next step in your spiritual journey. Whether you want to visit, connect, 
            or learn more about our ministries, we're here to welcome you with open arms.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button
              onClick={() => navigate('/contact')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 py-8 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Get Connected
            </Button>
            
            <Button
              onClick={() => navigate('/donate')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-8 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Heart className="mr-2 h-5 w-5" />
              Support Our Mission
            </Button>
            
            <Button
              onClick={() => navigate('/events')}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 py-8 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Find an Event
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-gray-300">
              Have questions? Call us at <span className="font-semibold text-white">+211 (0) 912 345 678</span> or 
              email <span className="font-semibold text-white">info@heavenlynature.org</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
