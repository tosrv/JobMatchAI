"use client";

import { X } from "lucide-react";
import { useState } from "react";

type TagInputProps = {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({
  label,
  tags,
  setTags,
  placeholder,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (!input.trim()) return;
    if (tags.includes(input.trim())) return;

    setTags([...tags, input.trim()]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <label className="flex flex-col mb-5">
      <span className="text-sm font-medium pb-2">{label}</span>

      <div className="flex flex-col gap-2  border rounded-lg p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <input
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
      </div>
    </label>
  );
}
