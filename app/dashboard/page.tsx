'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { Place, Review, Question, Announcement } from '@/types';
import { dataStore } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { formatRelativeTime } from '@/lib/dateUtils';
import { 
  Plus, Edit, Trash2, MapPin, Phone, MessageCircle, Clock, Star, 
  Bell, MessageSquare, HelpCircle, TrendingUp, Eye, ThumbsUp,
  BarChart3, Settings, Save, X, Calendar, Award, Users, Activity, CheckCircle, Send, Radio, Flag
} from 'lucide-react';
import { subscriptionService } from '@/lib/subscriptionService';
import { NotificationCriteria } from '@/types';
import HoursEditorForm from '@/components/HoursEditorForm';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import EditModal from '@/components/EditModal';
import EditAnnouncementModal from '@/components/EditAnnouncementModal';
import ReportReviewModal from '@/components/ReportReviewModal';

type ActiveTab = 'overview' | 'edit' | 'reviews' | 'questions' | 'announcements' | 'analytics' | 'notifications';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showForm, setShowForm] = useState(false);
  const [showHoursForm, setShowHoursForm] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    googleMapsUrl: '',
    phone: '',
    whatsapp: '',
    address: '',
    imageUrl: '',
    placeType: 'other' as Place['placeType'],
  });

  // Statistics
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalQuestions: 0,
    unansweredQuestions: 0,
    unansweredReviews: 0, // Reviews without owner response
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    totalLikes: 0,
  });

  // Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { showToast, ToastContainer } = useToast();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    title: string;
    label: string;
    value: string;
    multiline?: boolean;
    onSave: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    label: '',
    value: '',
    multiline: false,
    onSave: () => {},
  });
  const [editAnnouncementModal, setEditAnnouncementModal] = useState<{
    isOpen: boolean;
    announcementId: string;
    title: string;
    content: string;
  }>({
    isOpen: false,
    announcementId: '',
    title: '',
    content: '',
  });
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
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    const ownerPlaces = dataStore.getPlacesByOwner(currentUser.id);
    if (ownerPlaces.length > 0) {
      router.push('/my-place');
      return;
    }
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (selectedPlace) {
      loadPlaceData(selectedPlace.id);
    }
  }, [selectedPlace]);

  const loadPlaceData = (placeId: string) => {
    const placeReviews = dataStore.getReviewsByPlace(placeId);
    const placeQuestions = dataStore.getQuestionsByPlace(placeId);
    const placeAnnouncements = dataStore.getAnnouncementsByPlace(placeId);
    
    setReviews(placeReviews);
    setQuestions(placeQuestions);
    setAnnouncements(placeAnnouncements);
    
    // Calculate statistics
    const avgRating = dataStore.getAverageRating(placeId);
    const unansweredQ = placeQuestions.filter(q => q.answers.length === 0).length;
    const unansweredR = placeReviews.filter(r => !r.ownerResponse).length; // Reviews without owner response
    const activeAnn = placeAnnouncements.filter(a => a.isActive).length;
    const totalLikes = placeReviews.reduce((sum, r) => sum + (r.likes?.length || 0), 0);
    
    setStats({
      totalReviews: placeReviews.length,
      averageRating: avgRating,
      totalQuestions: placeQuestions.length,
      unansweredQuestions: unansweredQ,
      unansweredReviews: unansweredR,
      totalAnnouncements: placeAnnouncements.length,
      activeAnnouncements: activeAnn,
      totalLikes,
    });
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setActiveTab('overview');
    setFormData({
      name: place.name,
      description: place.description,
      category: place.category,
      googleMapsUrl: place.googleMapsUrl,
      phone: place.phone || '',
      whatsapp: place.whatsapp || '',
      address: place.address || '',
      imageUrl: place.imageUrl || '',
      placeType: place.placeType,
    });
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace || !user) return;

    dataStore.updatePlace(selectedPlace.id, formData);
    const updatedPlace = dataStore.getPlace(selectedPlace.id);
    if (updatedPlace) {
      setSelectedPlace(updatedPlace);
      setPlaces(dataStore.getPlacesByOwner(user.id));
      setShowForm(false);
      showToast('تم حفظ التعديلات بنجاح', 'success');
    }
  };

  const handleCreateAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    if (!selectedPlace) return;
    dataStore.createAnnouncement({
      ...announcement,
      placeId: selectedPlace.id,
    });
    loadPlaceData(selectedPlace.id);
  };

  const handleUpdateHours = (updatedHours: { [key: string]: { open: string; close: string; closed?: boolean } } | undefined) => {
    if (!selectedPlace || !user || !updatedHours) return;
    dataStore.updatePlace(selectedPlace.id, { hours: updatedHours });
    const updatedPlace = dataStore.getPlace(selectedPlace.id);
    if (updatedPlace) {
      setSelectedPlace(updatedPlace);
      setShowHoursForm(false);
      showToast('تم حفظ أوقات العمل بنجاح', 'success');
    }
  };

  const handleAnswerQuestion = (questionId: string, answer: string) => {
    if (!selectedPlace || !user) return;
    dataStore.addAnswer(questionId, {
      questionId,
      userId: user.id,
      userName: user.name,
      answer,
      isOwner: true,
    });
    loadPlaceData(selectedPlace.id);
  };

  const handleRespondToReview = (reviewId: string, response: string) => {
    if (!selectedPlace || !user) return;
    dataStore.addReviewResponse(reviewId, user.id, response);
    loadPlaceData(selectedPlace.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">لوحة التحكم</h1>
          <p className="text-sm sm:text-base text-slate-600">إدارة ومتابعة نشاطك التجاري</p>
        </div>

        {/* Places Selector */}
        {places.length > 0 && (
          <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              اختر المكان المراد إدارته
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {places.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                    selectedPlace?.id === place.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  {place.name}
                </button>
              ))}
              <Link
                href="/home"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm bg-gray-100 text-slate-700 hover:bg-gray-200 transition-all flex items-center space-x-1 space-x-reverse"
              >
                <Plus className="icon-xs sm:icon-sm" />
                <span className="hidden sm:inline">إضافة مكان جديد</span>
                <span className="sm:hidden">إضافة</span>
              </Link>
            </div>
          </div>
        )}

        {selectedPlace ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-blue-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <Star className="icon-xs sm:icon-sm lg:icon-md text-emerald-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">متوسط التقييم</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-green-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <MessageSquare className="icon-xs sm:icon-sm lg:icon-md text-emerald-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">التقييمات</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{stats.totalReviews}</p>
              </div>

              <div className="bg-purple-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-purple-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <HelpCircle className="icon-xs sm:icon-sm lg:icon-md text-slate-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">الأسئلة</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{stats.totalQuestions}</p>
              </div>

              <div className="bg-orange-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-orange-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <HelpCircle className="icon-xs sm:icon-sm lg:icon-md text-amber-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">غير مجاب</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{stats.unansweredQuestions}</p>
              </div>

              <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-yellow-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <Bell className="icon-xs sm:icon-sm lg:icon-md text-yellow-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-yellow-800">الإعلانات</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-900">{stats.totalAnnouncements}</p>
              </div>

              <div className="bg-pink-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-pink-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <ThumbsUp className="icon-xs sm:icon-sm lg:icon-md text-emerald-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">الإعجابات</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{stats.totalLikes}</p>
              </div>

              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-slate-200">
                <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse mb-1 sm:mb-2">
                  <Eye className="icon-xs sm:icon-sm lg:icon-md text-slate-600" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">المشاهدات</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">-</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6">
              <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'نظرة عامة', icon: BarChart3, badge: null, shortLabel: 'نظرة' },
                  { id: 'edit', label: 'تعديل المعلومات', icon: Edit, badge: null, shortLabel: 'تعديل' },
                  { id: 'reviews', label: 'التقييمات', icon: MessageSquare, badge: stats.unansweredReviews, shortLabel: 'تقييمات' },
                  { id: 'questions', label: 'الأسئلة', icon: HelpCircle, badge: stats.unansweredQuestions, shortLabel: 'أسئلة' },
                  { id: 'announcements', label: 'الإعلانات', icon: Bell, badge: null, shortLabel: 'إعلانات' },
                  { id: 'notifications', label: 'إشعارات موجهة', icon: Bell, badge: null, shortLabel: 'إشعارات' },
                  { id: 'analytics', label: 'التحليلات', icon: TrendingUp, badge: null, shortLabel: 'تحليلات' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const badgeCount = tab.badge && tab.badge > 0 ? tab.badge : null;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`flex items-center space-x-1 sm:space-x-2 space-x-reverse px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative flex-shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="icon-xs sm:icon-sm" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      {badgeCount !== null && badgeCount > 0 && (
                        <span className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-white text-[9px] sm:text-[10px] rounded-full icon-sm sm:icon-md flex items-center justify-center font-bold shadow-lg ${
                          activeTab === tab.id ? 'bg-red-400' : 'bg-red-500'
                        }`}>
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Place Info Card */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                          <MapPin className="icon-md text-emerald-600" />
                          <span>معلومات المكان</span>
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-slate-500">الاسم</span>
                            <p className="text-slate-800 font-bold">{selectedPlace.name}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-500">الفئة</span>
                            <p className="text-slate-800">{selectedPlace.category}</p>
                          </div>
                          {selectedPlace.phone && (
                            <div>
                              <span className="text-xs font-semibold text-slate-500">الهاتف</span>
                              <p className="text-slate-800">{selectedPlace.phone}</p>
                            </div>
                          )}
                          {selectedPlace.address && (
                            <div>
                              <span className="text-xs font-semibold text-slate-500">العنوان</span>
                              <p className="text-slate-800">{selectedPlace.address}</p>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/places/${selectedPlace.id}`}
                          className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                        >
                          عرض صفحة المكان →
                        </Link>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                          <Activity className="icon-md text-emerald-600" />
                          <span>إجراءات سريعة</span>
                        </h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setActiveTab('edit')}
                            className="w-full text-right px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition text-sm font-semibold text-slate-700 flex items-center justify-between"
                          >
                            <span>تعديل معلومات المكان</span>
                            <Edit className="icon-sm icon-primary" />
                          </button>
                          <button
                            onClick={() => setActiveTab('announcements')}
                            className="w-full text-right px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition text-sm font-semibold text-slate-700 flex items-center justify-between"
                          >
                            <span>إضافة إعلان جديد</span>
                            <Plus className="icon-sm icon-primary" />
                          </button>
                          {stats.unansweredQuestions > 0 && (
                            <button
                              onClick={() => setActiveTab('questions')}
                              className="w-full text-right px-4 py-2 bg-amber-50 rounded-lg hover:bg-amber-100 transition text-sm font-semibold text-amber-700 flex items-center justify-between"
                            >
                              <span>رد على {stats.unansweredQuestions} سؤال</span>
                              <HelpCircle className="icon-sm icon-primary" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">النشاط الأخير</h3>
                      <div className="space-y-3">
                        {reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                            <MessageSquare className="icon-md text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-slate-800">
                                <span className="font-semibold">{review.userName}</span> أضاف تقييم جديد
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(review.createdAt)}</p>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`icon-xs ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                        {reviews.length === 0 && (
                          <p className="text-center text-slate-500 py-8">لا يوجد نشاط حديث</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Tab */}
                {activeTab === 'edit' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800">تعديل معلومات المكان</h3>
                      <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center space-x-2 space-x-reverse text-emerald-600 hover:text-emerald-700 transition"
                      >
                        {showForm ? <X className="icon-md icon-primary" /> : <Edit className="icon-md icon-primary" />}
                        <span>{showForm ? 'إلغاء' : 'تعديل'}</span>
                      </button>
                    </div>

                    {showForm ? (
                      <form onSubmit={handleSavePlace} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-slate-700 font-semibold mb-2">اسم المكان *</label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-2">الفئة *</label>
                            <input
                              type="text"
                              required
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-2">الوصف *</label>
                          <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-slate-700 font-semibold mb-2">رقم الهاتف</label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                              placeholder="+966501234567"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-2">رقم الواتساب</label>
                            <input
                              type="tel"
                              value={formData.whatsapp}
                              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                              placeholder="+966501234567"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-2">العنوان</label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-2">رابط خرائط جوجل *</label>
                          <input
                            type="url"
                            required
                            value={formData.googleMapsUrl}
                            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-2">رابط الصورة</label>
                          <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all shadow-md flex items-center justify-center space-x-2 space-x-reverse"
                        >
                          <Save className="icon-md icon-primary" />
                          <span>حفظ التعديلات</span>
                        </button>
                      </form>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <span className="text-xs font-semibold text-slate-500">الاسم</span>
                            <p className="text-slate-800 font-bold mt-1">{selectedPlace.name}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-500">الفئة</span>
                            <p className="text-slate-800 mt-1">{selectedPlace.category}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-500">الهاتف</span>
                            <p className="text-slate-800 mt-1">{selectedPlace.phone || 'غير محدد'}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-500">العنوان</span>
                            <p className="text-slate-800 mt-1">{selectedPlace.address || 'غير محدد'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Operating Hours Section */}
                    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
                          <Clock className="icon-md text-emerald-600" />
                          <span>ساعات العمل</span>
                        </h4>
                        <button
                          onClick={() => setShowHoursForm(!showHoursForm)}
                          className="flex items-center space-x-2 space-x-reverse text-emerald-600 hover:text-emerald-700 transition text-sm font-semibold"
                        >
                          {showHoursForm ? <X className="icon-sm icon-primary" /> : <Edit className="icon-sm icon-primary" />}
                          <span>{showHoursForm ? 'إلغاء' : 'تعديل'}</span>
                        </button>
                      </div>

                      {showHoursForm ? (
                        <HoursEditorForm
                          hours={selectedPlace.hours}
                          onSave={handleUpdateHours}
                          onCancel={() => setShowHoursForm(false)}
                        />
                      ) : (
                        <div className="space-y-2">
                          {selectedPlace.hours ? (
                            Object.entries(selectedPlace.hours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-semibold text-slate-700">{day}</span>
                                <span className={`text-sm font-semibold ${
                                  hours.closed ? 'text-red-600' : 'text-slate-800'
                                }`}>
                                  {hours.closed ? 'مغلق' : `${hours.open} - ${hours.close}`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 text-sm text-center py-4">لا توجد ساعات عمل محددة</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6">التقييمات ({reviews.length})</h3>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3 space-x-reverse flex-1">
                                {review.userAvatar ? (
                                  <img
                                    src={review.userAvatar}
                                    alt={review.userName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {review.userName.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                    <Link
                                      href={`/profile/${review.userId}`}
                                      className="font-semibold text-slate-800 hover:text-emerald-600 transition"
                                    >
                                      {review.userName}
                                    </Link>
                                    {review.isExpert && (
                                      <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        خبير
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`icon-sm ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="text-sm font-semibold text-slate-600 mr-1">{review.rating}.0</span>
                                  </div>
                                  <p className="text-slate-700 text-sm mb-2">{review.comment}</p>
                                  <p className="text-[9px] text-slate-400">{formatRelativeTime(review.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => {
                                    setReportReviewModal({
                                      isOpen: true,
                                      reviewId: review.id,
                                      reviewUserName: review.userName,
                                    });
                                  }}
                                  className="text-slate-500 hover:text-red-500 transition text-xs flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-lg hover:bg-red-50"
                                  title="الإبلاغ عن التقييم"
                                >
                                  <Flag className="icon-xs" />
                                  <span>إبلاغ</span>
                                </button>
                              </div>
                            </div>
                            {review.ownerResponse ? (
                              <div className="mt-3 pr-4 border-r-4 border-emerald-600 bg-white rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <CheckCircle className="icon-sm text-emerald-600 fill-current" />
                                    <span className="font-semibold text-emerald-600 text-sm">ردك</span>
                                  </div>
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <button
                                      onClick={() => {
                                        setEditModal({
                                          isOpen: true,
                                          title: 'تعديل الرد',
                                          label: 'الرد',
                                          value: review.ownerResponse?.text || '',
                                          multiline: true,
                                          onSave: (newResponse) => {
                                            if (selectedPlace && user) {
                                              dataStore.updateReviewResponse(review.id, user.id, newResponse);
                                              loadPlaceData(selectedPlace.id);
                                              showToast('تم تحديث الرد بنجاح', 'success');
                                            }
                                            setEditModal({ ...editModal, isOpen: false });
                                          },
                                        });
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 transition text-xs flex items-center space-x-1 space-x-reverse"
                                    >
                                      <Edit className="icon-xs" />
                                      <span>تعديل</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: 'حذف الرد',
                                          message: 'هل أنت متأكد من حذف هذا الرد؟',
                                          type: 'danger',
                                          onConfirm: () => {
                                            if (selectedPlace && user) {
                                              dataStore.deleteReviewResponse(review.id, user.id);
                                              loadPlaceData(selectedPlace.id);
                                              showToast('تم حذف الرد بنجاح', 'success');
                                            }
                                            setConfirmModal({ ...confirmModal, isOpen: false });
                                          },
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-600 transition text-xs flex items-center space-x-1 space-x-reverse"
                                    >
                                      <Trash2 className="icon-xs" />
                                      <span>حذف</span>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-700 text-sm">{review.ownerResponse.text}</p>
                                <p className="text-[9px] text-slate-400 mt-2">{formatRelativeTime(review.ownerResponse.respondedAt)}</p>
                              </div>
                            ) : (
                              <ReviewResponseForm
                                reviewId={review.id}
                                onSubmit={(response) => handleRespondToReview(review.id, response)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <MessageSquare className="icon-2xl mx-auto mb-4 icon-muted" />
                        <p className="text-slate-500">لا توجد تقييمات بعد</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6">
                      الأسئلة ({questions.length})
                      {stats.unansweredQuestions > 0 && (
                        <span className="mr-2 text-amber-600 text-base">
                          ({stats.unansweredQuestions} غير مجاب)
                        </span>
                      )}
                    </h3>
                    {questions.length > 0 ? (
                      <div className="space-y-4">
                        {questions.map((question) => (
                          <div key={question.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start space-x-3 space-x-reverse mb-3">
                              <HelpCircle className="icon-md text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                  <Link
                                    href={`/profile/${question.userId}`}
                                    className="font-semibold text-slate-800 hover:text-emerald-600 transition"
                                  >
                                    {question.userName}
                                  </Link>
                                  <span className="text-[9px] text-slate-400">{formatRelativeTime(question.createdAt)}</span>
                                </div>
                                <p className="text-slate-700 mb-3">{question.question}</p>
                                {question.answers.length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    {question.answers.map((answer) => (
                                      <div key={answer.id} className="bg-white rounded-lg p-3 border-r-4 border-emerald-600">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center space-x-2 space-x-reverse">
                                            <span className="font-semibold text-sm text-slate-800">
                                              {answer.isOwner ? 'أنت' : answer.userName}
                                            </span>
                                            <span className="text-[9px] text-slate-400">{formatRelativeTime(answer.createdAt)}</span>
                                          </div>
                                          {answer.isOwner && user && (
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                              <button
                                                onClick={() => {
                                                  setEditModal({
                                                    isOpen: true,
                                                    title: 'تعديل الإجابة',
                                                    label: 'الإجابة',
                                                    value: answer.answer,
                                                    multiline: true,
                                                    onSave: (newAnswer) => {
                                                      if (selectedPlace) {
                                                        dataStore.updateAnswer(question.id, answer.id, user.id, newAnswer);
                                                        loadPlaceData(selectedPlace.id);
                                                        showToast('تم تحديث الإجابة بنجاح', 'success');
                                                      }
                                                      setEditModal({ ...editModal, isOpen: false });
                                                    },
                                                  });
                                                }}
                                                className="text-emerald-600 hover:text-emerald-700 transition text-xs flex items-center space-x-1 space-x-reverse"
                                              >
                                                <Edit className="icon-xs" />
                                                <span>تعديل</span>
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setConfirmModal({
                                                    isOpen: true,
                                                    title: 'حذف الإجابة',
                                                    message: 'هل أنت متأكد من حذف هذه الإجابة؟',
                                                    type: 'danger',
                                                    onConfirm: () => {
                                                      if (selectedPlace) {
                                                        dataStore.deleteAnswer(question.id, answer.id, user.id);
                                                        loadPlaceData(selectedPlace.id);
                                                        showToast('تم حذف الإجابة بنجاح', 'success');
                                                      }
                                                      setConfirmModal({ ...confirmModal, isOpen: false });
                                                    },
                                                  });
                                                }}
                                                className="text-red-500 hover:text-red-600 transition text-xs flex items-center space-x-1 space-x-reverse"
                                              >
                                                <Trash2 className="icon-xs" />
                                                <span>حذف</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-slate-700 text-sm">{answer.answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {question.answers.length === 0 && (
                                  <QuestionAnswerForm
                                    questionId={question.id}
                                    onSubmit={(answer) => handleAnswerQuestion(question.id, answer)}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-slate-500">لا توجد أسئلة بعد</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                  <AnnouncementsManager
                    place={selectedPlace}
                    announcements={announcements}
                    onCreate={handleCreateAnnouncement}
                    onUpdate={() => loadPlaceData(selectedPlace.id)}
                    showToast={showToast}
                    setConfirmModal={setConfirmModal}
                    confirmModal={confirmModal}
                    setEditAnnouncementModal={setEditAnnouncementModal}
                  />
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <TargetedNotificationsManager place={selectedPlace} showToast={showToast} />
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <AnalyticsView place={selectedPlace} reviews={reviews} stats={stats} />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
            <MapPin className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <p className="text-2xl text-slate-500 mb-2">لا توجد أماكن بعد</p>
            <p className="text-slate-400 mb-6">ابدأ بإضافة أول مكان لك</p>
            <Link
              href="/home"
              className="inline-flex items-center space-x-2 space-x-reverse bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              <Plus className="icon-md icon-primary" />
              <span>إضافة مكان جديد</span>
            </Link>
          </div>
        )}
      </main>

      <TabNavigation />

      {/* Toast Container */}
      <ToastContainer />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        title={editModal.title}
        label={editModal.label}
        value={editModal.value}
        multiline={editModal.multiline}
        onSave={editModal.onSave}
        onCancel={() => setEditModal({ ...editModal, isOpen: false })}
      />

      {/* Edit Announcement Modal */}
      <EditAnnouncementModal
        isOpen={editAnnouncementModal.isOpen}
        title={editAnnouncementModal.title}
        content={editAnnouncementModal.content}
        onSave={(title, content) => {
          dataStore.updateAnnouncement(editAnnouncementModal.announcementId, {
            title,
            content,
          });
          loadPlaceData(selectedPlace?.id || '');
          showToast('تم تحديث الإعلان بنجاح', 'success');
          setEditAnnouncementModal({ ...editAnnouncementModal, isOpen: false });
        }}
        onCancel={() => setEditAnnouncementModal({ ...editAnnouncementModal, isOpen: false })}
      />

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportReviewModal.isOpen}
        reviewUserName={reportReviewModal.reviewUserName}
        onConfirm={(reason) => {
          const review = reviews.find(r => r.id === reportReviewModal.reviewId);
          if (review) {
            review.reports = (review.reports || 0) + 1;
            loadPlaceData(selectedPlace?.id || '');
            showToast('تم الإبلاغ عن التقييم. شكراً لملاحظاتك.', 'success');
          }
          setReportReviewModal({ ...reportReviewModal, isOpen: false });
        }}
        onCancel={() => setReportReviewModal({ ...reportReviewModal, isOpen: false })}
      />
    </div>
  );
}

// Review Response Form Component
function ReviewResponseForm({ reviewId, onSubmit }: { reviewId: string; onSubmit: (response: string) => void }) {
  const [response, setResponse] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-emerald-600 text-sm hover:underline font-semibold"
      >
        رد على التقييم
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-sm"
        placeholder="اكتب ردك هنا..."
      />
      <div className="flex space-x-2 space-x-reverse">
        <button
          onClick={() => {
            if (response.trim()) {
              onSubmit(response);
              setResponse('');
              setShowForm(false);
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-semibold shadow-md"
        >
          إرسال
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setResponse('');
          }}
          className="bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-xs"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

// Question Answer Form Component
function QuestionAnswerForm({ questionId, onSubmit }: { questionId: string; onSubmit: (answer: string) => void }) {
  const [answer, setAnswer] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-emerald-600 text-sm hover:underline font-semibold"
      >
        إجابة على السؤال
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-sm"
        placeholder="اكتب إجابتك هنا..."
      />
      <div className="flex space-x-2 space-x-reverse">
        <button
          onClick={() => {
            if (answer.trim()) {
              onSubmit(answer);
              setAnswer('');
              setShowForm(false);
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-semibold shadow-md"
        >
          إرسال
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setAnswer('');
          }}
          className="bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-xs"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

// Announcements Manager Component
function AnnouncementsManager({ 
  place, 
  announcements, 
  onCreate, 
  onUpdate,
  showToast,
  setConfirmModal,
  confirmModal,
  setEditAnnouncementModal,
}: { 
  place: Place; 
  announcements: Announcement[]; 
  onCreate: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onUpdate: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  setConfirmModal: (modal: { isOpen: boolean; title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' }) => void;
  confirmModal: { isOpen: boolean; title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' };
  setEditAnnouncementModal: (modal: { isOpen: boolean; announcementId: string; title: string; content: string }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'offer' | 'event',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      placeId: place.id,
      isActive: true,
    });
    setFormData({ title: '', content: '', type: 'announcement' });
    setShowForm(false);
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">الإعلانات والأحداث ({announcements.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 space-x-reverse bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
        >
          {showForm ? <X className="icon-sm icon-primary" /> : <Plus className="icon-sm icon-primary" />}
          <span>{showForm ? 'إلغاء' : 'إضافة إعلان'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
              >
                <option value="announcement">إعلان</option>
                <option value="offer">عرض</option>
                <option value="event">حدث</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">العنوان</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">المحتوى</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 resize-none text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg hover:shadow-lg transition-all font-semibold shadow-md text-sm"
            >
              نشر الإعلان
            </button>
          </div>
        </form>
      )}

      {announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-slate-50 border-r-4 border-emerald-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {announcement.type === 'event' && <Calendar className="icon-sm text-emerald-600" />}
                  {announcement.type === 'offer' && <Star className="icon-sm text-yellow-500" />}
                  {announcement.type === 'announcement' && <Bell className="icon-sm text-emerald-600" />}
                  <span className="text-xs font-semibold text-emerald-600 uppercase">
                    {announcement.type === 'event' ? 'حدث' : announcement.type === 'offer' ? 'عرض' : 'إعلان'}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {formatRelativeTime(announcement.createdAt)}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 mb-1 text-sm">{announcement.title}</h4>
              <p className="text-slate-700 text-sm leading-relaxed">{announcement.content}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  announcement.isActive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-slate-600'
                }`}>
                  {announcement.isActive ? 'نشط' : 'غير نشط'}
                </span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => {
                      setEditAnnouncementModal({
                        isOpen: true,
                        announcementId: announcement.id,
                        title: announcement.title,
                        content: announcement.content,
                      });
                    }}
                    className="text-emerald-600 hover:text-emerald-700 transition text-xs flex items-center space-x-1 space-x-reverse px-2 py-1 rounded hover:bg-emerald-600/10"
                  >
                                                <Edit className="icon-xs" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'حذف الإعلان',
                        message: 'هل أنت متأكد من حذف هذا الإعلان؟',
                        type: 'danger',
                        onConfirm: () => {
                          const user = getCurrentUser();
                          if (user) {
                            dataStore.deleteAnnouncement(announcement.id, user.id);
                            onUpdate();
                            showToast('تم حذف الإعلان بنجاح', 'success');
                          }
                          setConfirmModal({ ...confirmModal, isOpen: false });
                        },
                      });
                    }}
                    className="text-red-500 hover:text-red-600 transition text-xs flex items-center space-x-1 space-x-reverse px-2 py-1 rounded hover:bg-red-50"
                  >
                                                <Trash2 className="icon-xs" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-slate-500">لا توجد إعلانات بعد</p>
        </div>
      )}
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ 
  place, 
  reviews, 
  stats 
}: { 
  place: Place; 
  reviews: Review[]; 
  stats: any;
}) {
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">التحليلات والإحصائيات</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="icon-md text-emerald-600" />
            <span>توزيع التقييمات</span>
          </h4>
          <div className="space-y-3">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center space-x-3 space-x-reverse">
                <div className="flex items-center space-x-1 space-x-reverse w-12">
                  <span className="text-sm font-bold text-slate-800">{star}</span>
                  <Star className="icon-sm text-yellow-500 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-left">
                  <span className="text-sm font-bold text-slate-700">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
            <TrendingUp className="icon-md text-emerald-600" />
            <span>ملخص التقييمات</span>
          </h4>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600">إجمالي التقييمات</span>
              <p className="text-2xl font-bold text-slate-800">{stats.totalReviews}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">متوسط التقييم</span>
              <p className="text-2xl font-bold text-slate-800">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">إجمالي الإعجابات</span>
              <p className="text-2xl font-bold text-slate-800">{stats.totalLikes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Targeted Notifications Manager Component
function TargetedNotificationsManager({ place, showToast }: { place: Place; showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    radius: 1, // Default 1 km
    gender: 'all' as 'male' | 'female' | 'all',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!place.location) {
      showToast('المكان لا يحتوي على موقع جغرافي', 'error');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      // Get targeted users based on criteria
      const criteria: NotificationCriteria = {
        radius: notificationForm.radius,
        location: place.location,
        gender: notificationForm.gender,
      };

      const targetedUsers = subscriptionService.getTargetedUsers(criteria, place);

      // Send notification to each user
      let sentCount = 0;
      targetedUsers.forEach(user => {
        dataStore.createNotification({
          userId: user.id,
          type: 'announcement',
          title: notificationForm.title,
          message: notificationForm.message,
          placeId: place.id,
          actionUrl: `/places/${place.id}`,
        });
        sentCount++;
      });

      setResult({ sent: sentCount, total: targetedUsers.length });
      setNotificationForm({ title: '', message: '', radius: 1, gender: 'all' });
      
      setTimeout(() => setResult(null), 5000);
      showToast(`تم إرسال الإشعارات إلى ${sentCount} مستخدم`, 'success');
    } catch (error) {
      console.error('Error sending notifications:', error);
      showToast('حدث خطأ أثناء إرسال الإشعارات', 'error');
    } finally {
      setSending(false);
    }
  };

  // Preview how many users will receive the notification
  const getPreviewCount = () => {
    if (!place.location) return 0;
    const criteria: NotificationCriteria = {
      radius: notificationForm.radius,
      location: place.location,
      gender: notificationForm.gender,
    };
    return subscriptionService.getTargetedUsers(criteria, place).length;
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2 space-x-reverse">
        <Send className="icon-md text-emerald-600" />
        <span>إرسال إشعارات موجهة</span>
      </h3>

      <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-blue-200">
        <h4 className="text-lg font-bold text-slate-800 mb-2">كيف تعمل الإشعارات الموجهة؟</h4>
        <p className="text-slate-700 text-sm leading-relaxed">
          يمكنك إرسال إشعارات للأشخاص القريبين من مكانك بناءً على المسافة والجنس. 
          سيتم إرسال الإشعار فقط للمستخدمين الذين يقعون ضمن النطاق المحدد.
        </p>
      </div>

      <form onSubmit={handleSendNotification} className="space-y-6">
        <div>
          <label className="block text-slate-700 font-semibold mb-2">عنوان الإشعار *</label>
          <input
            type="text"
            required
            value={notificationForm.title}
            onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
            placeholder="مثال: عرض خاص اليوم!"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-2">نص الإشعار *</label>
          <textarea
            required
            value={notificationForm.message}
            onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all resize-none"
            placeholder="اكتب محتوى الإشعار هنا..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-2">المسافة (بالكيلومتر) *</label>
            <div className="space-y-3">
              {[1, 5, 10, 15, 20].map((km) => (
                <label key={km} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    value={km}
                    checked={notificationForm.radius === km}
                    onChange={() => setNotificationForm({ ...notificationForm, radius: km })}
                    className="icon-sm text-emerald-600 focus:ring-emerald-600"
                  />
                  <span className="text-slate-700 font-medium">
                    {km} كم {km === 1 ? '(أقل من كيلومتر)' : km === 5 ? '(قريب جداً)' : km === 10 ? '(قريب)' : km === 15 ? '(متوسط)' : '(بعيد)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">الجنس</label>
            <div className="space-y-3">
              {[
                { value: 'all', label: 'الجميع' },
                { value: 'male', label: 'ذكور فقط' },
                { value: 'female', label: 'إناث فقط' },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={notificationForm.gender === option.value}
                    onChange={(e) => setNotificationForm({ ...notificationForm, gender: e.target.value as any })}
                    className="icon-sm text-emerald-600 focus:ring-emerald-600"
                  />
                  <span className="text-slate-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <Users className="icon-md text-emerald-600" />
            <span className="font-semibold text-slate-800">معاينة</span>
          </div>
          <p className="text-sm text-slate-700">
            سيتم إرسال الإشعار إلى <span className="font-bold text-slate-800">{getPreviewCount()}</span> مستخدم
            {notificationForm.radius > 0 && (
              <span> على بعد {notificationForm.radius} كم أو أقل من مكانك</span>
            )}
            {notificationForm.gender !== 'all' && (
              <span> ({notificationForm.gender === 'male' ? 'ذكور' : 'إناث'})</span>
            )}
          </p>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.sent > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`font-semibold ${
              result.sent > 0 ? 'text-emerald-800' : 'text-amber-800'
            }`}>
              {result.sent > 0 
                ? `✓ تم إرسال الإشعار بنجاح إلى ${result.sent} مستخدم`
                : 'لا يوجد مستخدمين يطابقون المعايير المحددة'
              }
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={sending || getPreviewCount() === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all shadow-md flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>جاري الإرسال...</span>
            </>
          ) : (
            <>
              <Send className="icon-md icon-primary" />
              <span>إرسال الإشعار</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
