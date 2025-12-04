'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, CheckCircle, MapPin, Clock, FileText, Flag, ThumbsUp, Mail, Phone, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import { User, Review } from '@/types';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';
import { getCurrentUser } from '@/lib/auth';

interface ReviewerProfileModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewerProfileModal({ userId, userName, isOpen, onClose }: ReviewerProfileModalProps) {
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
    if (isOpen && userId) {
      const userData = dataStore.getUser(userId);
      setUser(userData || null);
      
      const allReviews = dataStore.getAllReviews();
      const userReviews = allReviews.filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setReviews(userReviews);
    }
  }, [isOpen, userId]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">ملف المراجع</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Profile Header */}
          <div className="bg-emerald-600 rounded-xl p-4 text-white mb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="user-profile-container-md mb-3">
                <div className="relative flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={userName}
                      className="user-avatar-md border-white/40"
                    />
                  ) : (
                    <div className="user-avatar-placeholder-md border-white/40 bg-white/20 backdrop-blur-sm">
                      {userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-lg font-bold truncate flex-1">{userName}</h3>
                  </div>
                  {user?.bio && (
                    <p className="text-white/90 text-sm mb-2 leading-relaxed line-clamp-2">{user.bio}</p>
                  )}
                  <div className="flex items-center space-x-3 space-x-reverse text-white/80 text-xs flex-wrap gap-2">
                    {user?.location?.city && user?.privacySettings?.showLocation !== false && (
                      <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-2 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        <span>{user.location.city}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-2 py-1 rounded-full">
                      <FileText className="w-3 h-3" />
                      <span>{reviews.length} تقييم</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Details Section */}
          {user && (
            <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <h4 className="text-base font-bold text-slate-800 mb-3">معلومات المستخدم</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.privacySettings?.showEmail !== false && user.email && (
                  <div className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">البريد الإلكتروني</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                    </div>
                  </div>
                )}
                {user.privacySettings?.showPhone !== false && user.phone && (
                  <div className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">رقم الهاتف</p>
                      <p className="text-xs font-semibold text-slate-800">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.privacySettings?.showGender !== false && user.gender && (
                  <div className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">الجنس</p>
                      <p className="text-xs font-semibold text-slate-800">{user.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                    </div>
                  </div>
                )}
                {user.privacySettings?.showDateOfBirth !== false && user.dateOfBirth && (
                  <div className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-lg">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">تاريخ الميلاد</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {(!user.email || user.privacySettings?.showEmail === false) &&
               (!user.phone || user.privacySettings?.showPhone === false) &&
               (!user.gender || user.privacySettings?.showGender === false) &&
               (!user.dateOfBirth || user.privacySettings?.showDateOfBirth === false) && (
                <div className="text-center py-4 text-slate-500 text-xs">
                  لا توجد معلومات إضافية متاحة
                </div>
              )}
            </div>
          )}

          {/* Latest Activity */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <Clock className="w-4 h-4 text-[emerald-600]" />
              <h4 className="text-base font-bold text-slate-800">آخر النشاطات</h4>
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => {
                  const place = dataStore.getPlace(review.placeId);
                  return (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="user-profile-container-xs flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            {review.userAvatar ? (
                              <img
                                src={review.userAvatar}
                                alt={userName}
                                className="user-avatar-xs"
                              />
                            ) : (
                              <div className="user-avatar-placeholder-xs">
                                {userName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center space-x-1.5 space-x-reverse min-w-0">
                                <span className="user-name-sm">{userName}</span>
                              </div>
                            </div>
                            {place && (
                              <Link
                                href={`/places/${place.id}`}
                                className="text-emerald-600 text-xs hover:underline font-semibold block truncate"
                              >
                                {place.name}
                              </Link>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 flex-shrink-0 whitespace-nowrap">{formatRelativeTime(review.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="mr-1 text-xs font-semibold text-slate-600">{review.rating}.0</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed line-clamp-3">{review.comment}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-[9px] text-slate-400">{formatRelativeTime(review.createdAt)}</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {currentUser && currentUser.id !== review.userId && (
                            <>
                              <button
                                onClick={(e) => {
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
                                className={`flex items-center space-x-1 space-x-reverse text-[10px] px-2 py-1 rounded-lg transition-all ${
                                  review.likes?.includes(currentUser?.id || '') 
                                    ? 'bg-[emerald-600]/10 text-[emerald-600] hover:bg-[emerald-600]/20' 
                                    : 'text-slate-500 hover:bg-gray-100 hover:text-[emerald-600]'
                                }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${review.likes?.includes(currentUser?.id || '') ? 'fill-current' : ''}`} />
                                <span className="font-semibold">{review.likes?.length || 0}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportReviewModal({
                                    isOpen: true,
                                    reviewId: review.id,
                                    reviewUserName: review.userName,
                                  });
                                }}
                                className="flex items-center space-x-1 space-x-reverse text-[10px] text-slate-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                title="الإبلاغ عن التقييم"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {(!currentUser || currentUser.id === review.userId) && review.likes && review.likes.length > 0 && (
                            <div className="flex items-center space-x-1 space-x-reverse text-[10px] text-slate-500">
                              <ThumbsUp className="w-3 h-3 text-slate-400" />
                              <span>{review.likes.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-slate-500 text-sm">لا توجد تقييمات بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
