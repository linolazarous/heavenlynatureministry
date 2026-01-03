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
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(/images/herobg.jpg)',
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

      {/* Filters */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8 border-blue-100 shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Filter Sermons</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600">
                Clear All
              </Button>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by title, speaker, or scripture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Speaker */}
                <Select value={filterSpeaker} onValueChange={setFilterSpeaker}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Speakers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Speakers</SelectItem>
                    {uniqueSpeakers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Series */}
                <Select value={filterSeries} onValueChange={setFilterSeries}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Series</SelectItem>
                    {uniqueSeries.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year */}
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {uniqueYears.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(searchTerm || filterSpeaker || filterSeries || filterYear) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && <Badge variant="secondary">Search: "{searchTerm}"</Badge>}
                  {filterSpeaker && <Badge variant="secondary">Speaker: {filterSpeaker}</Badge>}
                  {filterSeries && <Badge variant="secondary">Series: {filterSeries}</Badge>}
                  {filterYear && <Badge variant="secondary">Year: {filterYear}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sermons Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sermons...</p>
            </div>
          ) : filteredSermons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No sermons found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterSpeaker || filterSeries || filterYear
                    ? 'Try adjusting your search filters'
                    : 'No sermons available yet'}
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
                  Showing {filteredSermons.length} of {sermons.length} sermons
                </p>
                <div className="text-sm text-gray-500">Sorted by: Most Recent</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSermons.map((s) => (
                  <Card key={s.id} className="flex flex-col hover:shadow-xl transition-all border border-gray-200 overflow-hidden group">
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                      {s.thumbnail_url ? (
                        <img
                          src={s.thumbnail_url}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-16 w-16 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-xs font-medium">
                        {s.series || 'Standalone'}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                        {s.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {s.speaker}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(s.date)}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      {s.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{s.description}</p>
                      )}
                      {s.scripture && (
                        <Badge variant="outline" className="text-xs mb-2">
                          Scripture: {s.scripture}
                        </Badge>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {s.views || 0} views
                          </div>
                          {s.duration_minutes && <div>{s.duration_minutes} min</div>}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link to={`/sermons/${s.id}`} className="flex items-center justify-center">
                          <Play className="mr-2 h-4 w-4" />
                          Watch Now
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-gray-600">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{sermons.length}</div>
                  Total Sermons
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{uniqueSpeakers.length}</div>
                  Different Speakers
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{uniqueSeries.length}</div>
                  Series
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{uniqueYears.length}</div>
                  Years of Content
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Never Miss a Sermon</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter to get notified when new sermons are published
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="flex-grow" />
            <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sermons;
