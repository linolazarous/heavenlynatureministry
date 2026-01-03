import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';
import { Play, Search, Calendar, User, Filter, Eye } from 'lucide-react';

// ✅ Import your hero image
import heroBg from '@/assets/images/worship-bg.jpg';

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeaker, setFilterSpeaker] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [uniqueSpeakers, setUniqueSpeakers] = useState([]);
  const [uniqueSeries, setUniqueSeries] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);

  useEffect(() => {
    fetchSermons();
  }, []);

  useEffect(() => {
    if (sermons.length > 0) {
      setUniqueSpeakers([...new Set(sermons.map((s) => s.speaker).filter(Boolean))]);
      setUniqueSeries([...new Set(sermons.map((s) => s.series).filter(Boolean))]);
      setUniqueYears(
        [...new Set(sermons.map((s) => new Date(s.date).getFullYear()).filter(Boolean))].sort(
          (a, b) => b - a
        )
      );
    }
  }, [sermons]);

  const fetchSermons = async () => {
    try {
      const response = await api.get('/api/sermons?limit=50');
      setSermons(response.data);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSpeaker('');
    setFilterSeries('');
    setFilterYear('');
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch =
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sermon.description && sermon.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sermon.series && sermon.series.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sermon.scripture && sermon.scripture.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpeaker = !filterSpeaker || sermon.speaker === filterSpeaker;
    const matchesSeries = !filterSeries || sermon.series === filterSeries;
    const matchesYear = !filterYear || new Date(sermon.date).getFullYear().toString() === filterYear;

    return matchesSearch && matchesSpeaker && matchesSeries && matchesYear;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section
        className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sermons & Teachings</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6">
            Grow in faith through biblical teaching and spiritual insights
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
            <Play className="h-4 w-4" />
            <span>{sermons.length} sermons available</span>
          </div>
        </div>
      </section>

      {/* Rest of your component stays the same */}
      {/* Filters, Sermons Grid, Call to Action */}
    </div>
  );
};

export default Sermons;
