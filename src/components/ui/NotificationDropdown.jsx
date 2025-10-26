import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';

const NotificationDropdown = ({ notifications, showNotifications, setShowNotifications }) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 text-gray-600 hover:text-gray-900 relative"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 mr-3 ${
                    notification.type === 'error' ? 'text-red-500' :
                    notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <p className="text-sm text-gray-700">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;