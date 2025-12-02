'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { User, Review } from '@/types';
import { X, Star, CheckCircle, Award, MapPin, Clock, MessageSquare, Crown, Gem, Zap, Shield, ArrowRight, ThumbsUp, Flag } from 'lucide-react';
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

  const getBadgeInfo = (badge?: string) => {
    switch (badge) {
      case 'bronze':
        return { name: 'برونزي', icon: Award, color: 'from-amber-500 to-orange-500' };
      case 'silver':
        return { name: 'فضي', icon: Shield, color: 'from-gray-400 to-gray-600' };
      case 'gold':
        return { name: 'ذهبي', icon: Crown, color: 'from-yellow-400 to-yellow-600' };
      case 'platinum':
        return { name: 'بلاتيني', icon: Zap, color: 'from-cyan-400 to-blue-500' };
      case 'diamond':
        return { name: 'ماسي', icon: Gem, color: 'from-purple-400 to-pink-500' };
      case 'expert':
        return { name: 'خبير', icon: Award, color: 'from-green-500 to-emerald-600' };
      default:
        return { name: 'مبتدئ', icon: Star, color: 'from-gray-300 to-gray-400' };
    }
  };

  const badgeInfo = getBadgeInfo(user.loyaltyBadge);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <Link 
          href="/home" 
          className="inline-flex items-center space-x-2 space-x-reverse text-emerald-600 hover:text-emerald-700 transition mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="font-semibold">رجوع</span>
        </Link>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="user-profile-container-lg mb-4">
              <div className="relative flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar-lg"
                  />
                ) : (
                  <div className="user-avatar-placeholder-lg">
                    {user.name.charAt(0)}
                  </div>
                )}
                {(user.loyaltyBadge || user.verifiedBadge) && (
                  <div className="user-badge-lg">
                    {user.loyaltyBadge && <BadgeIcon className="user-badge-icon-lg text-amber-500" />}
                    {user.verifiedBadge && !user.loyaltyBadge && <CheckCircle className="user-badge-icon-lg text-green-500 fill-current" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h2 className="user-name-lg">{user.name}</h2>
                  <div className="flex items-center space-x-1.5 space-x-reverse flex-shrink-0">
                    {user.loyaltyBadge && user.role === 'user' && (
                      <div className={`flex items-center space-x-1 space-x-reverse px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${badgeInfo.color} text-white whitespace-nowrap`}>
                        <BadgeIcon className="w-4 h-4" />
                        <span>{badgeInfo.name}</span>
                      </div>
                    )}
                    {user.verifiedBadge && !user.loyaltyBadge && (
                      <div className="flex items-center space-x-1 space-x-reverse bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                        <CheckCircle className="w-4 h-4 fill-current" />
                        <span>خبير</span>
                      </div>
                    )}
                  </div>
                </div>
                {user.bio && (
                  <p className="text-white/90 text-sm mb-3 leading-relaxed line-clamp-2">{user.bio}</p>
                )}
                <div className="flex items-center space-x-4 space-x-reverse text-white/80 text-sm flex-wrap gap-2">
                  {user.location?.city && (
                    <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{user.location.city}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-3 py-1 rounded-full">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{reviews.length} تقييم</span>
                  </div>
                  {user && user.loyaltyPoints > 0 && (
                    <div className="flex items-center space-x-1 space-x-reverse bg-white/10 px-3 py-1 rounded-full">
                      <Award className="w-3.5 h-3.5" />
                      <span>{user.loyaltyPoints} نقطة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-800">التقييمات</h3>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => {
                const place = dataStore.getPlace(review.placeId);
                return (
                  <Link
                    key={review.id}
                    href={`/places/${review.placeId}`}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-all"
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
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        {review.isExpert && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border-2 border-white">
                            <CheckCircle className="w-2.5 h-2.5 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5 space-x-reverse min-w-0">
                            <span className="font-semibold text-sm text-gray-800 truncate">{user.name}</span>
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
                          <p className="text-xs text-gray-500 mb-1 truncate">
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
                      <span className="mr-1.5 text-xs font-semibold text-gray-600">{review.rating}.0</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-2">{review.comment}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[9px] text-gray-400">{formatRelativeTime(review.createdAt)}</span>
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
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600'
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
                              className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                              title="الإبلاغ عن التقييم"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {(!currentUser || currentUser.id === review.userId) && review.likes && review.likes.length > 0 && (
                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                            <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">لا توجد تقييمات بعد</p>
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

