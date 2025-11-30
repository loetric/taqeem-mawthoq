'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  title: string;
  label: string;
  value: string;
  multiline?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export default function EditModal({
  isOpen,
  title,
  label,
  value,
  multiline = false,
  onSave,
  onCancel,
}: EditModalProps) {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    if (isOpen) {
      setEditValue(value);
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim()) {
      onSave(editValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 border border-gray-200 animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {label}
              </label>
              {multiline ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-all text-sm"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-all text-sm"
                  autoFocus
                />
              )}
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white hover:shadow-lg transition-all shadow-md"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

