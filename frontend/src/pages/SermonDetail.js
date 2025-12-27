import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/api/axios';
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react';

const SermonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSermon();
  }, [id]);

  const fetchSermon = async () => {
    try {
      const response = await api.get(`/sermons/${id}`);
      setSermon(response.data);
    } catch (error) {
      console.error('Error fetching sermon:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading sermon...</p>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Sermon not found</p>
        <Button onClick={() => navigate('/sermons')}>Back to Sermons</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          onClick={() => navigate('/sermons')}
          variant="ghost"
          className="mb-6"
          data-testid="back-to-sermons-btn"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sermons
        </Button>

        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-4" data-testid="sermon-detail-title">{sermon.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {sermon.speaker}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(sermon.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {sermon.views} views
              </div>
            </div>

            {sermon.series && (
              <div className="mb-4">
                <span className="text-sm font-semibold text-blue-600">
                  Series: {sermon.series}
                </span>
              </div>
            )}

            {sermon.scripture && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">
                  Scripture: {sermon.scripture}
                </p>
              </div>
            )}

            {sermon.video_url && (
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={sermon.video_url}
                    controls
                    className="w-full h-full"
                    data-testid="sermon-video-player"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {sermon.audio_url && !sermon.video_url && (
              <div className="mb-6">
                <audio
                  src={sermon.audio_url}
                  controls
                  className="w-full"
                  data-testid="sermon-audio-player"
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}

            {sermon.description && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{sermon.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SermonDetail;
