// src/pages/Upload.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleContinue = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse', { method: 'POST', body: form });
      const { text } = await res.json();
      navigate('/chat', { state: { parsedText: text } });
    } catch {
      alert('Error parsing document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.h2
        className="text-3xl sm:text-4xl font-heading text-primary mb-6 text-center"
        variants={itemVariants}
      >
        Upload Your Medical Bill or Insurance Card
      </motion.h2>

      {/* File Input */}
      <motion.div variants={itemVariants} className="w-full max-w-md mb-4">
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="
            w-full
            text-sm text-gray-700
            bg-white
            border border-gray-300
            rounded-lg
            cursor-pointer
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-none
            file:bg-secondary file:text-white
            hover:file:bg-secondary-dark
            transition
          "
        />
      </motion.div>

      {/* Selected File Name */}
      {file && (
        <motion.p
          className="text-gray-600 mb-4"
          variants={itemVariants}
        >
          Selected: <span className="font-medium">{file.name}</span>
        </motion.p>
      )}

      {/* Continue Button */}
      <motion.button
        onClick={handleContinue}
        disabled={loading}
        className="
          bg-primary text-white font-medium
          px-8 py-3
          rounded-full shadow-lg
          hover:bg-primary-dark active:scale-95
          transition disabled:opacity-50
        "
        variants={itemVariants}
      >
        {loading ? 'Parsing…' : 'Continue to Analysis'}
      </motion.button>
    </motion.div>
  );
}
