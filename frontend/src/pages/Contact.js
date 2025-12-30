import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send, Users, Calendar, MessageSquare, Shield, Building } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contact_method: 'email',
    urgency: 'normal',
    department: 'general'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      // Add department to the subject for better organization
      const fullSubject = `${formData.department.toUpperCase()}: ${formData.subject}`;
      
      // Use correct API endpoint with single email handling
      await api.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: fullSubject,
        message: `Department: ${formData.department}\nContact Preference: ${formData.contact_method}\nUrgency: ${formData.urgency}\n\n${formData.message}`
      });
      
      toast.success('Message sent successfully! We will get back to you within 24-48 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contact_method: 'email',
        urgency: 'normal',
        department: 'general'
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactSubjects = [
    'General Inquiry',
    'Prayer Request',
    'Volunteer Opportunity',
    'Donation Question',
    'Event Information',
    'Counseling Request',
    'Membership Inquiry',
    'Pastoral Care',
    'Technical Support',
    'Other'
  ];

  const departments = [
    { value: 'general', label: 'General Inquiry', icon: <Building className="h-4 w-4" /> },
    { value: 'events', label: 'Events & Programs', icon: <Calendar className="h-4 w-4" /> },
    { value: 'pastoral', label: 'Pastoral Care', icon: <Users className="h-4 w-4" /> },
    { value: 'prayer', label: 'Prayer Requests', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'media', label: 'Media & Outreach', icon: <Mail className="h-4 w-4" /> },
    { value: 'technical', label: 'Technical Support', icon: <Shield className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="contact-title">
              Connect With Us
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
              {"We're here to listen, support, and walk with you on your faith journey. Reach out anytime - we'd love to hear from you."}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
              <MessageSquare className="h-4 w-4" />
              <span>Your message matters to us</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              {/* Primary Contact */}
              <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>
                    Get in touch with our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Email Address</p>
                      <a
                        href="mailto:info@heavenlynatureministry.com"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        info@heavenlynatureministry.com
                      </a>
                      <p className="text-xs text-gray-500 mt-1">For all inquiries - Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Phone Support</p>
                      <a
                        href="tel:+211926006202"
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        +211 926 006 202
                      </a>
                      <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9AM-5PM | Urgent: 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Visit Our Church</p>
                      <p className="text-sm text-gray-700">
                        Gudele 2, Joppa Block 3<br />
                        Juba, South Sudan
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Sunday services: 9AM & 11AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 text-green-600 mr-2" />
                    Service Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">Sunday Worship:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        9:00 AM & 11:00 AM
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">Office Hours:</span>
                      <span className="text-gray-600">Mon-Fri, 9AM-5PM</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">Prayer Meetings:</span>
                      <span className="text-gray-600">Wed, 7PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                    Quick Response Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                        <Mail className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>Use our contact form for fastest response</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 rounded-full p-1 mt-0.5">
                        <Clock className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Include your phone number if you prefer a callback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                        <MessageSquare className="h-3 w-3 text-purple-600" />
                      </div>
                      <span>Be specific about your needs for better assistance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center">
                    <Send className="h-6 w-6 text-blue-600 mr-2" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    All messages go to: <span className="font-semibold text-blue-600">info@heavenlynatureministry.com</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Selection */}
                    <div>
                      <Label className="flex items-center mb-3">
                        <span>Department / Inquiry Type</span>
                        <Badge className="ml-2 bg-blue-100 text-blue-700">Helps us route your message</Badge>
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {departments.map((dept) => (
                          <Button
                            key={dept.value}
                            type="button"
                            variant={formData.department === dept.value ? 'default' : 'outline'}
                            onClick={() => setFormData({...formData, department: dept.value})}
                            className="h-auto py-3 flex flex-col items-center justify-center"
                          >
                            <div className="mb-2">{dept.icon}</div>
                            <span className="text-xs">{dept.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="flex items-center mb-2">
                          <span>Full Name *</span>
                          <Badge className="ml-2 bg-blue-100 text-blue-700">Required</Badge>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                          className="h-12"
                          data-testid="contact-name-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center mb-2">
                          <span>Email Address *</span>
                          <Badge className="ml-2 bg-blue-100 text-blue-700">Required</Badge>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          required
                          className="h-12"
                          data-testid="contact-email-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="mb-2">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+211 XXX XXX XXX"
                          className="h-12"
                          data-testid="contact-phone-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="subject" className="flex items-center mb-2">
                          <span>Subject *</span>
                          <Badge className="ml-2 bg-blue-100 text-blue-700">Required</Badge>
                        </Label>
                        <Select 
                          value={formData.subject} 
                          onValueChange={(value) => setFormData({...formData, subject: value})}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {contactSubjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message" className="flex items-center mb-2">
                        <span>Your Message *</span>
                        <Badge className="ml-2 bg-blue-100 text-blue-700">Required</Badge>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={`Please share your ${formData.department === 'prayer' ? 'prayer request' : 'thoughts, questions, or needs'}...`}
                        required
                        className="resize-none"
                        data-testid="contact-message-input"
                      />
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>We read every message personally</span>
                        </div>
                        <span>Minimum 10 characters</span>
                      </div>
                    </div>

                    {/* Contact Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-3 block">How should we respond?</Label>
                        <RadioGroup 
                          value={formData.contact_method} 
                          onValueChange={(value) => setFormData({...formData, contact_method: value})}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email-method" />
                            <Label htmlFor="email-method" className="cursor-pointer">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phone" id="phone-method" />
                            <Label htmlFor="phone-method" className="cursor-pointer">Phone Call</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="mb-3 block">How urgent is this?</Label>
                        <RadioGroup 
                          value={formData.urgency} 
                          onValueChange={(value) => setFormData({...formData, urgency: value})}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="normal-urgency" />
                            <Label htmlFor="normal-urgency" className="cursor-pointer">Normal (24-48h)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="urgent" id="urgent-urgency" />
                            <Label htmlFor="urgent-urgency" className="cursor-pointer text-orange-600">
                              Urgent (&lt;2h)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-blue-700">Your message will be sent to:</p>
                          <p className="text-blue-600">info@heavenlynatureministry.com</p>
                          <p className="text-xs text-gray-600 mt-1">
                            The {formData.department} team will review and respond to your inquiry
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-6 text-lg"
                      disabled={submitting}
                      data-testid="contact-submit-btn"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Sending Message...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="mr-2 h-5 w-5" />
                          Send Message to {formData.department} Team
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="border-t bg-gray-50">
                  <div className="text-center text-sm text-gray-600 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Your information is secure and private</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Response time: 24-48 hours</span>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Response Time */}
              <Card className="mt-6 border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">What Happens Next?</h3>
                      <p className="text-sm text-gray-600">
                        1. Your message is sent to our main email inbox<br/>
                        2. Our team reviews and categorizes it by department<br/>
                        3. The appropriate team member responds within 24-48 hours<br/>
                        4. For urgent matters, we'll call you within 2 hours if you provide a phone number
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Location & Visit */}
          <div className="mt-12">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <CardTitle>Visit Our Church</CardTitle>
                <CardDescription className="text-blue-100">
                  Come worship with us in person
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 md:h-96 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="bg-white rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Building className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Heavenly Nature Ministry</h3>
                    <p className="text-gray-600 mb-2">Gudele 2, Joppa Block 3, Juba, South Sudan</p>
                    <div className="space-y-1 text-sm text-gray-500 mb-4">
                      <p>Sunday Worship: 9:00 AM & 11:00 AM</p>
                      <p>Wednesday Prayer: 7:00 PM</p>
                      <p>Office Hours: Monday-Friday, 9:00 AM - 5:00 PM</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        <a 
                          href="https://maps.google.com/?q=Gudele+2+Joppa+Block+3+Juba+South+Sudan" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <a 
                          href="mailto:info@heavenlynatureministry.com?subject=Visiting%20Your%20Church&body=I%20plan%20to%20visit%20this%20Sunday.%20Please%20let%20me%20know%20what%20to%20expect."
                          className="flex items-center"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email About Visiting
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Single Email Notice */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-start gap-4 mb-4 md:mb-0">
                <div className="bg-blue-100 rounded-full p-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">One Email for Everything</h3>
                  <p className="text-gray-600">
                    We use a single email address (<span className="font-semibold text-blue-600">info@heavenlynatureministry.com</span>) 
                    for all communications. This ensures no message gets lost and allows our team to efficiently 
                    route your inquiry to the right person.
                  </p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                <a href="mailto:info@heavenlynatureministry.com" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us Directly
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
