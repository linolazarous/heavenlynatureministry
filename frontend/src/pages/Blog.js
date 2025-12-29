import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/api/axios';
import { Calendar, User, Eye, Search, BookOpen, Tag, Filter, TrendingUp, Clock, Heart, Share2, ArrowRight, ChevronRight } from 'lucide-react';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueTags, setUniqueTags] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (blogs.length > 0) {
      // Extract unique categories
      const categories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];
      setUniqueCategories(categories);
      
      // Extract unique tags
      const allTags = blogs.flatMap(blog => blog.tags || []);
      const uniqueTagSet = [...new Set(allTags)];
      setUniqueTags(uniqueTagSet);
      
      // Find featured blog
      const featured = blogs.find(blog => blog.featured) || blogs[0];
      setFeaturedBlog(featured);
    }
  }, [blogs]);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/api/blog');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const filteredBlogs = blogs
    .filter((blog) => {
      const matchesSearch = 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.content && blog.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory = !filterCategory || blog.category === filterCategory;
      const matchesTag = !filterTag || (blog.tags && blog.tags.includes(filterTag));

      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterTag('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-blue-800 to-purple-900 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="blog-title">
              Spiritual Insights & Teachings
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
              Discover articles, reflections, and biblical teachings to nourish your faith journey
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
              <BookOpen className="h-4 w-4" />
              <span>{blogs.length} articles to explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <Card className="mb-8 border-blue-100 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Filter Articles</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search articles by title, author, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="blog-search-input"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag Filter */}
                <div>
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tags</SelectItem>
                      {uniqueTags.slice(0, 20).map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="likes">Most Liked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || filterCategory || filterTag) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {filterCategory && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Category: {filterCategory}
                    </Badge>
                  )}
                  {filterTag && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Tag: {filterTag}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Blog */}
          {featuredBlog && !searchTerm && !filterCategory && !filterTag && (
            <div className="mb-12">
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-full">
                    {featuredBlog.image_url ? (
                      <img
                        src={featuredBlog.image_url}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600 hover:bg-blue-700">Featured</Badge>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {featuredBlog.category || 'Teaching'}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {getReadTime(featuredBlog.content)}
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl mb-4">{featuredBlog.title}</CardTitle>
                    <CardDescription className="mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {featuredBlog.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {formatDate(featuredBlog.created_at)}
                        </div>
                      </div>
                    </CardDescription>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {featuredBlog.excerpt || featuredBlog.content.substring(0, 200) + '...'}
                    </p>
                    
                    {featuredBlog.tags && featuredBlog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredBlog.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {featuredBlog.views || 0} views
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {featuredBlog.likes || 0} likes
                        </div>
                      </div>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link to={`/blog/${featuredBlog.id}`} className="flex items-center">
                          Read Full Article
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tabs for Different Views */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Articles</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
              {uniqueCategories.slice(0, 3).map(category => (
                <TabsTrigger key={category} value={category.toLowerCase()}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Blog Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No articles found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterCategory || filterTag 
                    ? "Try adjusting your search filters"
                    : "No blog articles available yet"}
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
                  Showing {filteredBlogs.length} of {blogs.length} articles
                </p>
                <div className="text-sm text-gray-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sorted by: {sortBy === 'newest' ? 'Newest' : 
                             sortBy === 'oldest' ? 'Oldest' : 
                             sortBy === 'popular' ? 'Popular' : 'Likes'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <Card 
                    key={blog.id} 
                    className="flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                    data-testid={`blog-card-${blog.id}`}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      {blog.image_url ? (
                        <img
                          src={blog.image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        {blog.featured ? (
                          <Badge className="bg-blue-600 hover:bg-blue-700">Featured</Badge>
                        ) : blog.category && (
                          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                            {blog.category}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {blog.author}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(blog.created_at)}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      {blog.excerpt && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{blog.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {blog.views || 0} views
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {blog.likes || 0} likes
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getReadTime(blog.content)}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 group">
                        <Link to={`/blog/${blog.id}`} className="flex items-center justify-center">
                          Read Article
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Categories & Tags */}
          {uniqueCategories.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Browse by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {uniqueCategories.map(category => (
                        <Button
                          key={category}
                          variant={filterCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterCategory(category)}
                          className="mb-2"
                        >
                          {category}
                          <span className="ml-2 text-xs opacity-70">
                            ({blogs.filter(b => b.category === category).length})
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Tags */}
                {uniqueTags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-purple-600" />
                        Popular Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTags.slice(0, 15).map(tag => (
                          <Badge
                            key={tag}
                            variant={filterTag === tag ? "default" : "outline"}
                            className="cursor-pointer mb-2 hover:bg-blue-50"
                            onClick={() => setFilterTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive new articles, spiritual insights, and ministry updates directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-grow"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
