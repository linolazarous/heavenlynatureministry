import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Heart, DollarSign, Shield, CheckCircle, Globe, Lock, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm = ({ initialAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: initialAmount ? initialAmount.toString() : '',
    currency: 'usd',
    donor_name: '',
    donor_email: '',
    message: '',
    recurring: false,
    anonymous: false
  });

  // Update form when initialAmount changes
  useEffect(() => {
    if (initialAmount) {
      setFormData(prev => ({ ...prev, amount: initialAmount.toString() }));
    }
  }, [initialAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent - using correct API endpoint
      const { data } = await api.post('/api/donations/create-payment-intent', {
        amount,
        currency: formData.currency,
        donor_name: formData.donor_name || undefined,
        donor_email: formData.donor_email || undefined,
        message: formData.message || undefined,
        recurring: formData.recurring,
        anonymous: formData.anonymous
      });

      const { client_secret, donation_id } = data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.anonymous ? 'Anonymous' : formData.donor_name,
            email: formData.anonymous ? '' : formData.donor_email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // Confirm donation - using correct API endpoint
          await api.post(`/api/donations/${donation_id}/confirm`, {
            payment_intent_id: result.paymentIntent.id,
          });
          
          toast.success('Thank you for your generous donation! God bless you.');
          
          // Reset form
          setFormData({
            amount: '',
            currency: 'usd',
            donor_name: '',
            donor_email: '',
            message: '',
            recurring: false,
            anonymous: false
          });
          
          if (elements.getElement(CardElement)) {
            elements.getElement(CardElement).clear();
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Donation Amount *
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="50.00"
            required
            data-testid="donate-amount-input"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($)</SelectItem>
              <SelectItem value="eur">EUR (€)</SelectItem>
              <SelectItem value="gbp">GBP (£)</SelectItem>
              <SelectItem value="cad">CAD ($)</SelectItem>
              <SelectItem value="aud">AUD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!formData.anonymous && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="donor_name">Full Name</Label>
              <Input
                id="donor_name"
                type="text"
                value={formData.donor_name}
                onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                placeholder="John Doe"
                data-testid="donate-name-input"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="donor_email">Email</Label>
              <Input
                id="donor_email"
                type="email"
                value={formData.donor_email}
                onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                placeholder="john@example.com"
                data-testid="donate-email-input"
                className="mt-1"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Your message of encouragement or prayer request..."
          data-testid="donate-message-input"
          className="mt-1"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
              id="recurring"
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              Make this a monthly recurring donation
            </Label>
          </div>
          {formData.recurring && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Monthly
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.anonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked })}
              id="anonymous"
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Donate anonymously
            </Label>
          </div>
          {formData.anonymous && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              Anonymous
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card" className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Card Details *
        </Label>
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                invalid: {
                  color: '#dc2626',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="h-4 w-4 text-green-600" />
        <span>Your payment is secure and encrypted</span>
      </div>

      <Button
        type="submit"
        className="w-full py-6 text-lg"
        disabled={!stripe || loading}
        data-testid="donate-submit-btn"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Heart className="mr-2 h-5 w-5" />
            {formData.recurring ? 'Start Monthly Donation' : 'Donate Now'}
          </div>
        )}
      </Button>
    </form>
  );
};

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [donationType, setDonationType] = useState('one-time');

  const quickAmounts = [
    { amount: 25, label: '$25' },
    { amount: 50, label: '$50', popular: true },
    { amount: 100, label: '$100' },
    { amount: 250, label: '$250' },
    { amount: 500, label: '$500' },
    { amount: 1000, label: '$1,000' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-blue-800 to-purple-900 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="donate-title">
              Support Our Ministry
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
              Your generosity fuels our mission to spread God's love, build community, 
              and transform lives through faith and service.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
              <Shield className="h-4 w-4" />
              <span>Secure & Tax-Deductible Giving</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Impact & Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Giving Makes a Difference</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-gray-600">Goes to Ministry</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">501(c)(3)</div>
                    <div className="text-sm text-gray-600">Tax-Deductible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">Secure</div>
                    <div className="text-sm text-gray-600">Payment Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">Transparent</div>
                    <div className="text-sm text-gray-600">Financial Reports</div>
                  </div>
                </div>
              </div>

              {/* How Donations Help */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 text-blue-600 mr-2" />
                      Ministry Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Outreach Programs</p>
                          <p className="text-sm text-gray-600">
                            Community feeding, clothing drives, and support services
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Youth & Children</p>
                          <p className="text-sm text-gray-600">
                            Bible studies, camps, and educational programs
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Worship Services</p>
                          <p className="text-sm text-gray-600">
                            Live streaming equipment and facility maintenance
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-purple-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-2" />
                      Global Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Mission Trips</p>
                          <p className="text-sm text-gray-600">
                            International outreach and humanitarian aid
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Church Planting</p>
                          <p className="text-sm text-gray-600">
                            Supporting new church starts worldwide
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Bible Distribution</p>
                          <p className="text-sm text-gray-600">
                            Providing scriptures to unreached communities
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Donation Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Impact</CardTitle>
                  <CardDescription>
                    Select your donation type and amount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-3 block">Donation Type</Label>
                      <RadioGroup 
                        value={donationType} 
                        onValueChange={setDonationType}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="one-time" id="one-time" />
                          <Label htmlFor="one-time" className="cursor-pointer">
                            One-Time Gift
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly" className="cursor-pointer">
                            Monthly Support
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-lg mb-3 block">Quick Select Amount</Label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {quickAmounts.map((item) => (
                          <Button
                            key={item.amount}
                            type="button"
                            variant={selectedAmount === item.amount ? 'default' : 'outline'}
                            onClick={() => setSelectedAmount(item.amount)}
                            className={`relative ${item.popular ? 'border-2 border-blue-500' : ''}`}
                            data-testid={`quick-amount-${item.amount}`}
                          >
                            {item.label}
                            {item.popular && (
                              <Badge className="absolute -top-2 -right-2 text-xs px-1 py-0">
                                Most
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>256-bit SSL Encryption</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <span>PCI DSS Compliant</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donation Form */}
            <div>
              <Card className="sticky top-8 border-2 border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="flex items-center">
                    <Heart className="h-6 w-6 text-blue-600 mr-2" />
                    Make Your Donation
                  </CardTitle>
                  <CardDescription>
                    Complete the form below to make a secure donation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm initialAmount={selectedAmount} />
                  </Elements>
                </CardContent>
                <CardFooter className="border-t bg-gray-50">
                  <div className="text-center text-sm text-gray-600 w-full">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-green-600 mr-1" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 text-blue-600 mr-1" />
                        <span>Encrypted</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span>Tax-Deductible</span>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Giving Verses */}
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardHeader>
                <CardTitle className="text-center">Biblical Principles of Giving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="text-4xl text-blue-600 mb-2">"</div>
                    <p className="italic text-gray-700 mb-2">
                      Each of you should give what you have decided in your heart to give, 
                      not reluctantly or under compulsion, for God loves a cheerful giver.
                    </p>
                    <p className="text-sm text-gray-600">— 2 Corinthians 9:7</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl text-blue-600 mb-2">"</div>
                    <p className="italic text-gray-700 mb-2">
                      Bring the whole tithe into the storehouse, that there may be food in my house. 
                      Test me in this, says the Lord Almighty, and see if I will not throw open the 
                      floodgates of heaven and pour out so much blessing that there will not be room enough to store it.
                    </p>
                    <p className="text-sm text-gray-600">— Malachi 3:10</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl text-blue-600 mb-2">"</div>
                    <p className="italic text-gray-700 mb-2">
                      Give, and it will be given to you. A good measure, pressed down, 
                      shaken together and running over, will be poured into your lap.
                    </p>
                    <p className="text-sm text-gray-600">— Luke 6:38</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact for Large Donations */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Considering a Major Gift?</h2>
          <p className="text-lg mb-6 text-blue-100">
            For significant donations, planned giving, or estate planning, 
            we'd love to discuss how your gift can make an eternal impact.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <a href="mailto:info@heavenlynatureministry.com">Contact Our Giving Team</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Donate;
