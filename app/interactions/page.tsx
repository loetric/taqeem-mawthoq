'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { Notification } from '@/types';
import { Bell, Star, FileText, HelpCircle, CheckCircle, Award, AlertCircle, X, Activity } from 'lucide-react';
import Link from 'next/link';

export default function InteractionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Load personal notifications only (exclude place-related notifications)
    const personalNotifications = dataStore.getPersonalNotifications(currentUser.id);
    setNotifications(personalNotifications);
    setUnreadCount(dataStore.getUnreadPersonalNotificationCount(currentUser.id));

    // Refresh notifications every 5 seconds
    const interval = setInterval(() => {
      const updated = dataStore.getPersonalNotifications(currentUser.id);
      setNotifications(updated);
      setUnreadCount(dataStore.getUnreadPersonalNotificationCount(currentUser.id));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [router]);

  const handleMarkAsRead = (notificationId: string) => {
    dataStore.markNotificationAsRead(notificationId);
    const user = getCurrentUser();
    if (user) {
      const updated = dataStore.getPersonalNotifications(user.id);
      setNotifications(updated);
      setUnreadCount(dataStore.getUnreadPersonalNotificationCount(user.id));
    }
  };

  const handleMarkAllAsRead = () => {
    const user = getCurrentUser();
    if (user) {
      // Mark only personal notifications as read
      const personalNotifications = dataStore.getPersonalNotifications(user.id);
      personalNotifications.forEach(n => {
        if (!n.read) {
          dataStore.markNotificationAsRead(n.id);
        }
      });
      const updated = dataStore.getPersonalNotifications(user.id);
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
        return <FileText className={`${iconClass} text-slate-500`} />;
      case 'question':
      case 'new_question_on_owned_place':
        return <HelpCircle className={`${iconClass} text-slate-500`} />;
      case 'answer':
        return <CheckCircle className={`${iconClass} text-emerald-500`} />;
      case 'like':
        return <Bell className={`${iconClass} text-red-500 fill-current`} />;
      case 'announcement':
        return <Bell className={`${iconClass} text-orange-500`} />;
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">التفاعلات</h1>
              <p className="text-sm text-slate-600 mt-1">تفاعلاتك وأنشطتك</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
            {unreadCount > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-semibold"
                >
                  تعليم الكل كمقروء
                </button>
              </div>
            )}

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
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
                  <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد تفاعلات</h3>
                  <p className="text-slate-600 text-sm">ستظهر تفاعلاتك هنا عند وجود نشاط جديد</p>
                </div>
              )}
            </div>
        </div>
      </main>

      <TabNavigation />
    </div>
  );
}
