import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/axios';
import { Calendar, Play, BookOpen, Heart, ArrowRight } from 'lucide-react';

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
        api.get('/sermons?limit=3'),
        api.get('/events?limit=3'),
        api.get('/blog?limit=3'),
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
              Welcome to Heavenly Nature Ministry
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100" data-testid="hero-subtitle">
              Growing in Faith, Building Community, Serving with Love
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                data-testid="visit-us-btn"
              >
                <Link to="/about">Learn More About Us</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                data-testid="sermons-btn"
              >
                <Link to="/sermons">Watch Sermons</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Play className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Sermons</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Watch and listen to inspiring messages from our pastors
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/sermons">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join us for worship services, bible studies, and community events
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/events">View Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Blog</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read articles and reflections on faith and spiritual growth
                </CardDescription>
                <Button asChild className="mt-4" variant="link">
                  <Link to="/blog">Read Blog <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Give</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Recent Sermons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sermons.map((sermon) => (
                <Card key={sermon.id} data-testid={`sermon-card-${sermon.id}`}>
                  {sermon.thumbnail_url && (
                    <img
                      src={sermon.thumbnail_url}
                      alt={sermon.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{sermon.title}</CardTitle>
                    <CardDescription>
                      {sermon.speaker} • {new Date(sermon.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={`/sermons/${sermon.id}`}>Watch Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/sermons">View All Sermons</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} data-testid={`event-card-${event.id}`}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8">
            Experience the love of Christ and grow in your faith journey with us.
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
