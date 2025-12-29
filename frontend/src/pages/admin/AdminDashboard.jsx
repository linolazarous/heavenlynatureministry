import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import api from '@/api/axios';
import { Users, BookOpen, Calendar, Heart, Mail, DollarSign, Play, TrendingUp, AlertCircle, Clock, Eye, ArrowRight, BarChart3, Shield, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await api.get('/api/stats');
      setStats(statsResponse.data);

      // Fetch recent activity (you'll need to create this endpoint)
      // const activityResponse = await api.get('/api/activity');
      // setRecentActivity(activityResponse.data);
      
      // Mock recent activity for now
      setRecentActivity([
        { id: 1, type: 'donation', title: 'New donation received', user: 'John Smith', time: '2 hours ago', amount: 100 },
        { id: 2, type: 'contact', title: 'New prayer request', user: 'Sarah Johnson', time: '4 hours ago' },
        { id: 3, type: 'sermon', title: 'Sermon uploaded', user: 'Pastor John', time: '1 day ago', item: 'The Power of Faith' },
        { id: 4, type: 'event', title: 'Event registration closed', user: 'System', time: '2 days ago', item: 'Youth Bible Study' },
        { id: 5, type: 'user', title: 'New user registered', user: 'Michael Brown', time: '3 days ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add New Sermon', icon: Play, link: '/admin/sermons', color: 'bg-gradient-to-r from-blue-500 to-blue-600', description: 'Upload new sermon' },
    { title: 'Create Event', icon: Calendar, link: '/admin/events', color: 'bg-gradient-to-r from-green-500 to-green-600', description: 'Schedule new event' },
    { title: 'Write Blog Post', icon: BookOpen, link: '/admin/blogs', color: 'bg-gradient-to-r from-purple-500 to-purple-600', description: 'Publish blog article' },
    { title: 'View Donations', icon: DollarSign, link: '/admin/donations', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600', description: 'Check contributions' },
    { title: 'Check Messages', icon: Mail, link: '/admin/contacts', color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Review inquiries' },
    { title: 'User Analytics', icon: Users, link: '/admin/users', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', description: 'View user stats' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'donation': return <DollarSign className="h-4 w-4" />;
      case 'contact': return <Mail className="h-4 w-4" />;
      case 'sermon': return <Play className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'donation': return 'bg-green-100 text-green-600';
      case 'contact': return 'bg-blue-100 text-blue-600';
      case 'sermon': return 'bg-purple-100 text-purple-600';
      case 'event': return 'bg-yellow-100 text-yellow-600';
      case 'user': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="admin-dashboard-title">
                Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-blue-100">Welcome back, <span className="font-semibold">{user?.full_name}</span></p>
                <Badge className="bg-white/20 hover:bg-white/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-sm text-blue-200">Last updated</div>
                <div className="text-sm">Just now</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white text-white hover:bg-white/10"
                onClick={fetchDashboardData}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-users">
                  {stats?.users || 0}
                </div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sermons</CardTitle>
                <div className="bg-purple-100 p-2 rounded-full">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-sermons">
                  {stats?.sermons || 0}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{stats?.sermons || 0} total views</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-events">
                  {stats?.upcoming_events || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {stats?.events || 0} total events
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-100 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-donations">
                  ${stats?.donation_amount?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">
                  {stats?.donations || 0} successful donations
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Quick access to frequently used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    asChild
                    className={`h-28 flex flex-col items-center justify-center p-4 ${action.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    <Link to={action.link}>
                      <div className="mb-2">
                        <action.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium text-center">{action.title}</span>
                      <span className="text-xs opacity-90 mt-1">{action.description}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Blog Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                      Blog Statistics
                    </CardTitle>
                    <CardDescription>Published articles and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">{stats?.published_blogs || 0}</div>
                          <div className="text-sm text-gray-600">Published Posts</div>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Most Popular Category:</span>
                          <span className="font-semibold">Spiritual Growth</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average Views per Post:</span>
                          <span className="font-semibold">245</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/admin/blogs" className="flex items-center justify-center">
                        Manage Blog Posts
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Contact Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-600" />
                      Contact Submissions
                    </CardTitle>
                    <CardDescription>Messages and response tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">{stats?.new_contact_submissions || 0}</div>
                          <div className="text-sm text-gray-600">New Messages</div>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Response Rate:</span>
                          <span className="font-semibold text-green-600">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Avg Response Time:</span>
                          <span className="font-semibold">4.2 hours</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/admin/contacts" className="flex items-center justify-center">
                        Review Messages
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    System Health
                  </CardTitle>
                  <CardDescription>Current system status and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Backend API</div>
                          <div className="text-sm text-gray-600">Operational</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Payment Processing</div>
                          <div className="text-sm text-gray-600">Stripe Active</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Database</div>
                          <div className="text-sm text-gray-600">Connected</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity to display
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`p-3 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              <Badge variant="outline" className="ml-2">
                                {activity.time}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              By {activity.user}
                              {activity.item && ` • ${activity.item}`}
                            </p>
                            {activity.amount && (
                              <div className="flex items-center mt-2">
                                <Badge className="bg-green-100 text-green-700">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  ${activity.amount}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Analytics and growth metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Monthly Growth</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">+24%</div>
                          <div className="text-sm text-gray-600">User Growth</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">+18%</div>
                          <div className="text-sm text-gray-600">Engagement</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">+32%</div>
                          <div className="text-sm text-gray-600">Content Views</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">+15%</div>
                          <div className="text-sm text-gray-600">Donations</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Top Performing Content</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center">
                            <Play className="h-4 w-4 text-blue-600 mr-2" />
                            <span>"The Power of Faith" - Sermon</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            1,245 views
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-purple-600 mr-2" />
                            <span>"Finding Peace" - Blog Post</span>
                          </div>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            892 views
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-600 mr-2" />
                            <span>Youth Bible Study - Event</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            45 registrations
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Quick Recommendations</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>Consider adding more youth-focused content based on recent engagement trends</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Sermons published on Sundays receive 40% more views</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Email newsletter subscribers are 3x more likely to donate</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
