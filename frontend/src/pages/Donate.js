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

const CheckoutForm = ({ initialAmount, donationType }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: initialAmount?.toString() || '',
    currency: 'usd',
    donor_name: '',
    donor_email: '',
    message: '',
    recurring: donationType === 'monthly',
    anonymous: false,
  });

  // Sync initial amount and donation type
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      amount: initialAmount?.toString() || '',
      recurring: donationType === 'monthly',
    }));
  }, [initialAmount, donationType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent or subscription
      const { data } = await api.post('/api/donations/create-payment-intent', {
        amount,
        currency: formData.currency,
        donor_name: formData.anonymous ? 'Anonymous' : formData.donor_name,
        donor_email: formData.anonymous ? undefined : formData.donor_email,
        message: formData.message || undefined,
        recurring: formData.recurring,
      });

      const { client_secret, donation_id } = data;

      // Confirm card payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.anonymous ? 'Anonymous' : formData.donor_name,
            email: formData.anonymous ? undefined : formData.donor_email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Confirm donation in backend
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
          recurring: donationType === 'monthly',
          anonymous: false,
        });

        elements.getElement(CardElement)?.clear();
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" /> Donation Amount *
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
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
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

      {/* Name & Email (optional if anonymous) */}
      {!formData.anonymous && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="donor_name">Full Name</Label>
            <Input
              id="donor_name"
              type="text"
              value={formData.donor_name}
              onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
              placeholder="John Doe"
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
            />
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Your message of encouragement or prayer request..."
        />
      </div>

      {/* Recurring & Anonymous Switches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
            />
            <Label className="cursor-pointer">Make this a monthly recurring donation</Label>
          </div>
          {formData.recurring && <Badge variant="outline" className="bg-green-50 text-green-700">Monthly</Badge>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.anonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked })}
            />
            <Label className="cursor-pointer">Donate anonymously</Label>
          </div>
          {formData.anonymous && <Badge variant="outline" className="bg-gray-50 text-gray-700">Anonymous</Badge>}
        </div>
      </div>

      {/* Card Details */}
      <div>
        <Label className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2" /> Card Details *
        </Label>
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <CardElement
            options={{
              style: {
                base: { fontSize: '16px', color: '#374151', '::placeholder': { color: '#9ca3af' }, fontFamily: '"Inter", sans-serif' },
                invalid: { color: '#dc2626' },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      {/* Security Info */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="h-4 w-4 text-green-600" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full py-6 text-lg" disabled={!stripe || loading}>
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
      {/* ... same as your original Hero ... */}

      {/* Donation Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Impact & Donation Options */}
          {/* ... same as original ... */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Impact</CardTitle>
              <CardDescription>Select your donation type and amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <RadioGroup value={donationType} onValueChange={setDonationType} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-time" id="one-time" />
                    <Label htmlFor="one-time">One-Time Gift</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly Support</Label>
                  </div>
                </RadioGroup>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {quickAmounts.map(item => (
                    <Button
                      key={item.amount}
                      type="button"
                      variant={selectedAmount === item.amount ? 'default' : 'outline'}
                      onClick={() => setSelectedAmount(item.amount)}
                      className={`relative ${item.popular ? 'border-2 border-blue-500' : ''}`}
                    >
                      {item.label}
                      {item.popular && <Badge className="absolute -top-2 -right-2 text-xs px-1 py-0">Most</Badge>}
                    </Button>
                  ))}
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
                <Heart className="h-6 w-6 text-blue-600 mr-2" /> Make Your Donation
              </CardTitle>
              <CardDescription>Complete the form below to make a secure donation</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <CheckoutForm initialAmount={selectedAmount} donationType={donationType} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verses & Contact Section */}
      {/* ... same as original ... */}
    </div>
  );
};

export default Donate;
