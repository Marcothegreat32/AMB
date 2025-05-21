// src/pages/Home.js
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.6 } }
};

export default function Home() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 p-6"
    >
      {/* Hero Heading */}
      <motion.h1
        variants={item}
        className="text-4xl sm:text-5xl md:text-6xl font-heading text-primary mb-4 text-center"
      >
        AI-Powered Medical Bill Explanation &amp; Dispute Letters
      </motion.h1>

      {/* Hero Subtext */}
      <motion.p
        variants={item}
        className="text-base sm:text-lg md:text-xl text-gray-700 text-center max-w-2xl mb-8"
      >
        Upload your medical bills or insurance statements and let AnalyzeMyBill’s AI
        decode every line in plain English—spot errors, uncover overcharges, and
        generate professional dispute letters in seconds.
      </motion.p>

      {/* Feature List */}
      <motion.ul
        variants={item}
        className="space-y-2 text-gray-700 mb-8 max-w-md"
      >
        <li className="flex items-start">
          <span className="mr-2 text-accent">✅</span>
          <span>Plain-English breakdown of complex medical charges</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-accent">✅</span>
          <span>One-click dispute &amp; appeal letter generation</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-accent">✅</span>
          <span>Secure, encrypted vault for all your documents</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-accent">✅</span>
          <span>Free to start—no hidden fees</span>
        </li>
      </motion.ul>

      {/* Call-to-Action Buttons */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/upload"
          className="
            inline-block
            bg-primary
            text-white
            font-medium
            px-8 py-3
            rounded-full
            shadow-lg
            hover:bg-primary-dark
            transition
            transform
            hover:-translate-y-1
            text-center
          "
        >
          Get Started – It’s Free
        </Link>
        <Link
          to="/pricing"
          className="
            inline-block
            border-2 border-primary
            text-primary
            font-medium
            px-8 py-3
            rounded-full
            hover:bg-primary/10
            transition
            text-center
          "
        >
          See Pricing
        </Link>
      </motion.div>
    </motion.div>
  );
}
