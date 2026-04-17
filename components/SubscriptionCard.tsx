'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { formatPrice } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Tier {
  id: string;
  name: string;
  monthly_price: number;
  features: string[];
}

function CheckoutForm({ tierId, onSuccess }: { tierId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?subscribed=true`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        disabled={isLoading || !stripe}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
}

export default function SubscriptionCard({
  tier,
  userId,
  email,
}: {
  tier: Tier;
  userId: string;
  email: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initiate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: tier.id, userId, email }),
      });
      
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
    }
    setIsLoading(false);
  };

  if (!clientSecret) {
    return (
      <div className="border rounded-xl p-6 hover:shadow-lg transition bg-white/80 backdrop-blur">
        <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {formatPrice(tier.monthly_price)}
          <span className="text-sm text-gray-500 font-normal">/mo</span>
        </p>
        <ul className="mt-4 space-y-2">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span> {feature}
            </li>
          ))}
        </ul>
        <button
          onClick={initiate}
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : `Choose ${tier.name}`}
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-6 bg-white/80 backdrop-blur">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm tierId={tier.id} onSuccess={() => setClientSecret(null)} />
      </Elements>
    </div>
  );
}
