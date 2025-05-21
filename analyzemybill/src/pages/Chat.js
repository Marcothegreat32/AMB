// src/pages/Chat.js
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }
  })
};
const messageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [letter, setLetter] = useState('');
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { state } = useLocation();
  const parsedText = state?.parsedText;
  const chatEndRef = useRef(null);

  // Send chat payload to backend
  const fetchReply = async (msgs) => {
    setLoadingChat(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs })
      });
      const { reply } = await res.json();
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      console.error(err);
      alert('Chat error');
    } finally {
      setLoadingChat(false);
    }
  };

  // Auto-start on upload
  useEffect(() => {
    if (!parsedText) return;
    setMessages([]);
    setLetter('');
    setSaveSuccess(false);

    const systemMsg = {
      role: 'system',
      content:
        'You are HealthMate, an AI assistant that explains medical bills and insurance in plain language.'
    };
    const userMsg = {
      role: 'user',
      content: `Please explain the following medical bill:\n\n${parsedText}`
    };
    setMessages([systemMsg, userMsg]);
    fetchReply([systemMsg, userMsg]);
  }, [parsedText]);

  // Send a new user message
  const sendMessage = async () => {
    if (!input.trim()) return;
    setLetter('');
    setSaveSuccess(false);

    const userMsg = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    await fetchReply(updated);
  };

  // Generate the dispute letter
  const generateLetter = async () => {
    if (!parsedText) return;
    setSaveSuccess(false);
    setLoadingLetter(true);

    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedText })
      });
      const { letter: fetched } = await res.json();
      setLetter(fetched);
    } catch {
      alert('Failed to generate letter');
    } finally {
      setLoadingLetter(false);
    }
  };

  // Save letter to vault
  const saveToVault = async () => {
    if (!letter) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letter })
      });
      if (!res.ok) throw new Error();
      setSaveSuccess(true);
    } catch {
      alert('Failed to save to Vault');
    } finally {
      setSaving(false);
    }
  };

  // Auto-scroll on new message or letter
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, letter]);

  return (
    <motion.div
      className="min-h-screen bg-offwhite p-6 flex flex-col"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Title */}
      <motion.h2
        className="text-3xl font-heading text-primary mb-4 text-center"
        variants={itemVariants}
        custom={0}
      >
        Chat with HealthMate AI
      </motion.h2>

      {/* Chat Window */}
      <motion.div
        className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto mb-4"
        variants={itemVariants}
        custom={1}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                mb-3 
                inline-block 
                max-w-[75%] 
                px-4 py-2 
                rounded-xl 
                ${m.role === 'user'
                  ? 'ml-auto bg-primary/10 text-primary'
                  : 'mr-auto bg-secondary/10 text-secondary'}
              `}
            >
              <p className="text-sm">
                <strong className="capitalize">{m.role === 'user' ? 'You' : 'HealthMate'}:</strong>{' '}
                {m.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
        {loadingChat && (
          <motion.p
            className="text-center text-gray-400 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Thinking…
          </motion.p>
        )}
      </motion.div>

      {/* Input & Send Button */}
      <motion.div
        className="flex gap-2 mb-4"
        variants={itemVariants}
        custom={2}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your bill..."
          className="
            flex-grow 
            border 
            border-gray-300 
            rounded-full 
            px-4 py-2 
            focus:outline-none 
            focus:ring-2 
            focus:ring-primary/50
          "
        />
        <button
          onClick={sendMessage}
          disabled={loadingChat}
          className="
            bg-primary 
            text-white 
            px-5 py-2 
            rounded-full 
            font-medium 
            hover:bg-primary-dark 
            active:scale-95 
            transition 
            disabled:opacity-50
          "
        >
          Send
        </button>
      </motion.div>

      {/* Actions: Generate & Save */}
      <motion.div
        className="flex flex-wrap gap-4 mb-6 justify-center"
        variants={itemVariants}
        custom={3}
      >
        <button
          onClick={generateLetter}
          disabled={loadingLetter}
          className="
            bg-secondary 
            text-white 
            px-6 py-2 
            rounded-full 
            font-medium 
            hover:bg-secondary-dark 
            active:scale-95 
            transition 
            disabled:opacity-50
          "
        >
          {loadingLetter ? 'Generating…' : 'Generate Letter'}
        </button>

        {letter && (
          <>
            <button
              onClick={saveToVault}
              disabled={saving}
              className="
                bg-accent 
                text-white 
                px-6 py-2 
                rounded-full 
                font-medium 
                hover:bg-accent-dark 
                active:scale-95 
                transition 
                disabled:opacity-50
              "
            >
              {saving ? 'Saving…' : 'Save to Vault'}
            </button>
            {saveSuccess && (
              <span className="self-center text-green-600 font-semibold">
                Saved!
              </span>
            )}
          </>
        )}
      </motion.div>

      {/* Letter Preview */}
      <AnimatePresence>
        {letter && (
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3 className="text-xl font-heading text-primary mb-2">
              Your Dispute Letter
            </h3>
            <textarea
              readOnly
              value={letter}
              className="
                w-full 
                h-60 
                border 
                border-gray-300 
                rounded-lg 
                p-3 
                font-mono 
                text-sm 
                focus:outline-none
              "
            />
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                letter
              )}`}
              download="dispute-letter.txt"
              className="inline-block mt-3 text-primary hover:underline"
            >
              Download Letter
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
