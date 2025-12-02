'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      confirm: 'bg-red-500 hover:bg-red-600 text-white',
      border: 'border-red-200',
      icon: 'text-red-500',
      bg: 'bg-red-50',
    },
    warning: {
      confirm: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    info: {
      confirm: 'bg-blue-500 hover:bg-blue-600 text-white',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  };

  const currentColors = colors[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-gray-200 animate-scale-in mx-2 sm:mx-0">
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center space-x-2 space-x-reverse ${currentColors.icon}`}>
              <div className={`p-1.5 rounded-lg ${currentColors.bg}`}>
                <AlertTriangle className="icon-sm" />
              </div>
              <h3 className="text-base font-bold text-gray-800">{title}</h3>
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
          <p className="text-sm text-slate-600 mb-4 pr-8 leading-relaxed">{message}</p>
          
          {/* Actions */}
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={onConfirm}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${currentColors.confirm}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-slate-700 hover:bg-gray-200 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

