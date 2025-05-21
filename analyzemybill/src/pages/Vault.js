// src/pages/Vault.js
import { useState, useEffect } from 'react';
import TagEditor from '../components/TagEditor';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Vault() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [searchQuery, setSearch] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvTags] = useState([]);

  // Load vault items
  useEffect(() => {
    fetch('/api/vault')
      .then(r => r.json())
      .then(data => {
        setItems(data);
        setAvTags([...new Set(data.flatMap(i => i.tags))]);
      });
  }, []);

  // Filtering logic
  const filtered = items.filter(item => {
    const text = (item.content || '') + JSON.stringify(item.metadata || {}) + item.type;
    if (searchQuery && !text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTags.length && !filterTags.every(t => item.tags.includes(t))) return false;
    return true;
  });

  const toggleSelect = id =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const clearSelection = () => setSelected(new Set());

  // Bulk actions
  const bulkDelete = async () => {
    if (!selected.size || !window.confirm('Delete selected items?')) return;
    const ids = [...selected];
    await fetch('/api/vault/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    setItems(items.filter(i => !selected.has(i.id)));
    clearSelection();
  };
  const bulkDownload = async () => {
    if (!selected.size) return;
    const zip = new JSZip();
    await Promise.all(
      [...selected].map(async id => {
        const item = items.find(i => i.id === id);
        const res = await fetch(item.downloadUrl);
        const blob = await res.blob();
        zip.file(item.filename, blob);
      })
    );
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'AnalyzeMyBill_Vault.zip');
  };

  return (
    <motion.div
      className="min-h-screen bg-offwhite p-6 flex flex-col"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.h2
        className="text-3xl font-heading text-primary mb-6 text-center"
        variants={item}
      >
        Your Vault
      </motion.h2>

      {/* Search & Tag Filters */}
      <motion.div className="mb-6 max-w-3xl mx-auto" variants={item}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your letters & policies…"
          className="
            w-full
            p-3
            border border-gray-300
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary/50
            transition
          "
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() =>
                setFilterTags(ft =>
                  ft.includes(tag) ? ft.filter(t => t !== tag) : [...ft, tag]
                )
              }
              className={`
                px-3 py-1 rounded-full text-sm
                ${filterTags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700'}
                hover:opacity-80 transition
              `}
              variants={item}
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            className="mb-4 max-w-3xl mx-auto p-4 bg-white rounded-lg shadow flex items-center justify-between"
            variants={item}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-text">{selected.size} selected</span>
            <div className="flex gap-2">
              <button
                onClick={bulkDownload}
                className="
                  bg-primary text-white px-4 py-2 rounded-lg
                  hover:bg-primary-dark transition
                "
              >
                Download ZIP
              </button>
              <button
                onClick={bulkDelete}
                className="
                  bg-red-600 text-white px-4 py-2 rounded-lg
                  hover:bg-red-700 transition
                "
              >
                Delete Selected
              </button>
              <button
                onClick={clearSelection}
                className="underline text-text hover:opacity-80 transition"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vault Items */}
      <motion.div className="space-y-4 flex-1 overflow-y-auto max-w-3xl mx-auto" variants={container}>
        {filtered.length > 0 ? (
          filtered.map((itemData, idx) => (
            <motion.div
              key={itemData.id}
              className={`
                bg-white p-4 rounded-lg shadow flex gap-4 items-start
                ${selected.has(itemData.id) ? 'ring-2 ring-primary' : ''}
              `}
              variants={item}
              custom={idx}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(itemData.id)}
                onChange={() => toggleSelect(itemData.id)}
                className="mt-1 h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
              />

              {/* Details */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-text"><strong>Type:</strong> {itemData.type}</p>
                    <p className="text-text"><strong>Date:</strong> {new Date(itemData.createdAt).toLocaleString()}</p>
                  </div>
                  <a
                    href={itemData.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download
                  </a>
                </div>
                {itemData.type === 'policy' && itemData.metadata && (
                  <div className="mt-3 text-text grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <p><strong>Plan:</strong> {itemData.metadata.planName}</p>
                    <p><strong>Member ID:</strong> {itemData.metadata.memberId}</p>
                    <p><strong>Group #:</strong> {itemData.metadata.groupNumber}</p>
                  </div>
                )}
                <div className="mt-4">
                  <TagEditor
                    itemId={itemData.id}
                    initTags={itemData.tags}
                    onTagsUpdated={newTags => {
                      setItems(items.map(i => i.id === itemData.id ? { ...i, tags: newTags } : i));
                      setAvTags([...new Set([...availableTags, ...newTags])]);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-center text-gray-600 mt-8"
            variants={item}
          >
            No items match your filters.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
