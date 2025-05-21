import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';

const container = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '' // honeypot field for spam detection
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const recaptchaRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      // Execute invisible ReCAPTCHA
      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();

      const payload = { ...form, recaptchaToken: token };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus({ success: true, msg: data.message || 'Message sent successfully!' });
      setForm({ name: '', email: '', subject: '', message: '', company: '' });
    } catch (error) {
      console.error(error);
      setStatus({ success: false, msg: error.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-offwhite p-6 flex flex-col items-center"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-4xl font-heading text-primary mb-4" variants={item}>
        Contact Support
      </motion.h1>
      <motion.p className="text-gray-700 mb-6 max-w-lg text-center" variants={item}>
        Have a question or feedback? Fill out the form below and our team will get back to you ASAP.
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 space-y-4"
        variants={item}
      >
        {['name', 'email', 'subject'].map((field) => (
          <motion.div key={field} variants={item}>
            <label className="block text-text font-medium mb-1 capitalize">{field}</label>
            <input
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </motion.div>
        ))}

        {/* Honeypot field for spam detection */}
        <input
          type="hidden"
          name="company"
          value={form.company}
          onChange={handleChange}
        />

        <motion.div variants={item}>
          <label className="block text-text font-medium mb-1">Message</label>
          <textarea
            name="message"
            rows="6"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </motion.div>

        <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          size="invisible"
          ref={recaptchaRef}
        />

        <motion.button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white font-medium px-6 py-2 rounded-full hover:bg-primary-dark active:scale-95 transition disabled:opacity-50"
          variants={item}
        >
          {submitting ? 'Sending…' : 'Send Message'}
        </motion.button>

        {status && (
          <motion.p
            className={`mt-4 text-center ${status.success ? 'text-green-600' : 'text-red-600'}`}
            variants={item}
          >
            {status.msg}
          </motion.p>
        )}
      </motion.form>
    </motion.div>
  );
}
