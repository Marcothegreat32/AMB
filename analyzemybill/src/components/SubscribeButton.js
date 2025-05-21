// src/components/SubscribeButton.js
import { useContext, useState } from 'react';
import { stripePromise } from '../hooks/useStripe';
import { AuthContext } from '../AuthContext';

export default function SubscribeButton({ priceId }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return alert('Please log in first.');
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      const { url } = await res.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: new URL(url).searchParams.get('session_id') });
    } catch (err) {
      console.error(err);
      alert('Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="
        bg-primary text-white px-6 py-2 rounded-full 
        font-medium hover:bg-primary-dark active:scale-95 
        transition disabled:opacity-50
      "
    >
      {loading ? 'Redirecting…' : 'Subscribe'}
    </button>
  );
}
