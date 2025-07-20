import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Achievement, UserStats, MedicineTaken } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './useNotifications';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-dose',
    name: 'İlk Adım',
    description: 'İlk ilacınızı aldınız!',
    icon: '🎯',
    type: 'milestone',
    requirement: 1,
    points: 10
  },
  {
    id: 'streak-3',
    name: '3 Günlük Seri',
    description: '3 gün üst üste ilaçlarınızı aldınız',
    icon: '🔥',
    type: 'streak',
    requirement: 3,
    points: 25
  },
  {
    id: 'streak-7',
    name: 'Haftalık Kahraman',
    description: '7 gün üst üste ilaçlarınızı aldınız',
    icon: '⭐',
    type: 'streak',
    requirement: 7,
    points: 50
  },
  {
    id: 'streak-30',
    name: 'Aylık Şampiyon',
    description: '30 gün üst üste ilaçlarınızı aldınız',
    icon: '👑',
    type: 'streak',
    requirement: 30,
    points: 200
  },
  {
    id: 'total-50',
    name: 'Yarım Yüz',
    description: 'Toplam 50 doz ilaç aldınız',
    icon: '💊',
    type: 'total',
    requirement: 50,
    points: 75
  },
  {
    id: 'total-100',
    name: 'Yüzlük Kulüp',
    description: 'Toplam 100 doz ilaç aldınız',
    icon: '💯',
    type: 'total',
    requirement: 100,
    points: 150
  },
  {
    id: 'consistency-90',
    name: 'Tutarlılık Ustası',
    description: '%90 uyum oranına ulaştınız',
    icon: '🎖️',
    type: 'consistency',
    requirement: 90,
    points: 100
  }
];

export const useGameification = () => {
  const { user, activeProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentUserId = () => {
    return activeProfile ? activeProfile.id : user?.id;
  };

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user, activeProfile]);

  const loadUserStats = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', currentUserId)
        .single();
      
      if (!error && data) {
        const stats: UserStats = {
          userId: data.user_id,
          totalPoints: data.total_points,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          totalMedicinesTaken: data.total_medicines_taken,
          adherenceRate: data.adherence_rate,
          level: data.level,
          achievements: data.achievements,
          lastUpdated: data.last_updated
        };
        setUserStats(stats);
      } else {
        // Create initial stats
        await createInitialStats(currentUserId);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const createInitialStats = async (userId: string) => {
    const initialStats = {
      user_id: userId,
      total_points: 0,
      current_streak: 0,
      longest_streak: 0,
      total_medicines_taken: 0,
      adherence_rate: 0,
      level: 1,
      achievements: [],
      last_updated: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .insert(initialStats)
        .select()
        .single();
      
      if (!error && data) {
        setUserStats({
          userId: data.user_id,
          totalPoints: data.total_points,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          totalMedicinesTaken: data.total_medicines_taken,
          adherenceRate: data.adherence_rate,
          level: data.level,
          achievements: data.achievements,
          lastUpdated: data.last_updated
        });
      }
    } catch (error) {
      console.error('Error creating initial stats:', error);
    }
  };

  const updateStats = async (medicineTaken: MedicineTaken[]) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !userStats) return;

    setLoading(true);

    // Calculate new stats
    const takenMedicines = medicineTaken.filter(m => m.status === 'taken');
    const totalTaken = takenMedicines.length;
    const totalScheduled = medicineTaken.length;
    const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    // Calculate streak
    const { currentStreak, longestStreak } = calculateStreak(medicineTaken);

    // Calculate level (every 100 points = 1 level)
    const level = Math.floor(userStats.totalPoints / 100) + 1;

    const newStats = {
      ...userStats,
      totalMedicinesTaken: totalTaken,
      adherenceRate,
      currentStreak,
      longestStreak: Math.max(longestStreak, userStats.longestStreak),
      level,
      lastUpdated: new Date().toISOString()
    };

    // Check for new achievements
    await checkAchievements(newStats);

    setUserStats(newStats);
    await saveUserStats(newStats);
    setLoading(false);
  };

  const calculateStreak = (medicineTaken: MedicineTaken[]) => {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Group by date
    const dateGroups: { [key: string]: MedicineTaken[] } = {};
    medicineTaken.forEach(m => {
      const date = m.takenAt.split('T')[0];
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(m);
    });

    // Check each day backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const dayMedicines = dateGroups[dateStr] || [];
      const takenCount = dayMedicines.filter(m => m.status === 'taken').length;
      const totalCount = dayMedicines.length;

      if (totalCount > 0 && takenCount === totalCount) {
        tempStreak++;
        if (i === 0 || currentStreak === tempStreak - 1) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak: Math.max(longestStreak, tempStreak) };
  };

  const checkAchievements = (stats: UserStats) => {
    const newAchievements: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (stats.achievements.includes(achievement.id)) return;

      let unlocked = false;

      switch (achievement.type) {
        case 'milestone':
        case 'total':
          unlocked = stats.totalMedicinesTaken >= achievement.requirement;
          break;
        case 'streak':
          unlocked = stats.currentStreak >= achievement.requirement;
          break;
        case 'consistency':
          unlocked = stats.adherenceRate >= achievement.requirement;
          break;
      }

      if (unlocked) {
        newAchievements.push(achievement);
        stats.achievements.push(achievement.id);
        stats.totalPoints += achievement.points;

        // Send notification
        addNotification({
          title: '🏆 Yeni Başarı Kazandınız!',
          message: `${achievement.icon} ${achievement.name}: ${achievement.description} (+${achievement.points} puan)`,
          type: 'success',
          isRead: false
        });
      }
    });

    return newAchievements;
  };

  const saveUserStats = async (stats: UserStats) => {
    try {
      await supabase
        .from('user_stats')
        .update({
          total_points: stats.totalPoints,
          current_streak: stats.currentStreak,
          longest_streak: stats.longestStreak,
          total_medicines_taken: stats.totalMedicinesTaken,
          adherence_rate: stats.adherenceRate,
          level: stats.level,
          achievements: stats.achievements,
          last_updated: stats.lastUpdated
        })
        .eq('user_id', stats.userId);
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  };

  const getAvailableAchievements = () => {
    return ACHIEVEMENTS.filter(a => !userStats?.achievements.includes(a.id));
  };

  const getUnlockedAchievements = () => {
    return ACHIEVEMENTS.filter(a => userStats?.achievements.includes(a.id));
  };

  return {
    userStats,
    loading,
    updateStats,
    getAvailableAchievements,
    getUnlockedAchievements,
    achievements: ACHIEVEMENTS
  };
};