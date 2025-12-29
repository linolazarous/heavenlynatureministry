import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Filter, Mail, Phone, Calendar, Eye, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/api/contact');
      // setContacts(response.data);
      
      // Mock data for now
      setContacts([
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+211 123 456 789',
          subject: 'Prayer Request',
          message: 'Please pray for my family during this difficult time.',
          status: 'new',
          created_at: '2024-01-20T10:30:00Z',
          ip_address: '192.168.1.1'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+211 987 654 321',
          subject: 'Volunteer Opportunity',
          message: 'I would like to volunteer for the children\'s ministry.',
          status: 'read',
          created_at: '2024-01-18T14:45:00Z',
          ip_address: '192.168.1.2'
        },
        {
          id: '3',
          name: 'Michael Brown',
          email: 'michael@example.com',
          phone: '',
          subject: 'General Inquiry',
          message: 'What are your service times on Sunday?',
          status: 'replied',
          created_at: '2024-01-15T09:15:00Z',
          ip_address: '192.168.1.3'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>;
      case 'read':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Read</Badge>;
      case 'replied':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Replied</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);
    
    // Mark as read when viewing
    if (contact.status === 'new') {
      handleUpdateStatus(contact.id, 'read');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // TODO: Implement API call to update status
      // await api.put(`/api/contact/${id}/status`, { status: newStatus });
      
      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, status: newStatus } : contact
      ));
      
      if (selectedContact?.id === id) {
        setSelectedContact({...selectedContact, status: newStatus});
      }
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      // TODO: Implement email sending API call
      // await api.post(`/api/contact/${selectedContact.id}/reply`, { message: replyMessage });
      
      handleUpdateStatus(selectedContact.id, 'replied');
      setReplyMessage('');
      toast.success('Reply sent successfully');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    new: contacts.filter(c => c.status === 'new').length,
    total: contacts.length,
    replied: contacts.filter(c => c.status === 'replied').length
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Submissions</h1>
          <p className="text-gray-600">Manage messages from visitors</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-sm text-gray-600">New Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <p className="text-sm text-gray-600">Replied Messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find contact submissions by name, email, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages ({filteredContacts.length})</CardTitle>
          <CardDescription>All messages from the contact form</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages found. {searchTerm && 'Try a different search term.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className={
                    contact.status === 'new' ? 'bg-blue-50 hover:bg-blue-100' : ''
                  }>
                    <TableCell>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{contact.subject}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{contact.message}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(contact.status)}
                        {contact.status === 'new' && (
                          <Badge className="animate-pulse bg-red-100 text-red-800">
                            New
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(contact)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {contact.status !== 'replied' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleUpdateStatus(contact.id, 'replied')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {contact.status === 'new' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleUpdateStatus(contact.id, 'read')}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Complete information about this contact submission
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="font-semibold">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-semibold">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="font-semibold">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p>{new Date(selectedContact.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Subject and Message */}
              <div>
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p className="font-semibold text-lg mt-1">{selectedContact.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Message</p>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Technical Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-2">{getStatusBadge(selectedContact.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">IP Address</p>
                  <code className="text-sm bg-gray-100 p-1 rounded">{selectedContact.ip_address}</code>
                </div>
              </div>

              {/* Reply Section */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-500 mb-3">Reply to {selectedContact.name}</p>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={selectedContact.status === 'read' ? 'default' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedContact.id, 'read')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Mark as Read
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedContact.status === 'replied' ? 'default' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedContact.id, 'replied')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Replied
                    </Button>
                  </div>
                  <Button onClick={handleReply}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContacts;
