import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Lock, User, Shield, ArrowRight, Eye, EyeOff, Key } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('Welcome back! Login successful.');
        navigate('/', { replace: true });
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implement password reset functionality
    toast.info('Password reset instructions will be sent to your email.');
    // In the future, implement: navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Welcome Section */}
        <div className="hidden lg:block">
          <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back to Our Community</CardTitle>
              <CardDescription className="text-blue-100">
                Continue your spiritual journey with us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal Dashboard</h3>
                    <p className="text-sm text-blue-100">
                      Access your saved sermons, prayer history, and personal notes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Event Registration</h3>
                    <p className="text-sm text-blue-100">
                      Quickly register for upcoming church events and Bible studies
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure & Private</h3>
                    <p className="text-sm text-blue-100">
                      Your spiritual journey is personal - we protect your data with industry-standard encryption
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <h3 className="font-semibold mb-2">New to our community?</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Join thousands of believers growing in faith together
                </p>
                <Button asChild variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  <Link to="/register" className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3">
                <Key className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl" data-testid="login-title">
              Sign In to Your Account
            </CardTitle>
            <CardDescription>
              Access your personalized spiritual dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="flex items-center mb-2">
                  <Mail className="h-4 w-4 text-blue-600 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12"
                  data-testid="login-email-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="flex items-center">
                    <Lock className="h-4 w-4 text-blue-600 mr-2" />
                    Password *
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleForgotPassword}
                    className="text-blue-600 hover:text-blue-700 text-sm h-auto p-0"
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 pr-10"
                    data-testid="login-password-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          password.length >= 8 ? 'bg-green-500' : 
                          password.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((password.length / 12) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {password.length >= 8 ? 'Strong password' : 
                       password.length >= 6 ? 'Medium password' : 'Weak password'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Key className="mr-2 h-5 w-5" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="text-center text-sm text-gray-600 w-full">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure login with 256-bit SSL encryption</span>
              </div>
              
              <div className="space-y-3">
                <p>
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                    Join our community
                  </Link>
                </p>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <div className="h-px w-8 bg-gray-300"></div>
                  <span>or</span>
                  <div className="h-px w-8 bg-gray-300"></div>
                </div>
                
                <p>
                  Looking for{' '}
                  <Link to="/admin/login" className="text-blue-600 font-semibold hover:underline">
                    Admin Login
                  </Link>{' '}
                  instead?
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Mobile Welcome - Only shown on mobile */}
      <div className="lg:hidden mt-8">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription className="text-blue-100">
              Continue your spiritual journey with us
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Access your personal dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Register for events</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>100% secure and private</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <Button asChild variant="outline" className="w-full border-white text-white hover:bg-white/10">
                <Link to="/register" className="flex items-center justify-center">
                  Create New Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
