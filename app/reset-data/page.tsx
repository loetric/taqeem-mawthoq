'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dataStore } from '@/lib/data';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function ResetDataPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [reset, setReset] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
  });

  const handleReset = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmReset = () => {
    try {
      // Clear ALL localStorage items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('places');
        localStorage.removeItem('reviews');
        localStorage.removeItem('users');
        localStorage.removeItem('questions');
        localStorage.removeItem('notifications');
        localStorage.removeItem('announcements');
        localStorage.removeItem('inquiries');
        localStorage.removeItem('subscriptions');
        localStorage.removeItem('likedPlaces');
        localStorage.removeItem('loyaltyTransactions');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUser'); // Backwards compatibility with older keys
      }
      setReset(true);
      setMessage('تم حذف جميع البيانات! سيتم إعادة تحميل الصفحة...');
      setConfirmModal({ isOpen: false });
      // Force a full page reload - this will trigger fresh initialization
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } catch (error) {
      console.error('Error resetting data:', error);
      setMessage('حدث خطأ أثناء إعادة تعيين البيانات. يرجى المحاولة مرة أخرى.');
      setConfirmModal({ isOpen: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
            إعادة تعيين البيانات
          </h2>
          {message ? (
            <div className="text-center">
              <div className="bg-emerald-100 text-emerald-700 px-4 py-3 rounded-lg mb-4">
                {message}
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-600 mb-6 text-center">
                سيتم حذف جميع البيانات الحالية وإعادة تحميل البيانات التجريبية الجديدة.
              </p>
              <button
                onClick={handleReset}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all font-semibold shadow-md"
              >
                إعادة تعيين البيانات
              </button>
              <button
                onClick={() => router.push('/home')}
                className="w-full mt-4 bg-gray-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                إلغاء
              </button>
            </>
          )}
        </div>
      </main>

      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="إعادة تعيين البيانات"
        message="هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم حذف جميع البيانات الحالية."
        type="danger"
        onConfirm={confirmReset}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
      <TabNavigation />
    </div>
  );
}

