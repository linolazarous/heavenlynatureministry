import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/api/axios';
import { Play, Search } from 'lucide-react';

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const response = await api.get('/sermons');
      setSermons(response.data);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSermons = sermons.filter((sermon) =>
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sermon.series && sermon.series.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4" data-testid="sermons-title">Sermons</h1>
          <p className="text-xl text-blue-100">
            Watch and listen to inspiring messages
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search sermons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="sermon-search-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading sermons...</p>
            </div>
          ) : filteredSermons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No sermons found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSermons.map((sermon) => (
                <Card key={sermon.id} className="flex flex-col" data-testid={`sermon-card-${sermon.id}`}>
                  <div className="relative">
                    {sermon.thumbnail_url ? (
                      <img
                        src={sermon.thumbnail_url}
                        alt={sermon.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-lg flex items-center justify-center">
                        <Play className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{sermon.title}</CardTitle>
                    <CardDescription>
                      <div>{sermon.speaker}</div>
                      <div className="text-xs mt-1">
                        {new Date(sermon.date).toLocaleDateString()}
                      </div>
                      {sermon.series && (
                        <div className="text-xs mt-1 text-blue-600">
                          Series: {sermon.series}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {sermon.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {sermon.description}
                      </p>
                    )}
                    <Button asChild className="w-full">
                      <Link to={`/sermons/${sermon.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sermons;
