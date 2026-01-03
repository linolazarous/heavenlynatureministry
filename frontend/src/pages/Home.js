import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        style={{ backgroundImage: 'url(/images/worship-bg.jpg)' }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/images/logo.png"
              alt="Heavenly Nature Ministry Logo"
              className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-lg animate-fade-in"
            />
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Heavenly Nature <span className="text-blue-300">Ministry</span>
          </h1>
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
                  <p className="text-sm text-blue-300 font-medium pt-2">Ample Parking Available</p>
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
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      {/* Make sure any other background images also use /images/... */}
    </div>
  );
};

export default Home;
