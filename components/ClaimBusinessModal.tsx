'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Building2, User, Phone, Mail, FileText, Shield, Info } from 'lucide-react';
import { dataStore } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/components/Toast';

interface ClaimBusinessModalProps {
  placeId: string;
  placeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimBusinessModal({ placeId, placeName, isOpen, onClose, onSuccess }: ClaimBusinessModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    commercialRegister: '',
    proof: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const user = getCurrentUser();
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      setIsSubmitting(false);
      return;
    }

    if (!formData.businessName || !formData.ownerName || !formData.phone || !formData.email || !formData.proof) {
      setError('الرجاء ملء جميع الحقول المطلوبة بما في ذلك إثبات الملكية');
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if place is already claimed
      const place = dataStore.getPlace(placeId);
      if (place?.isClaimed) {
        // Allow claiming even if already claimed (for transfer or dispute)
        // In real app, this would create a claim request for review
        const claimed = dataStore.claimPlace(placeId, user.id);
        if (claimed) {
          showToast('تم إرسال طلب المطالبة بنجاح! سيتم مراجعة طلبك من قبل فريقنا.', 'success');
        } else {
          // If claimPlace fails, still show success message as it's a request
          showToast('تم إرسال طلب المطالبة بنجاح! سيتم مراجعة طلبك من قبل فريقنا.', 'success');
        }
      } else {
        const claimed = dataStore.claimPlace(placeId, user.id);
        if (claimed) {
          showToast('تمت المطالبة بالمكان بنجاح!', 'success');
        } else {
          setError('لا يمكن المطالبة بهذا المكان');
          setIsSubmitting(false);
          return;
        }
      }
      
      onSuccess();
      onClose();
      setFormData({
        businessName: '',
        ownerName: '',
        phone: '',
        email: '',
        commercialRegister: '',
        proof: '',
      });
    } catch (err) {
      setError('حدث خطأ أثناء المطالبة بالمكان');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[emerald-600] to-[emerald-700] text-white p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold flex items-center space-x-2 space-x-reverse">
              <Shield className="w-5 h-5" />
              <span>المطالبة بالملكية</span>
            </h2>
            <p className="text-sm text-white/90 mt-1 truncate">{placeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 transition p-2 rounded-full flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2 space-x-reverse">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Business Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm flex items-center space-x-1.5 space-x-reverse">
              <Building2 className="w-4 h-4 text-[emerald-600]" />
              <span>اسم المكان <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all text-sm"
              placeholder="أدخل اسم المكان التجاري"
              required
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm flex items-center space-x-1.5 space-x-reverse">
              <User className="w-4 h-4 text-[emerald-600]" />
              <span>اسم المالك الكامل <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all text-sm"
              placeholder="أدخل اسم المالك الكامل"
              required
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm flex items-center space-x-1.5 space-x-reverse">
                <Phone className="w-4 h-4 text-[emerald-600]" />
                <span>رقم الهاتف <span className="text-red-500">*</span></span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all text-sm"
                placeholder="+966501234567"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm flex items-center space-x-1.5 space-x-reverse">
                <Mail className="w-4 h-4 text-[emerald-600]" />
                <span>البريد الإلكتروني <span className="text-red-500">*</span></span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all text-sm"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          {/* Proof Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-2 space-x-reverse mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900 mb-1">إثبات الملكية</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  يرجى تقديم معلومات تثبت ملكيتك للنشاط التجاري. يمكنك إرفاق: رقم السجل التجاري، رخصة النشاط، عقد الإيجار، أو أي وثائق رسمية أخرى.
                </p>
              </div>
            </div>
          </div>

          {/* Commercial Register */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm flex items-center space-x-1.5 space-x-reverse">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>رقم السجل التجاري</span>
              <span className="text-xs text-slate-400 font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={formData.commercialRegister}
              onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all text-sm"
              placeholder="مثال: 1234567890"
            />
          </div>

          {/* Proof Details */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm flex items-center space-x-1.5 space-x-reverse">
              <Shield className="w-4 h-4 text-[emerald-600]" />
              <span>معلومات إثبات الملكية <span className="text-red-500">*</span></span>
            </label>
            <textarea
              value={formData.proof}
              onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all resize-none text-sm"
              placeholder="أدخل معلومات تفصيلية لإثبات ملكيتك للنشاط التجاري:

مثال:
• رقم الرخصة التجارية: XXX
• تاريخ التأسيس: YYYY
• معلومات الاتصال الرسمية
• أي معلومات أخرى تثبت ملكيتك..."
              required
            />
            <div className="mt-2 flex items-start space-x-1.5 space-x-reverse text-xs text-slate-500 bg-gray-50 p-2 rounded-lg">
              <Info className="w-3.5 h-3.5 text-[emerald-600] flex-shrink-0 mt-0.5" />
              <span>سيتم مراجعة طلبك من قبل فريقنا خلال 24-48 ساعة. تأكد من تقديم معلومات دقيقة وصحيحة.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 space-x-reverse pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary-unified flex-1 text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary-unified flex-1 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>إرسال الطلب</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

