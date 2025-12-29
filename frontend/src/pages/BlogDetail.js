import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '@/api/axios';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark, 
  BookOpen, 
  Clock, 
  Tag, 
  ChevronRight,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [liked, setLiked] = useState(false);
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

  const getReadTime = (content) => {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/blog/${id}`);
      setBlog(response.data);
      
      // Fetch related blogs based on category or tags
      if (response.data.category || response.data.tags?.length > 0) {
        const relatedResponse = await api.get('/api/blog', {
          params: {
            category: response.data.category,
            limit: 3,
            published_only: true
          }
        });
        setRelatedBlogs(relatedResponse.data.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load article');
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleLike = async () => {
    if (!blog) return;
    
    try {
      await api.post(`/api/blog/${blog.id}/like`);
      setBlog(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      setLiked(true);
      toast.success('Thanks for liking this article!');
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like article');
    }
  };

  const handleShare = async (platform) => {
    if (!blog) return;
    
    const url = window.location.href;
    const title = blog.title;
    const text = blog.excerpt || 'Check out this article!';
    
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
    toast.success(!isBookmarked ? 'Article bookmarked!' : 'Bookmark removed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blog')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-blue-800 to-purple-900 text-white py-12"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/blog-detail-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => navigate('/blog')}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
            data-testid="back-to-blog-btn"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {blog.category && (
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    {blog.category}
                  </Badge>
                )}
                {blog.featured && (
                  <Badge className="bg-purple-600 hover:bg-purple-700">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="blog-detail-title">
                {blog.title}
              </h1>
              
              <p className="text-xl text-white/90 max-w-3xl">
                {blog.excerpt || 'An insightful article for spiritual growth...'}
              </p>
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
            {/* Article Content */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="relative h-64 md:h-96">
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white opacity-80" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
                      <Clock className="h-3 w-3 mr-1" />
                      {getReadTime(blog.content)}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={liked ? "text-red-500 hover:text-red-600" : ""}
                        onClick={handleLike}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                        {blog.likes || 0} likes
                      </Button>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{blog.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="mb-6" />
                </CardHeader>
                
                <CardContent>
                  <article className="prose prose-lg max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                      {blog.content}
                    </div>
                    
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="mt-12 pt-8 border-t">
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="h-5 w-5 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900">Article Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                </CardContent>
                
                <CardFooter className="border-t pt-6">
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this Article</h3>
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

              {/* Related Articles */}
              {relatedBlogs.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedBlogs.map((relatedBlog) => (
                      <Card 
                        key={relatedBlog.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => navigate(`/blog/${relatedBlog.id}`)}
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                          {relatedBlog.image_url ? (
                            <img
                              src={relatedBlog.image_url}
                              alt={relatedBlog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-white opacity-80" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-3">
                          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {relatedBlog.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(relatedBlog.created_at)}
                          </div>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="ghost" size="sm" className="w-full">
                            Read Article
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
              {/* Author Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{blog.author}</h3>
                      <p className="text-sm text-gray-500">Article Author</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {blog.author} is a contributor to Heavenly Nature Ministry, sharing insights and teachings to nourish your faith journey.
                  </p>
                </CardContent>
              </Card>

              {/* Article Stats */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Article Stats</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reading Time</span>
                    <span className="font-medium">{getReadTime(blog.content)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">{formatDate(blog.created_at)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{blog.views || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Likes</span>
                    <span className="font-medium">{blog.likes || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <h3 className="font-semibold text-lg text-gray-800">Stay Updated</h3>
                  <p className="text-gray-600 text-sm">
                    Get new articles delivered to your inbox
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              {blog.category && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg">Browse by Category</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to={`/blog?category=${blog.category}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          More in {blog.category}
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/blog">
                          All Categories
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready for More Spiritual Insights?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Explore our collection of articles and teachings to continue your spiritual journey.
          </p>
          <Button 
            onClick={() => navigate('/blog')} 
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Browse All Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
