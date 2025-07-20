import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user, activeProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentUserId = () => {
    return activeProfile ? activeProfile.id : user?.id;
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, activeProfile]);

  const loadNotifications = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const notifications = data.map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.is_read,
          createdAt: n.created_at
        }));
        setNotifications(notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: currentUserId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: notification.isRead
        })
        .select()
        .single();
      
      if (!error && data) {
        const newNotification: Notification = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: data.is_read,
          createdAt: data.created_at
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (!error) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    setLoading(false);
  };

  const markAllAsRead = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false);
      
      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
    
    setLoading(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount
  };
};