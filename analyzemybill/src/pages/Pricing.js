// src/pages/Pricing.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SubscribeButton from '../components/SubscribeButton';

const tiers = [
  {
    title: 'Free',
    price: '$0',
    features: [
      '3 uploads / month',
      'AI bill explanations',
      'Save up to 5 items',
    ],
    priceId: null,
  },
  {
    title: 'Premium',
    price: '$7.99/mo',
    features: [
      'Unlimited uploads',
      'Generate & save dispute letters',
      'Priority support',
      'Access to policy uploads',
    ],
    priceId: 'price_ABC123', // replace with your real Price ID
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300 },
  },
};

export default function Pricing() {
  const [subscription, setSubscription] = useState({ active: false });

  useEffect(() => {
    axios
      .get('/api/subscription')
      .then((res) => setSubscription(res.data))
      .catch((err) => console.error('Failed to fetch subscription', err));
  }, []);

  const handleManage = async () => {
    try {
      const { data } = await axios.post('/api/create-portal-session');
      window.location.href = data.url;
    } catch (err) {
      console.error('Failed to create portal session', err);
    }
  };

  return (
    <>
      <motion.div
        className="min-h-screen bg-offwhite p-6 flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-heading text-primary mb-8"
          variants={card}
        >
          Choose Your Plan
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {tiers.map((tier) => (
            <motion.div
              key={tier.title}
              className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between"
              variants={card}
            >
              <div>
                <h2 className="text-2xl font-heading text-primary mb-4">
                  {tier.title}
                </h2>
                <p className="text-3xl font-bold text-secondary mb-6">
                  {tier.price}
                </p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="inline-block w-2 h-2 mr-2 bg-primary rounded-full" />
                      <span className="text-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center">
                {tier.priceId ? (
                  <SubscribeButton priceId={tier.priceId} />
                ) : (
                  <span className="inline-block px-6 py-2 rounded-full border-2 border-gray-300 text-gray-600">
                    Current Plan
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {subscription.active && (
        <div className="text-center mt-8">
          <button
            onClick={handleManage}
            className="px-6 py-3 bg-primary text-white rounded-full hover:opacity-90 transition"
          >
            Manage Subscription
          </button>
        </div>
      )}
    </>
  );
}
