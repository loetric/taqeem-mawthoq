'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { User, Review } from '@/types';
import { ArrowRight, Star, MapPin, Clock, FileText, ThumbsUp, Flag, Mail, Phone, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';
import { getCurrentUser } from '@/lib/auth';

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition-colors mb-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="text-sm font-semibold">رجوع</span>
        </button>

        {/* Profile Header with Integrated Details */}
        <div className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{ color: 'white' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
          <div className="relative z-10" style={{ color: 'white' }}>
            {/* Avatar and Name Section */}
            <div className="flex items-start gap-6 mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl border-4 border-white/30 object-cover shadow-xl flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border-4 border-white/30 shadow-xl flex-shrink-0" style={{ color: 'white' }}>
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0" style={{ color: 'white' }}>
                <h2 className="text-3xl font-bold mb-3 text-white" style={{ color: 'white' }}>{user.name}</h2>
                {user.location?.city && user.privacySettings?.showLocation !== false && (
                  <div className="flex items-center gap-2 text-white mb-3" style={{ color: 'white' }}>
                    <MapPin className="w-5 h-5 flex-shrink-0 text-white" style={{ color: 'white' }} />
                    <span className="text-lg font-semibold text-white" style={{ color: 'white' }}>{user.location.city}</span>
                  </div>
                )}
                {user.bio && (
                  <p className="text-white leading-relaxed text-sm line-clamp-2" style={{ color: 'white' }}>{user.bio}</p>
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
                      <Mail className="w-5 h-5 text-white" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-white text-center truncate w-full px-1" style={{ color: 'white' }}>{user.email}</p>
                  </div>
                )}
                {user.privacySettings?.showPhone !== false && user.phone && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <Phone className="w-5 h-5 text-white" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-white text-center" style={{ color: 'white' }}>{user.phone}</p>
                  </div>
                )}
                {user.privacySettings?.showGender !== false && user.gender && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <UserIcon className="w-5 h-5 text-white" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-white text-center" style={{ color: 'white' }}>{user.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                )}
                {user.privacySettings?.showDateOfBirth !== false && user.dateOfBirth && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <CalendarIcon className="w-5 h-5 text-white" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-white text-center leading-tight" style={{ color: 'white' }}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => {
                const place = dataStore.getPlace(review.placeId);
                return (
                  <Link
                    key={review.id}
                    href={`/places/${review.placeId}`}
                    className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start space-x-2.5 space-x-reverse mb-3">
                      <div className="relative flex-shrink-0">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5 space-x-reverse min-w-0">
                            <span className="font-semibold text-sm text-slate-800 truncate">{user.name}</span>
                          </div>
                        </div>
                        {place && (
                          <p className="text-xs text-slate-500 mb-1 truncate">
                            راجع <span className="text-emerald-600 font-semibold">{place.name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="mr-1.5 text-xs font-semibold text-slate-600">{review.rating}.0</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed line-clamp-2 mb-2">{review.comment}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[9px] text-slate-400">{formatRelativeTime(review.createdAt)}</span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {currentUser && currentUser.id !== review.userId && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Handle like
                                const reviewIndex = reviews.findIndex(r => r.id === review.id);
                                if (reviewIndex !== -1) {
                                  const updatedReview = { ...reviews[reviewIndex] };
                                  if (!updatedReview.likes) updatedReview.likes = [];
                                  const likeIndex = updatedReview.likes.indexOf(currentUser.id);
                                  if (likeIndex > -1) {
                                    updatedReview.likes.splice(likeIndex, 1);
                                  } else {
                                    updatedReview.likes.push(currentUser.id);
                                  }
                                  const updatedReviews = [...reviews];
                                  updatedReviews[reviewIndex] = updatedReview;
                                  setReviews(updatedReviews);
                                }
                              }}
                              className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-lg transition-all ${
                                review.likes?.includes(currentUser?.id || '') 
                                  ? 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20' 
                                  : 'text-slate-500 hover:bg-gray-100 hover:text-emerald-600'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${review.likes?.includes(currentUser?.id || '') ? 'fill-current' : ''}`} />
                              <span className="font-semibold text-xs">{review.likes?.length || 0}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setReportReviewModal({
                                  isOpen: true,
                                  reviewId: review.id,
                                  reviewUserName: review.userName,
                                });
                              }}
                              className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                              title="الإبلاغ عن التقييم"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {(!currentUser || currentUser.id === review.userId) && review.likes && review.likes.length > 0 && (
                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500">
                            <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                            <span>{review.likes.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
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
    </div>
  );
}

