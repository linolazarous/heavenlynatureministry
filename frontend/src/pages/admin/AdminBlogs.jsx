import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Calendar, User, BookOpen, Tag } from 'lucide-react';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    excerpt: '',
    category: '',
    tags: '',
    image_url: '',
    published: false,
    featured: false
  });

  const blogCategories = [
    'Spiritual Growth',
    'Biblical Teachings',
    'Church Life',
    'Personal Testimony',
    'Mission Work',
    'Family & Relationships',
    'Prayer & Devotion',
    'Current Events'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/api/blog');
      // setBlogs(response.data);
      
      // Mock data for now
      setBlogs([
        {
          id: '1',
          title: 'The Power of Daily Prayer',
          author: 'Pastor John',
          excerpt: 'How establishing a daily prayer routine can transform your spiritual life...',
          category: 'Prayer & Devotion',
          tags: ['prayer', 'spiritual growth', 'routine'],
          published: true,
          featured: true,
          views: 1245,
          likes: 89,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Finding Peace in Turbulent Times',
          author: 'Sarah Williams',
          excerpt: 'Biblical principles for maintaining peace when life gets chaotic...',
          category: 'Spiritual Growth',
          tags: ['peace', 'anxiety', 'trust'],
          published: true,
          featured: false,
          views: 892,
          likes: 67,
          created_at: '2024-01-10T14:45:00Z'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingBlog) {
      toast.success('Blog post updated successfully');
    } else {
      toast.success('Blog post created successfully');
    }
    
    setIsDialogOpen(false);
    resetForm();
    fetchBlogs();
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content || '',
      author: blog.author,
      excerpt: blog.excerpt || '',
      category: blog.category || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
      image_url: blog.image_url || '',
      published: blog.published || false,
      featured: blog.featured || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      // TODO: Implement delete API call
      toast.success('Blog post deleted successfully');
      fetchBlogs();
    }
  };

  const handleTogglePublish = async (blog) => {
    // TODO: Implement publish/unpublish API call
    toast.success(`Blog post ${blog.published ? 'unpublished' : 'published'} successfully`);
    fetchBlogs();
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      author: '',
      excerpt: '',
      category: '',
      tags: '',
      image_url: '',
      published: false,
      featured: false
    });
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-gray-600">Write and manage blog posts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBlog(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? 'Edit Blog Post' : 'Write New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                {editingBlog ? 'Update the blog post content' : 'Create a new blog post for your readers'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="faith, prayer, growth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Featured Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="excerpt">Excerpt (Summary)</Label>
                  <Textarea
                    id="excerpt"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Brief summary of your blog post..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    required
                    placeholder="Write your blog post content here..."
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData({...formData, published: checked})}
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Publish immediately
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Mark as featured post
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBlog ? 'Update Post' : 'Publish Post'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Posts</CardTitle>
          <CardDescription>Find blog posts by title, author, or tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({filteredBlogs.length})</CardTitle>
          <CardDescription>Manage all blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading blog posts...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No blog posts found. {searchTerm && 'Try a different search term.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <div className="font-medium">{blog.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{blog.excerpt}</div>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {blog.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{blog.tags.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {blog.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      {blog.category ? (
                        <Badge variant="outline">{blog.category}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={blog.published ? "default" : "secondary"}>
                          {blog.published ? 'Published' : 'Draft'}
                        </Badge>
                        {blog.featured && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{blog.views}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{blog.likes}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/blog/${blog.id}`} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant={blog.published ? "secondary" : "default"}
                          onClick={() => handleTogglePublish(blog)}
                        >
                          {blog.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBlogs;
