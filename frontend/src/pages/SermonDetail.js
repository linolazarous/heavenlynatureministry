import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import api from '@/api/axios';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Play, 
  Download, 
  Share2, 
  Bookmark, 
  Headphones,
  Video,
  Clock,
  Tag,
  ChevronRight,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const SermonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedSermons, setRelatedSermons] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const fetchSermon = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sermons/${id}`);
      setSermon(response.data);
      
      // Fetch related sermons based on series or speaker
      if (response.data.series || response.data.speaker) {
        const relatedResponse = await api.get('/api/sermons', {
          params: {
            series: response.data.series,
            speaker: response.data.speaker,
            limit: 3
          }
        });
        setRelatedSermons(relatedResponse.data.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error fetching sermon:', error);
      toast.error('Failed to load sermon');
      setSermon(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSermon();
  }, [fetchSermon]);

  const handleDownload = async () => {
    if (!sermon || !sermon.audio_url) return;
    
    try {
      await api.post(`/api/sermons/${sermon.id}/download`);
      setDownloadCount(prev => prev + 1);
      
      // Trigger actual download
      const link = document.createElement('a');
      link.href = sermon.audio_url;
      link.download = `${sermon.title.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Sermon download started!');
    } catch (error) {
      console.error('Error downloading sermon:', error);
      toast.error('Failed to download sermon');
    }
  };

  const handleShare = async (platform) => {
    if (!sermon) return;
    
    const url = window.location.href;
    const title = sermon.title;
    const text = sermon.description || 'Check out this sermon!';
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: title,
            text: text,
            url: url,
          });
        } else {
          navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        }
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(!isBookmarked ? 'Sermon bookmarked!' : 'Bookmark removed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sermon...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center">
          <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sermon Not Found</h2>
          <p className="text-gray-600 mb-6">The sermon you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/sermons')} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sermons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-12"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/sermon-detail-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => navigate('/sermons')}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
            data-testid="back-to-sermons-btn"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sermons
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {sermon.series && (
                  <Badge className="bg-purple-600 hover:bg-purple-700">
                    {sermon.series}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {sermon.duration_minutes ? formatDuration(sermon.duration_minutes) : 'Sermon'}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="sermon-detail-title">
                {sermon.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{sermon.speaker}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(sermon.date)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant={isBookmarked ? "default" : "outline"} 
                className={isBookmarked ? "bg-yellow-500 hover:bg-yellow-600" : "text-white border-white/30 hover:bg-white/20"}
                onClick={toggleBookmark}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button 
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/20"
                onClick={() => handleShare()}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sermon Content */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                {/* Media Player */}
                <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                  {sermon.video_url ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Video className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Video Sermon</h3>
                      </div>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          src={sermon.video_url}
                          controls
                          className="w-full h-full"
                          data-testid="sermon-video-player"
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      {sermon.audio_url && (
                        <div className="mt-4">
                          <Button variant="outline" className="w-full" asChild>
                            <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer">
                              <Headphones className="h-4 w-4 mr-2" />
                              Listen to Audio Version
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : sermon.audio_url ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Headphones className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Audio Sermon</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <audio
                          src={sermon.audio_url}
                          controls
                          className="w-full"
                          data-testid="sermon-audio-player"
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                        >
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleDownload}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Audio
                        </Button>
                        <Button variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Transcript
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Media Not Available</h3>
                      <p className="text-gray-500">This sermon is currently not available for streaming.</p>
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{sermon.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Download className="h-4 w-4" />
                        <span>{sermon.downloads + downloadCount || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="mb-6" />
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {sermon.scripture && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900">Scripture Reference</h3>
                      </div>
                      <p className="text-lg font-medium text-gray-800">{sermon.scripture}</p>
                    </div>
                  )}
                  
                  {sermon.description && (
                    <div className="prose prose-lg max-w-none">
                      <h2 className="text-2xl font-bold mb-4">Sermon Description</h2>
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {sermon.description}
                      </div>
                    </div>
                  )}
                  
                  {sermon.thumbnail_url && (
                    <div className="mt-6">
                      <img
                        src={sermon.thumbnail_url}
                        alt={sermon.title}
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t pt-6">
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this Sermon</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" onClick={() => handleShare('copy')}>
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare('twitter')} className="text-blue-500 hover:text-blue-600">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare('facebook')} className="text-blue-700 hover:text-blue-800">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')} className="text-blue-600 hover:text-blue-700">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Related Sermons */}
              {relatedSermons.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Related Sermons</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedSermons.map((relatedSermon) => (
                      <Card 
                        key={relatedSermon.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => navigate(`/sermons/${relatedSermon.id}`)}
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
                          {relatedSermon.thumbnail_url ? (
                            <img
                              src={relatedSermon.thumbnail_url}
                              alt={relatedSermon.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Headphones className="h-12 w-12 text-white opacity-80" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Play className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <CardHeader className="pb-3">
                          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {relatedSermon.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{relatedSermon.speaker}</span>
                            <span>{formatDate(relatedSermon.date)}</span>
                          </div>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="ghost" size="sm" className="w-full">
                            Listen Now
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sermon Stats */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Sermon Details</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date Preached</span>
                    <span className="font-medium">{formatDate(sermon.date)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Speaker</span>
                    <span className="font-medium">{sermon.speaker}</span>
                  </div>
                  <Separator />
                  {sermon.duration_minutes && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{formatDuration(sermon.duration_minutes)}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  {sermon.series && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Series</span>
                        <span className="font-medium">{sermon.series}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{sermon.views || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-medium">{sermon.downloads + downloadCount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Speaker Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{sermon.speaker}</h3>
                      <p className="text-sm text-gray-500">Speaker</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {sermon.speaker} is a dedicated minister sharing God's word through powerful sermons and teachings.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/sermons?speaker=${sermon.speaker}`}>
                      More from {sermon.speaker}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Series Info */}
              {sermon.series && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg">Series: {sermon.series}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      This sermon is part of the "{sermon.series}" series. Explore other messages in this series.
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                      <Link to={`/sermons?series=${sermon.series}`}>
                        <Headphones className="h-4 w-4 mr-2" />
                        View Series
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Download Options */}
              {sermon.audio_url && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg">Download Options</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      MP3 Audio
                    </Button>
                    {sermon.video_url && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={sermon.video_url} download target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          MP4 Video
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      PDF Transcript
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Explore More Sermons</h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Discover more messages and teachings to strengthen your faith journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/sermons')} 
              size="lg"
              className="bg-white text-purple-700 hover:bg-purple-50"
            >
              <Headphones className="mr-2 h-5 w-5" />
              Browse All Sermons
            </Button>
            <Button 
              onClick={() => navigate('/sermons?series=' + (sermon.series || ''))} 
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/20"
            >
              View Series
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonDetail;
