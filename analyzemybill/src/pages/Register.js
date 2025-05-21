// src/pages/Register.js
import { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.15, when: 'beforeChildren' }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async e => {
    e.preventDefault();
    await register(email, pw, name);
    navigate('/');
  };

  return (
    <motion.div
      className="min-h-screen bg-offwhite flex items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8"
        variants={itemVariants}
      >
        {/* Title */}
        <motion.h2
          className="text-3xl font-heading text-primary mb-6 text-center"
          variants={itemVariants}
        >
          Create Account
        </motion.h2>

        {/* Name Input */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-text font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="
              w-full
              border border-gray-300
              rounded-lg
              px-4 py-2
              focus:outline-none
              focus:ring-2 focus:ring-primary/50
              transition
            "
            placeholder="Your name"
          />
        </motion.div>

        {/* Email Input */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-text font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="
              w-full
              border border-gray-300
              rounded-lg
              px-4 py-2
              focus:outline-none
              focus:ring-2 focus:ring-primary/50
              transition
            "
            placeholder="you@example.com"
          />
        </motion.div>

        {/* Password Input */}
        <motion.div className="mb-6" variants={itemVariants}>
          <label className="block text-text font-medium mb-1">Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            required
            className="
              w-full
              border border-gray-300
              rounded-lg
              px-4 py-2
              focus:outline-none
              focus:ring-2 focus:ring-primary/50
              transition
            "
            placeholder="••••••••"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="
            w-full
            bg-primary
            text-white
            font-medium
            px-4 py-2
            rounded-lg
            hover:bg-primary-dark
            active:scale-95
            transition
          "
          variants={itemVariants}
        >
          Register
        </motion.button>

        {/* Already have an account */}
        <motion.p
          className="mt-4 text-center text-text text-sm"
          variants={itemVariants}
        >
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}
