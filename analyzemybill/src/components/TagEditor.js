import { useState } from "react";

export default function TagEditor({ itemId, initTags, onTagsUpdated }) {
  const [tags, setTags] = useState(initTags);
  const [input, setInput] = useState("");

  const updateTags = async newTags => {
    await fetch(`/api/vault/${itemId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags })
    });
    setTags(newTags);
    onTagsUpdated(newTags);
  };

  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) updateTags([...tags, t]);
    setInput("");
  };
  const removeTag = t => updateTags(tags.filter(x => x !== t));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(t => (
        <span key={t} className="bg-blue-200 px-2 py-1 rounded flex items-center">
          {t}
          <button onClick={() => removeTag(t)} className="ml-1 text-red-600">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Add tag"
        className="border p-1 rounded"
      />
      <button onClick={addTag} className="bg-blue-600 text-white px-2 py-1 rounded">Add</button>
    </div>
  );
}
