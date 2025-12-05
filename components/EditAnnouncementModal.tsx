'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditAnnouncementModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export default function EditAnnouncementModal({
  isOpen,
  title: initialTitle,
  content: initialContent,
  onSave,
  onCancel,
}: EditAnnouncementModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [isOpen, initialTitle, initialContent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 border border-gray-200 animate-scale-in">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">تعديل الإعلان</h3>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
              aria-label="إغلاق"
            >
              <X className="icon-md icon-muted hover:icon-secondary transition-colors" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 sm:mb-4">
              <label className="block text-slate-700 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">
                العنوان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all text-xs sm:text-sm"
                autoFocus
                required
              />
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-slate-700 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">
                المحتوى
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all text-xs sm:text-sm resize-none"
                required
              />
            </div>
            <div className="flex space-x-2 sm:space-x-3 space-x-reverse">
              <button
                type="submit"
                className="flex-1 bg-emerald-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-emerald-600 hover:shadow-lg transition-all shadow-md text-xs sm:text-sm"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-all text-xs sm:text-sm"
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

