'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, MessageSquare, Star, HelpCircle, Heart } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { Notification } from '@/types';
import Link from 'next/link';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const userNotifications = dataStore.getNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(dataStore.getUnreadNotificationCount(user.id));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    switch (type) {
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'response':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-purple-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const user = getCurrentUser();
  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-trust transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 left-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-trust hover:text-trust-dark font-semibold"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.placeId ? `/places/${notification.placeId}` : '#'}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`flex items-start space-x-3 space-x-reverse p-4 hover:bg-gray-50 transition ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-trust rounded-full mt-2" />
                  )}
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

