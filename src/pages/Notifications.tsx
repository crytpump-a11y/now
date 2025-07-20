
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-toastify';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    toast.success('Bildirim okundu olarak işaretlendi');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Tüm bildirimler okundu olarak işaretlendi');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Bildirimler</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">Bildirim yok</h3>
            <p className="text-gray-500 dark:text-gray-400 transition-colors">Henüz bildiriminiz bulunmuyor. Yeni bildirimler için daha sonra kontrol edin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    : 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium transition-colors ${
                      notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 text-sm transition-colors ${
                      notification.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 transition-colors">
                      {new Date(notification.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
                      title="Okundu olarak işaretle"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}