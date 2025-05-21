// src/pages/PolicyUpload.js
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function PolicyUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFile = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMetadata(null);
    setRawText('');
    setSaveSuccess(false);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/parse-policy', { method: 'POST', body: form });
      const { rawText, metadata } = await res.json();
      setRawText(rawText);
      setMetadata(metadata);
    } catch {
      alert('Policy parse failed');
    } finally {
      setLoading(false);
    }
  };

  const saveToVault = async () => {
    if (!metadata) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vault-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, rawText })
      });
      if (!res.ok) throw new Error();
      setSaveSuccess(true);
    } catch {
      alert('Failed to save policy to Vault');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-offwhite p-6 flex flex-col items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.h2
        className="text-3xl font-heading text-primary mb-6"
        variants={itemVariants}
      >
        Upload Your Insurance Policy
      </motion.h2>

      {/* File Input & Parse */}
      <motion.div variants={itemVariants} className="w-full max-w-lg mb-6">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFile}
          className="w-full mb-4 file:rounded-lg file:px-4 file:py-2 file:bg-primary file:text-white file:font-medium file:hover:bg-primary-dark"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="
            w-full
            bg-primary 
            text-white 
            font-medium 
            px-6 py-2 
            rounded-lg 
            hover:bg-primary-dark 
            active:scale-95 
            transition 
            disabled:opacity-50
          "
        >
          {loading ? 'Parsing…' : 'Parse Policy'}
        </button>
      </motion.div>

      {/* Parsed Metadata & Raw Text */}
      <AnimatePresence>
        {metadata && (
          <motion.div
            className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 mb-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h3 className="text-xl font-heading text-secondary mb-4">
              Extracted Policy Details
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 mb-6">
              <li><strong>Plan Name:</strong> {metadata.planName || '—'}</li>
              <li><strong>Member ID:</strong> {metadata.memberId || '—'}</li>
              <li><strong>Group #:</strong> {metadata.groupNumber || '—'}</li>
              <li><strong>Effective:</strong> {metadata.effectiveDate || '—'}</li>
              <li><strong>Expires:</strong> {metadata.expirationDate || '—'}</li>
              <li><strong>Policy Holder:</strong> {metadata.policyHolderName || '—'}</li>
              <li><strong>Insurer:</strong> {metadata.insurerName || '—'}</li>
            </ul>
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Raw OCR Text</h4>
              <textarea
                readOnly
                value={rawText}
                className="
                  w-full
                  h-48
                  p-3
                  border border-gray-300
                  rounded-lg
                  font-mono
                  text-sm
                  focus:outline-none
                "
              />
            </div>
            <div className="flex items-center">
              <button
                onClick={saveToVault}
                disabled={saving}
                className="
                  bg-accent 
                  text-white 
                  font-medium 
                  px-6 py-2 
                  rounded-lg 
                  hover:bg-accent-dark 
                  active:scale-95 
                  transition 
                  disabled:opacity-50
                "
              >
                {saving ? 'Saving…' : 'Save to Vault'}
              </button>
              {saveSuccess && (
                <span className="ml-4 text-green-600 font-semibold">
                  Saved!
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
