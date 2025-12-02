'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Star, MessageSquare, HelpCircle, Heart, Gift, Award, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { Notification } from '@/types';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import Link from 'next/link';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const loadNotifications = () => {
      const userNotifications = dataStore.getNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(dataStore.getUnreadNotificationCount(user.id));
    };

    loadNotifications();
    // Refresh every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleMarkAsRead = (notificationId: string) => {
    dataStore.markNotificationAsRead(notificationId);
    const user = getCurrentUser();
    if (user) {
      const updated = dataStore.getNotifications(user.id);
      setNotifications(updated);
      setUnreadCount(dataStore.getUnreadNotificationCount(user.id));
    }
  };

  const handleMarkAllAsRead = () => {
    const user = getCurrentUser();
    if (user) {
      dataStore.markAllNotificationsAsRead(user.id);
      const updated = dataStore.getNotifications(user.id);
      setNotifications(updated);
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'review':
      case 'new_review_on_liked_place':
        return <Star className={`${iconClass} text-yellow-500 fill-current`} />;
      case 'response':
        return <MessageSquare className={`${iconClass} text-slate-500`} />;
      case 'question':
      case 'new_question_on_owned_place':
        return <HelpCircle className={`${iconClass} text-slate-500`} />;
      case 'answer':
        return <CheckCircle className={`${iconClass} text-emerald-500`} />;
      case 'like':
        return <Heart className={`${iconClass} text-red-500 fill-current`} />;
      case 'announcement':
        return <Bell className={`${iconClass} text-orange-500`} />;
      case 'loyalty':
        return <Gift className={`${iconClass} text-emerald-500`} />;
      case 'badge':
        return <Award className={`${iconClass} text-amber-500`} />;
      case 'report':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      default:
        return <Bell className={`${iconClass} text-slate-500`} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'review':
      case 'new_review_on_liked_place':
        return 'bg-yellow-50 border-yellow-200';
      case 'response':
        return 'bg-blue-50 border-blue-200';
      case 'question':
      case 'new_question_on_owned_place':
        return 'bg-purple-50 border-purple-200';
      case 'answer':
        return 'bg-green-50 border-green-200';
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'announcement':
        return 'bg-orange-50 border-orange-200';
      case 'loyalty':
        return 'bg-emerald-50 border-emerald-200';
      case 'badge':
        return 'bg-amber-50 border-amber-200';
      case 'report':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} دقيقة`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ساعة`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} يوم`;
    } else {
      return notificationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const user = getCurrentUser();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">الإشعارات</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all text-sm font-semibold"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              غير المقروء ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.actionUrl || (notification.placeId ? `/places/${notification.placeId}` : '#')}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id);
                  }
                }}
                className={`block bg-white rounded-xl border-2 p-4 hover:shadow-lg transition-all ${
                  !notification.read ? `${getNotificationColor(notification.type)} shadow-md` : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`text-sm font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                      {notification.placeId && (
                        <span className="text-xs text-emerald-600 font-semibold">عرض التفاصيل →</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
              </h3>
              <p className="text-slate-600 text-sm">
                {filter === 'unread' 
                  ? 'جميع إشعاراتك مقروءة. سنخبرك عند وصول إشعارات جديدة!'
                  : 'ستظهر إشعاراتك هنا عند وجود نشاط جديد'}
              </p>
            </div>
          )}
        </div>
      </main>

      <TabNavigation />
    </div>
  );
}

