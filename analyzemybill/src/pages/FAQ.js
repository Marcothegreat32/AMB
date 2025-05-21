// src/pages/FAQ.js
import { motion } from 'framer-motion';

const faqs = [
  {
    q: 'What is AnalyzeMyBill?',
    a: 'AnalyzeMyBill is an AI-powered web app that explains your medical bills and insurance statements in plain English, helps you spot errors, and can generate professional dispute letters instantly.'
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use end-to-end encryption (TLS in transit, AES-256 at rest), HIPAA-compliant storage, and strict access controls. Only you can view your documents and chat history.'
  },
  {
    q: 'How does the AI work?',
    a: 'Behind the scenes we use OpenAI’s GPT models plus custom prompts to parse your bills, decode jargon, and draft letters. Nothing is stored or used outside your secure vault unless you choose to save it.'
  },
  {
    q: 'What file types can I upload?',
    a: 'You can upload PDF, JPG, PNG, and other common image formats—up to 10 MB per file. Bills, insurance cards, and policy documents all work great.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards via Stripe. You can manage your subscription anytime in the Customer Portal.'
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to “Manage Subscription” in the nav (or visit the Customer Portal link), and you can pause or cancel at any time. There are no hidden fees.'
  }
];

export default function FAQ() {
  return (
    <motion.div
      className="min-h-screen bg-offwhite p-6 flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-heading text-primary mb-6">
        Frequently Asked Questions
      </h1>

      <div className="w-full max-w-2xl space-y-4">
        {faqs.map(({ q, a }) => (
          <details
            key={q}
            className="group border-b pb-4"
          >
            <summary className="
              cursor-pointer
              font-medium
              text-gray-800
              list-none
              flex justify-between items-center
              py-2
              group-open:text-primary
              hover:text-primary
              transition
            ">
              {q}
              <span className="ml-2 transform group-open:rotate-180 transition">▾</span>
            </summary>
            <p className="mt-2 text-gray-700 pl-4">
              {a}
            </p>
          </details>
        ))}
      </div>
    </motion.div>
  );
}
