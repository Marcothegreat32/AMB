// src/pages/Login.js
import { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const { login, skipLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async e => {
    e.preventDefault();
    await login(email, pw);
    navigate('/');
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-offwhite px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h2
          className="text-3xl font-heading text-primary mb-6 text-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          Log In
        </motion.h2>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mb-4">
          <label className="block text-text mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            placeholder="you@example.com"
          />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mb-6">
          <label className="block text-text mb-1">Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            placeholder="••••••••"
          />
        </motion.div>

        <motion.button
          type="submit"
          className="w-full bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary-dark active:scale-95 transition mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          Log In
        </motion.button>

        <motion.button
          type="button"
          onClick={() => {
            skipLogin();
            navigate('/');
          }}
          className="w-full border-2 border-primary text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary/10 transition"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          Continue as Demo
        </motion.button>

        <motion.p
          className="mt-4 text-center text-text text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Don’t have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}
