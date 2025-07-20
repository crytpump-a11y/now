import React from 'react';
import { useGameification } from '../hooks/useGameification';
import { useMedicines } from '../hooks/useMedicines';
import { Trophy, Star, Target, Award, TrendingUp, Zap } from 'lucide-react';

const Gamification: React.FC = () => {
  const { userStats, getAvailableAchievements, getUnlockedAchievements } = useGameification();
  const { medicineTaken } = useMedicines();

  React.useEffect(() => {
    // Update stats when component mounts
    if (userStats && medicineTaken.length > 0) {
      // This would be called from the medicine taking action
    }
  }, [medicineTaken, userStats]);

  const unlockedAchievements = getUnlockedAchievements();
  const availableAchievements = getAvailableAchievements();

  const getProgressPercentage = (achievement: any) => {
    if (!userStats) return 0;
    
    let current = 0;
    switch (achievement.type) {
      case 'total':
      case 'milestone':
        current = userStats.totalMedicinesTaken;
        break;
      case 'streak':
        current = userStats.currentStreak;
        break;
      case 'consistency':
        current = userStats.adherenceRate;
        break;
    }
    
    return Math.min((current / achievement.requirement) * 100, 100);
  };

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">🏆 Başarılarım</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">İlaç kullanım başarılarınızı takip edin ve ödüller kazanın</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Seviye</p>
                <p className="text-3xl font-bold">{userStats.level}</p>
              </div>
              <Star className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-4">
              <div className="bg-blue-400 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${((userStats.totalPoints % 100) / 100) * 100}%` }}
                />
              </div>
              <p className="text-blue-100 text-xs mt-1">
                {userStats.totalPoints % 100}/100 puan
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Toplam Puan</p>
                <p className="text-3xl font-bold">{userStats.totalPoints}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Mevcut Seri</p>
                <p className="text-3xl font-bold">{userStats.currentStreak}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-200" />
            </div>
            <p className="text-orange-100 text-xs mt-2">
              En uzun: {userStats.longestStreak} gün
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Uyum Oranı</p>
                <p className="text-3xl font-bold">%{userStats.adherenceRate}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unlocked Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                🏅 Kazanılan Başarılar ({unlockedAchievements.length})
              </h2>
            </div>
            
            <div className="p-6">
              {unlockedAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 transition-colors">Henüz başarı kazanmadınız</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors">İlaçlarınızı almaya başlayın!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 transition-colors">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">{achievement.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{achievement.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          +{achievement.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                🎯 Hedefler ({availableAchievements.length})
              </h2>
            </div>
            
            <div className="p-6">
              {availableAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 transition-colors">Tüm başarıları tamamladınız!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors">Harika iş çıkardınız! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableAchievements.map((achievement) => {
                    const progress = getProgressPercentage(achievement);
                    return (
                      <div key={achievement.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="text-2xl opacity-50">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">{achievement.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs font-medium transition-colors">
                              +{achievement.points}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 transition-colors">İlerleme</span>
                            <span className="text-gray-900 dark:text-white font-medium transition-colors">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors">
                            <div 
                              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Motivation Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Motivasyon Köşesi</h3>
              <p className="text-indigo-100">
                {userStats.currentStreak > 0 
                  ? `Harika! ${userStats.currentStreak} gündür ilaçlarınızı düzenli alıyorsunuz. Devam edin!`
                  : 'İlaçlarınızı düzenli almaya başlayın ve ilk başarınızı kazanın!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;