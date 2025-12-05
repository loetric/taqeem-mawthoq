'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { User, Review } from '@/types';
import { ArrowRight, MapPin, FileText, Mail, Phone, User as UserIcon, Calendar as CalendarIcon, X, Share2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';
import { getCurrentUser } from '@/lib/auth';
import ReviewCard from '@/components/ReviewCard';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const currentUser = getCurrentUser();
  const { showToast, ToastContainer } = useToast();
  const [reportReviewModal, setReportReviewModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewUserName: string;
  }>({
    isOpen: false,
    reviewId: '',
    reviewUserName: '',
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (userId) {
      const userData = dataStore.getUser(userId);
      if (!userData) {
        router.push('/home');
        return;
      }
      setUser(userData);
      
      const allReviews = dataStore.getAllReviews();
      const userReviews = allReviews.filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);
      setReviews(userReviews);
    }
  }, [userId, router]);


  if (!user) return null;

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    const shareData = {
      title: `بروفايل ${user.name} - تقييم موثوق`,
      text: `تعرف على ${user.name} وتقييماته على منصة تقييم موثوق`,
      url: profileUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('تم مشاركة البروفايل بنجاح', 'success');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(profileUrl);
        showToast('تم نسخ رابط البروفايل', 'success');
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(profileUrl);
          showToast('تم نسخ رابط البروفايل', 'success');
        } catch (clipboardError) {
          showToast('حدث خطأ أثناء المشاركة', 'error');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Back and Share Buttons */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-semibold">رجوع</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">مشاركة</span>
          </button>
        </div>

        {/* Profile Header with Integrated Details */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden" style={{ color: 'white' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
          <div className="relative z-10" style={{ color: 'white' }}>
            {/* Avatar and Name Section */}
            <div className="flex items-start gap-6 mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  onClick={() => setShowAvatarModal(true)}
                  className="w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                />
              ) : (
                <div 
                  onClick={() => setShowAvatarModal(true)}
                  className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30 shadow-xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity" 
                  style={{ color: 'white' }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0" style={{ color: 'white' }}>
                <h2 className="text-3xl font-bold mb-3" style={{ color: 'white' }}>{user.name}</h2>
                {user.location?.city && user.privacySettings?.showLocation !== false && (
                  <div className="flex items-center gap-2 mb-3" style={{ color: 'white' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'white' }} />
                    <span className="text-lg font-semibold" style={{ color: 'white' }}>{user.location.city}</span>
                  </div>
                )}
                {user.bio && (
                  <p className="leading-relaxed text-sm line-clamp-2" style={{ color: 'white' }}>{user.bio}</p>
                )}
              </div>
            </div>

            {/* User Details Grid - Integrated */}
            {(user.privacySettings?.showEmail !== false && user.email) ||
             (user.privacySettings?.showPhone !== false && user.phone) ||
             (user.privacySettings?.showGender !== false && user.gender) ||
             (user.privacySettings?.showDateOfBirth !== false && user.dateOfBirth) ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
                {user.privacySettings?.showEmail !== false && user.email && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <Mail className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center truncate w-full px-1" style={{ color: 'white' }}>{user.email}</p>
                  </div>
                )}
                {user.privacySettings?.showPhone !== false && user.phone && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <Phone className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center" style={{ color: 'white' }}>{user.phone}</p>
                  </div>
                )}
                {user.privacySettings?.showGender !== false && user.gender && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <UserIcon className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center" style={{ color: 'white' }}>{user.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                )}
                {user.privacySettings?.showDateOfBirth !== false && user.dateOfBirth && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <CalendarIcon className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center leading-tight" style={{ color: 'white' }}>
                      {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">التقييمات</h3>
              <p className="text-sm text-slate-600">{reviews.length} تقييم</p>
            </div>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد تقييمات</h3>
              <p className="text-slate-600 text-sm">لم يقم هذا المستخدم بكتابة أي تقييمات بعد</p>
            </div>
          )}
        </div>
      </main>

      <TabNavigation />

      {/* Toast Container */}
      <ToastContainer />

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportReviewModal.isOpen}
        reviewUserName={reportReviewModal.reviewUserName}
        onConfirm={(reason) => {
          const review = reviews.find(r => r.id === reportReviewModal.reviewId);
          if (review) {
            review.reports = (review.reports || 0) + 1;
            setReviews([...reviews]);
            showToast('تم الإبلاغ عن التقييم. شكراً لملاحظاتك.', 'success');
          }
          setReportReviewModal({ ...reportReviewModal, isOpen: false });
        }}
        onCancel={() => setReportReviewModal({ ...reportReviewModal, isOpen: false })}
      />

      {/* Avatar Modal */}
      {showAvatarModal && user && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-auto rounded-lg object-contain max-h-[90vh] mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className="w-full h-[60vh] bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-9xl font-bold mx-auto"
                style={{ color: 'white' }}
                onClick={(e) => e.stopPropagation()}
              >
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

