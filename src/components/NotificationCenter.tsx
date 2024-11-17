import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead } from '../lib/notifications';
import { useAuth } from './AuthProvider';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile) {
      loadNotifications();
    }
  }, [userProfile]);

  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotifications(userProfile.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      await loadNotifications();
      if (notification.link) {
        window.location.href = notification.link;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-brand-navy hover:text-brand-maroon transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-maroon rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-brand-navy mb-4">Notifications</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No new notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-brand-navy">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}