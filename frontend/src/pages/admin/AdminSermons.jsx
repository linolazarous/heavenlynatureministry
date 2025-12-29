import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Calendar, User, Play } from 'lucide-react';

const AdminSermons = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    audio_url: '',
    video_url: '',
    thumbnail_url: '',
    series: '',
    scripture: '',
    duration_minutes: ''
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/api/sermons');
      // setSermons(response.data);
      
      // Mock data for now
      setSermons([
        {
          id: '1',
          title: 'The Power of Faith',
          speaker: 'Pastor John',
          description: 'A message about the transformative power of faith in our daily lives.',
          date: '2024-01-15',
          views: 1245,
          series: 'Faith Journey',
          scripture: 'Hebrews 11:1'
        },
        {
          id: '2',
          title: 'God\'s Grace',
          speaker: 'Pastor Sarah',
          description: 'Understanding and receiving God\'s unmerited favor.',
          date: '2024-01-08',
          views: 892,
          series: 'Grace Series',
          scripture: 'Ephesians 2:8-9'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingSermon) {
      toast.success('Sermon updated successfully');
    } else {
      toast.success('Sermon created successfully');
    }
    
    setIsDialogOpen(false);
    resetForm();
    fetchSermons();
  };

  const handleEdit = (sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title,
      speaker: sermon.speaker,
      description: sermon.description || '',
      date: sermon.date.split('T')[0],
      audio_url: sermon.audio_url || '',
      video_url: sermon.video_url || '',
      thumbnail_url: sermon.thumbnail_url || '',
      series: sermon.series || '',
      scripture: sermon.scripture || '',
      duration_minutes: sermon.duration_minutes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sermon?')) {
      // TODO: Implement delete API call
      toast.success('Sermon deleted successfully');
      fetchSermons();
    }
  };

  const resetForm = () => {
    setEditingSermon(null);
    setFormData({
      title: '',
      speaker: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      audio_url: '',
      video_url: '',
      thumbnail_url: '',
      series: '',
      scripture: '',
      duration_minutes: ''
    });
  };

  const filteredSermons = sermons.filter(sermon =>
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sermon.series?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sermons Management</h1>
          <p className="text-gray-600">Manage and publish sermons</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSermon(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSermon ? 'Edit Sermon' : 'Add New Sermon'}
              </DialogTitle>
              <DialogDescription>
                {editingSermon ? 'Update the sermon details' : 'Add a new sermon to your library'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker *</Label>
                  <Input
                    id="speaker"
                    value={formData.speaker}
                    onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="series">Series (Optional)</Label>
                  <Input
                    id="series"
                    value={formData.series}
                    onChange={(e) => setFormData({...formData, series: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scripture">Scripture Reference (Optional)</Label>
                  <Input
                    id="scripture"
                    value={formData.scripture}
                    onChange={(e) => setFormData({...formData, scripture: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes, Optional)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audio_url">Audio URL (Optional)</Label>
                  <Input
                    id="audio_url"
                    type="url"
                    value={formData.audio_url}
                    onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL (Optional)</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSermon ? 'Update Sermon' : 'Create Sermon'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find sermons by title, speaker, or series</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sermons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sermons ({filteredSermons.length})</CardTitle>
          <CardDescription>Manage all published sermons</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading sermons...</div>
          ) : filteredSermons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sermons found. {searchTerm && 'Try a different search term.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSermons.map((sermon) => (
                  <TableRow key={sermon.id}>
                    <TableCell>
                      <div className="font-medium">{sermon.title}</div>
                      {sermon.scripture && (
                        <div className="text-sm text-gray-500">{sermon.scripture}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {sermon.speaker}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {new Date(sermon.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sermon.series ? (
                        <Badge variant="outline">{sermon.series}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-gray-500" />
                        {sermon.views.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/sermons/${sermon.id}`} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(sermon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sermon.id)}>
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

export default AdminSermons;
