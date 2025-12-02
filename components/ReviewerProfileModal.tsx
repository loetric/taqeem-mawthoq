'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, CheckCircle, Award, MapPin, Clock, MessageSquare, Crown, Gem, Zap, Shield, Flag, ThumbsUp } from 'lucide-react';
import { User, Review, LoyaltyBadge } from '@/types';
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
          <h2 className="text-lg font-bold text-gray-800">ملف المراجع</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[emerald-600] to-[emerald-700] rounded-xl p-4 text-white mb-4 relative overflow-hidden">
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
                  {(user?.loyaltyBadge || user?.verifiedBadge) && (
                    <div className="user-badge-md">
                      {user.loyaltyBadge === 'bronze' && <Award className="user-badge-icon-sm text-amber-500" />}
                      {user.loyaltyBadge === 'silver' && <Shield className="user-badge-icon-sm text-slate-400" />}
                      {user.loyaltyBadge === 'gold' && <Crown className="user-badge-icon-sm text-yellow-400" />}
                      {user.loyaltyBadge === 'platinum' && <Zap className="user-badge-icon-sm text-cyan-400" />}
                      {user.loyaltyBadge === 'diamond' && <Gem className="user-badge-icon-sm text-purple-400" />}
                      {user.loyaltyBadge === 'expert' && <Award className="user-badge-icon-sm text-green-500" />}
                      {user?.verifiedBadge && !user.loyaltyBadge && <CheckCircle className="user-badge-icon-sm text-green-500 fill-current" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-lg font-bold truncate flex-1">{userName}</h3>
                    <div className="flex items-center space-x-1.5 space-x-reverse flex-shrink-0">
                      {user?.loyaltyBadge && user.role === 'user' && (
                        <div className={`flex items-center space-x-1 space-x-reverse px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                          user.loyaltyBadge === 'bronze' ? 'bg-amber-500' :
                          user.loyaltyBadge === 'silver' ? 'bg-gray-400' :
                          user.loyaltyBadge === 'gold' ? 'bg-yellow-400' :
                          user.loyaltyBadge === 'platinum' ? 'bg-cyan-400' :
                          user.loyaltyBadge === 'diamond' ? 'bg-purple-400' :
                          'bg-green-500'
                        } text-white`}>
                          <span>{
                            user.loyaltyBadge === 'bronze' ? 'برونزي' :
                            user.loyaltyBadge === 'silver' ? 'فضي' :
                            user.loyaltyBadge === 'gold' ? 'ذهبي' :
                            user.loyaltyBadge === 'platinum' ? 'بلاتيني' :
                            user.loyaltyBadge === 'diamond' ? 'ماسي' :
                            'خبير'
                          }</span>
                        </div>
                      )}
                      {user?.verifiedBadge && !user.loyaltyBadge && (
                        <div className="flex items-center space-x-1 space-x-reverse bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                          <CheckCircle className="w-3 h-3 fill-current" />
                          <span>خبير</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {user?.bio && (
                    <p className="text-white/90 text-sm mb-2 leading-relaxed line-clamp-2">{user.bio}</p>
                  )}
                  <div className="flex items-center space-x-3 space-x-reverse text-white/80 text-xs flex-wrap gap-2">
                    {user?.location?.city && (
                      <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-2 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        <span>{user.location.city}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-2 py-1 rounded-full">
                      <MessageSquare className="w-3 h-3" />
                      <span>{reviews.length} تقييم</span>
                    </div>
                    {user && user.loyaltyPoints > 0 && (
                      <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" />
                        <span>{user.loyaltyPoints} نقطة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Activity */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <Clock className="w-4 h-4 text-[emerald-600]" />
              <h4 className="text-base font-bold text-gray-800">آخر النشاطات</h4>
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
                            {review.isExpert && (
                              <div className="user-badge-xs bg-green-500">
                                <CheckCircle className="user-badge-icon-xs text-white fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center space-x-1.5 space-x-reverse min-w-0">
                                <span className="user-name-sm">{userName}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 space-x-reverse flex-shrink-0 mr-1.5">
                                {review.isExpert && (
                                  <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                    خبير
                                  </span>
                                )}
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
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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
