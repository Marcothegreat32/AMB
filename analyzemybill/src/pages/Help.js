// src/pages/Help.js
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Help() {
  return (
    <motion.div
      className="min-h-screen bg-offwhite p-6 flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-heading text-primary mb-4">
        Help & Support
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl text-center mb-6">
        Welcome to AnalyzeMyBill’s Help Center. If you can’t find what you’re
        looking for here, please <a href="mailto:support@analyzemybill.com" className="text-primary hover:underline">email our support team</a>.
      </p>
      <Link
        to="/faq"
        className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition"
      >
        View FAQ
      </Link>
    </motion.div>
  );
}
