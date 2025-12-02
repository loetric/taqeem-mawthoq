'use client';

import { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';

interface ReportReviewModalProps {
  isOpen: boolean;
  reviewUserName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const reportReasons = [
  { value: 'inappropriate', label: 'محتوى غير لائق' },
  { value: 'false_info', label: 'معلومات خاطئة' },
  { value: 'spam', label: 'محتوى مزعج أو إعلاني' },
  { value: 'harassment', label: 'تحرش أو إساءة' },
  { value: 'other', label: 'سبب آخر' },
];

export default function ReportReviewModal({
  isOpen,
  reviewUserName,
  onConfirm,
  onCancel,
}: ReportReviewModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReason) {
      const reason = selectedReason === 'other' ? customReason : reportReasons.find(r => r.value === selectedReason)?.label || '';
      if (reason.trim()) {
        onConfirm(reason);
        setSelectedReason('');
        setCustomReason('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-gray-200 animate-scale-in mx-2 sm:mx-0">
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="p-1.5 rounded-lg bg-red-50">
                <Flag className="icon-sm text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">الإبلاغ عن التقييم</h3>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded"
              aria-label="إغلاق"
            >
              <X className="icon-sm icon-muted hover:icon-secondary transition-colors" />
            </button>
          </div>
          
          {/* Message */}
          <p className="text-sm text-slate-600 mb-4">
            تقرير عن تقييم من <span className="font-semibold">{reviewUserName}</span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                سبب البلاغ
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="icon-sm text-red-600 focus:ring-red-600"
                    />
                    <span className="text-sm text-slate-700">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'other' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  يرجى توضيح السبب
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                  placeholder="اكتب سبب البلاغ..."
                  required
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 space-x-reverse">
              <button
                type="submit"
                disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إرسال البلاغ
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-slate-700 hover:bg-gray-200 transition-all"
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

