import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Heart, DollarSign } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    donor_name: '',
    donor_email: '',
    message: '',
  });

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
      // Create payment intent
      const { data } = await api.post('/donations/create-payment-intent', {
        amount,
        currency: 'usd',
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        message: formData.message,
      });

      const { client_secret, donation_id } = data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.donor_name,
            email: formData.donor_email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          await api.post(`/donations/${donation_id}/confirm`, {
            payment_intent_id: result.paymentIntent.id,
          });
          toast.success('Thank you for your generous donation!');
          setFormData({ amount: '', donor_name: '', donor_email: '', message: '' });
          elements.getElement(CardElement).clear();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Donation Amount (USD) *</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="pl-10"
            placeholder="50.00"
            required
            data-testid="donate-amount-input"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="donor_name">Full Name</Label>
        <Input
          id="donor_name"
          type="text"
          value={formData.donor_name}
          onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
          placeholder="John Doe (Optional)"
          data-testid="donate-name-input"
        />
      </div>

      <div>
        <Label htmlFor="donor_email">Email</Label>
        <Input
          id="donor_email"
          type="email"
          value={formData.donor_email}
          onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
          placeholder="john@example.com (Optional)"
          data-testid="donate-email-input"
        />
      </div>

      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Your message..."
          data-testid="donate-message-input"
        />
      </div>

      <div>
        <Label htmlFor="card">Card Details *</Label>
        <div className="border rounded-md p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || loading}
        data-testid="donate-submit-btn"
      >
        {loading ? 'Processing...' : 'Donate Now'}
      </Button>
    </form>
  );
};

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(null);

  const quickAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4" data-testid="donate-title">Support Our Ministry</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your generous contributions help us continue our mission of spreading God's love
            and building a stronger community.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Impact Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
                <p className="text-gray-600 mb-6">
                  Every donation, no matter the size, makes a significant difference in our
                  ability to serve our community and fulfill our mission.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>How Your Donation Helps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Ministry Operations</p>
                        <p className="text-sm text-gray-600">
                          Supporting daily operations and outreach programs
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Community Services</p>
                        <p className="text-sm text-gray-600">
                          Providing help to those in need in our community
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Missions & Outreach</p>
                        <p className="text-sm text-gray-600">
                          Spreading the Gospel locally and globally
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Facility Maintenance</p>
                        <p className="text-sm text-gray-600">
                          Maintaining a welcoming space for worship and fellowship
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Deductible</CardTitle>
                  <CardDescription>
                    Heavenly Nature Ministry is a registered 501(c)(3) non-profit organization.
                    All donations are tax-deductible to the fullest extent of the law.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Donation Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Make a Donation</CardTitle>
                  <CardDescription>
                    Select a preset amount or enter your own
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="grid grid-cols-3 gap-3">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedAmount === amount ? 'default' : 'outline'}
                          onClick={() => setSelectedAmount(amount)}
                          data-testid={`quick-amount-${amount}`}
                        >
                          ${amount}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedAmount(null)}
                      >
                        Custom
                      </Button>
                    </div>
                  </div>

                  <Elements stripe={stripePromise}>
                    <CheckoutForm initialAmount={selectedAmount} />
                  </Elements>

                  <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Secure payment processing powered by Stripe</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;
