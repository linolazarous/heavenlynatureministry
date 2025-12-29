import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Heart,
  ArrowUpRight,
  Church,
  BookOpen,
  Calendar,
  MessageSquare,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold mb-2">Stay Connected</h3>
              <p className="text-blue-100 max-w-md">
                Subscribe to our newsletter for weekly updates, event notifications, and spiritual insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-w-[250px]"
              />
              <Button className="bg-white text-blue-800 hover:bg-blue-50 whitespace-nowrap">
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Ministry Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Church className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold">Heavenly Nature Ministry</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              A vibrant community of faith dedicated to spreading God's love, teaching biblical truths, 
              and serving our community in Juba and beyond. We are committed to spiritual growth and transformation.
            </p>
            <div className="flex items-center gap-4">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Registered Non-Profit Organization</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Our Ministry
                </Link>
              </li>
              <li>
                <Link to="/sermons" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sermons & Teachings
                </Link>
              </li>
              <li>
                <Link to="/events" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Spiritual Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/prayer-request" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Heart className="h-4 w-4" />
                  Prayer Requests
                </Link>
              </li>
              <li>
                <Link to="/giving" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <BookOpen className="h-4 w-4" />
                  Online Giving
                </Link>
              </li>
              <li>
                <Link to="/ministries" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Church className="h-4 w-4" />
                  Our Ministries
                </Link>
              </li>
              <li>
                <Link to="/live" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Calendar className="h-4 w-4" />
                  Live Streaming
                </Link>
              </li>
              <li>
                <Link to="/testimonies" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Testimonies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Gudele 2 Joppa Block3</p>
                  <p className="text-gray-400">Juba, South Sudan</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <a href="tel:+211926006202" className="text-gray-400 hover:text-white transition-colors">
                  +211 926 006 202
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a href="mailto:info@heavenlynatureministry.com" className="text-gray-400 hover:text-white transition-colors">
                  info@heavenlynatureministry.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Sunday Services: 9:00 AM & 11:00 AM</p>
                  <p className="text-gray-400 text-sm">Midweek: Wednesday 6:30 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Media */}
            <div>
              <h5 className="text-white text-sm font-semibold mb-3">Connect With Us</h5>
              <div className="flex items-center gap-4">
                <a 
                  href="https://facebook.com/heavenlynatureministry" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors group"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
                <a 
                  href="https://twitter.com/heavenlynature" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
                <a 
                  href="https://instagram.com/heavenlynatureministry" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
                <a 
                  href="https://youtube.com/@heavenlynatureministry" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors group"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                asChild
              >
                <Link to="/giving">
                  Support Our Ministry
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                asChild
              >
                <Link to="/prayer-request">
                  Submit Prayer Request
                </Link>
              </Button>
            </div>
          </div>

          {/* Copyright & Legal */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500">
                  &copy; {currentYear} Heavenly Nature Ministry. All rights reserved.
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Building lives through faith, hope, and love.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/sitemap" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Site Map
                </Link>
                <button 
                  onClick={scrollToTop}
                  className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  Back to Top
                  <ArrowUpRight className="h-3 w-3 rotate-90" />
                </button>
              </div>
            </div>

            {/* Ministry Statement */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600 max-w-3xl mx-auto">
                Heavenly Nature Ministry is a registered faith-based organization in South Sudan. 
                We are committed to spiritual excellence, community development, and spreading the gospel of Jesus Christ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
