import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth, useAdminAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout: userLogout } = useUserAuth();
  const { adminUser, logout: adminLogout, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleUserLogout = () => {
    userLogout();
    setIsOpen(false);
    navigate('/');
  };

  const handleAdminLogout = () => {
    adminLogout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/sermons', label: 'Sermons' },
    { to: '/events', label: 'Events' },
    { to: '/blog', label: 'Blog' },
    { to: '/donate', label: 'Donate' },
    { to: '/contact', label: 'Contact' },
  ];

  // Render user dropdown menu
  const renderUserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {user.full_name}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleUserLogout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Render admin dropdown menu
  const renderAdminMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-blue-50 border-blue-200">
          <LayoutDashboard className="h-4 w-4" />
          Admin
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/sermons')} className="cursor-pointer">
          Manage Sermons
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/events')} className="cursor-pointer">
          Manage Events
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/blogs')} className="cursor-pointer">
          Manage Blog
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/donations')} className="cursor-pointer">
          View Donations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/contacts')} className="cursor-pointer">
          View Contacts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAdminLogout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">HNM</span>
            <span className="hidden sm:block text-lg font-semibold text-gray-800">
              Heavenly Nature Ministry
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Authentication buttons */}
            {adminUser ? (
              renderAdminMenu()
            ) : user ? (
              renderUserMenu()
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')} 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t mt-2">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Authentication */}
            <div className="mt-4 pt-4 border-t">
              {adminUser ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">
                    Admin Panel
                  </div>
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/sermons');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Manage Sermons
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="block w-full text-left py-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md mt-2"
                  >
                    Logout Admin
                  </button>
                </>
              ) : user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">
                    Welcome, {user.full_name}
                  </div>
                  <button
                    onClick={handleUserLogout}
                    className="block w-full text-left py-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md mt-2"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
