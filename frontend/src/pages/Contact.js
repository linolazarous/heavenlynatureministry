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
    department: 'general',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      const fullSubject = `${formData.department.toUpperCase()}: ${formData.subject}`;
      await api.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: fullSubject,
        message: `Department: ${formData.department}\nContact Preference: ${formData.contact_method}\nUrgency: ${formData.urgency}\n\n${formData.message}`,
      });

      toast.success('Message sent successfully! We will get back to you within 24-48 hours.');

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contact_method: 'email',
        urgency: 'normal',
        department: 'general',
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message. Please try again.');
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
    'Other',
  ];

  const departments = [
    { value: 'general', label: 'General Inquiry', icon: <Building className="h-4 w-4" /> },
    { value: 'events', label: 'Events & Programs', icon: <Calendar className="h-4 w-4" /> },
    { value: 'pastoral', label: 'Pastoral Care', icon: <Users className="h-4 w-4" /> },
    { value: 'prayer', label: 'Prayer Requests', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'media', label: 'Media & Outreach', icon: <Mail className="h-4 w-4" /> },
    { value: 'technical', label: 'Technical Support', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section
        className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="contact-title">
            Connect With Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
            We're here to listen, support, and walk with you on your faith journey. Reach out anytime - we'd love to hear from you.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
            <MessageSquare className="h-4 w-4" />
            <span>Your message matters to us</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  Contact Information
                </CardTitle>
                <CardDescription>Get in touch with our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />,
                    title: 'Email Address',
                    content: (
                      <a href="mailto:info@heavenlynatureministry.com" className="text-sm text-blue-600 hover:underline break-all">
                        info@heavenlynatureministry.com
                      </a>
                    ),
                    note: 'For all inquiries - Response within 24 hours',
                  },
                  {
                    icon: <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />,
                    title: 'Phone Support',
                    content: (
                      <a href="tel:+211926006202" className="text-sm text-gray-700 hover:text-blue-600">
                        +211 926 006 202
                      </a>
                    ),
                    note: 'Mon-Fri, 9AM-5PM | Urgent: 24/7',
                  },
                  {
                    icon: <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />,
                    title: 'Visit Our Church',
                    content: <p className="text-sm text-gray-700">Gudele 2, Joppa Block 3, Juba, South Sudan</p>,
                    note: 'Sunday services: 9AM & 11AM',
                  },
                ].map((info, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    {info.icon}
                    <div>
                      <p className="font-semibold text-sm">{info.title}</p>
                      {info.content}
                      <p className="text-xs text-gray-500 mt-1">{info.note}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Times */}
            <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  Service Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Sunday Worship:', value: '9:00 AM & 11:00 AM', badge: true },
                  { label: 'Office Hours:', value: 'Mon-Fri, 9AM-5PM' },
                  { label: 'Prayer Meetings:', value: 'Wed, 7PM' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="font-medium">{item.label}</span>
                    {item.badge ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {item.value}
                      </Badge>
                    ) : (
                      <span className="text-gray-600">{item.value}</span>
                    )}
                  </div>
                ))}
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
                  {[
                    { icon: <Mail className="h-3 w-3 text-blue-600" />, text: 'Use our contact form for fastest response', bg: 'bg-blue-100' },
                    { icon: <Clock className="h-3 w-3 text-green-600" />, text: 'Include your phone number if you prefer a callback', bg: 'bg-green-100' },
                    { icon: <MessageSquare className="h-3 w-3 text-purple-600" />, text: 'Be specific about your needs for better assistance', bg: 'bg-purple-100' },
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className={`${tip.bg} rounded-full p-1 mt-0.5`}>{tip.icon}</div>
                      <span>{tip.text}</span>
                    </li>
                  ))}
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
                      Department / Inquiry Type
                      <Badge className="ml-2 bg-blue-100 text-blue-700">Helps us route your message</Badge>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {departments.map((dept) => (
                        <Button
                          key={dept.value}
                          type="button"
                          variant={formData.department === dept.value ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, department: dept.value })}
                          className="h-auto py-3 flex flex-col items-center justify-center"
                        >
                          <div className="mb-2">{dept.icon}</div>
                          <span className="text-xs">{dept.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="flex items-center mb-2">
                        Full Name *
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
                        Email Address *
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
                      <Label htmlFor="phone" className="mb-2">
                        Phone Number (Optional)
                      </Label>
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
                        Subject *
                        <Badge className="ml-2 bg-blue-100 text-blue-700">Required</Badge>
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
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
                      Your Message *
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

                  {/* Contact Method & Urgency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-3 block">How should we respond?</Label>
                      <RadioGroup
                        value={formData.contact_method}
                        onValueChange={(value) => setFormData({ ...formData, contact_method: value })}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email-method" />
                          <Label htmlFor="email-method" className="cursor-pointer">
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="phone-method" />
                          <Label htmlFor="phone-method" className="cursor-pointer">
                            Phone Call
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="mb-3 block">How urgent is this?</Label>
                      <RadioGroup
                        value={formData.urgency}
                        onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id="normal-urgency" />
                          <Label htmlFor="normal-urgency" className="cursor-pointer">
                            Normal (24-48h)
                          </Label>
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

                  {/* Info Notice */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-blue-700">Your message will be sent to:</p>
                      <p className="text-blue-600">info@heavenlynatureministry.com</p>
                      <p className="text-xs text-gray-600 mt-1">
                        The {formData.department} team will review and respond to your inquiry
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
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

            {/* Response Timeline */}
            <Card className="mt-6 border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">What Happens Next?</h3>
                    <p className="text-sm text-gray-600">
                      1. Your message is sent to our main email inbox<br />
                      2. Our team reviews and categorizes it by department<br />
                      3. The appropriate team member responds within 24-48 hours<br />
                      4. For urgent matters, we'll call you within 2 hours if you provide a phone number
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Church Visit Section */}
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
      </section>
    </div>
  );
};

export default Contact;
