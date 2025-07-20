import React, { useEffect } from 'react';
import { useMedicines } from '../hooks/useMedicines';
import { useNotifications } from '../hooks/useNotifications';
import { useGameification } from '../hooks/useGameification';
import AdvertisementDisplay from '../components/AdvertisementDisplay';
import { Pill, Clock, CheckCircle, AlertCircle, Plus, Calendar, MapPin, Camera, Users, FileText, Trophy, Heart, BookOpen, Brain, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const { getTodaysMedicines, getMedicineStatus, markMedicineTaken, medicineTaken } = useMedicines();
  const { addNotification } = useNotifications();
  const { updateStats } = useGameification();
  const todaysMedicines = getTodaysMedicines();

  // Update gamification stats when medicine taken data changes
  useEffect(() => {
    if (medicineTaken && medicineTaken.length > 0) {
      updateStats(medicineTaken);
    }
  }, [medicineTaken, updateStats]);

  useEffect(() => {
    // Add welcome notification for new users (using Supabase)
    const checkWelcomeNotification = async () => {
      if (!user) return;
      
      // Check if user has any notifications
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'DozAsistan\'a Hoş Geldiniz!')
        .limit(1);
      
      if (!data || data.length === 0) {
        // Add welcome notification
        addNotification({
          title: 'DozAsistan\'a Hoş Geldiniz!',
          message: 'Takibe başlamak için ilk ilacınızı ekleyerek başlayın.',
          type: 'info',
          isRead: false
        });
      }
    };
    
    if (user) {
      checkWelcomeNotification();
    }
  }, [user, addNotification]);

  // Remove the old localStorage-based welcome notification
  useEffect(() => {
    // Clean up old localStorage welcome flag
    localStorage.removeItem('medireminder_seen_welcome');
  }, []);

  // Old code removed:
  /*
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('medireminder_seen_welcome');
    if (!hasSeenWelcome) {
      addNotification({
        title: 'DozAsistan\'a Hoş Geldiniz!',
        message: 'Takibe başlamak için ilk ilacınızı ekleyerek başlayın.',
        type: 'info',
        isRead: false
      });
    }
  }, [addNotification]);
  */

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleMedicineAction = async (medicineId: string, time: string, action: 'taken' | 'missed') => {
    await markMedicineTaken(medicineId, time, action);
    const medicine = todaysMedicines.find(m => m.id === medicineId);
    
    if (action === 'taken') {
      toast.success(`${medicine?.name} alındı olarak işaretlendi`);
      addNotification({
        title: 'İlaç Alındı',
        message: `${medicine?.name} ilacını ${time} saatinde başarıyla aldınız`,
        type: 'success',
        isRead: false
      });
    } else {
      toast.warning(`${medicine?.name} kaçırıldı olarak işaretlendi`);
      addNotification({
        title: 'İlaç Kaçırıldı',
        message: `${medicine?.name} ilacını ${time} saatinde kaçırıldı olarak işaretlediniz`,
        type: 'warning',
        isRead: false
      });
    }
  };

  const getUpcomingMedicines = () => {
    const currentTime = getCurrentTime();
    const upcoming = [];
    
    for (const medicine of todaysMedicines) {
      for (const time of medicine.times) {
        const status = getMedicineStatus(medicine.id, time);
        if (status === 'pending' && time > currentTime) {
          upcoming.push({ ...medicine, scheduleTime: time });
        }
      }
    }
    
    return upcoming.sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime)).slice(0, 3);
  };

  const getTodaysSchedule = () => {
    const schedule = [];
    
    for (const medicine of todaysMedicines) {
      for (const time of medicine.times) {
        const status = getMedicineStatus(medicine.id, time);
        schedule.push({
          ...medicine,
          scheduleTime: time,
          status
        });
      }
    }
    
    return schedule.sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
  };

  const todaysSchedule = getTodaysSchedule();
  const upcomingMedicines = getUpcomingMedicines();
  const completedToday = todaysSchedule.filter(s => s.status === 'taken').length;
  const totalToday = todaysSchedule.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <AdvertisementDisplay position="header" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ana Sayfa</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bugün {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bugünkü İlerleme</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamamlanan</p>
                <p className="text-2xl font-bold text-green-600">{completedToday}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bugün Toplam</p>
                <p className="text-2xl font-bold text-blue-600">{totalToday}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif İlaçlar</p>
                <p className="text-2xl font-bold text-purple-600">{todaysMedicines.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Pill className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bugünkü Program</h2>
                  <Link 
                    to="/medicines"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    İlaçları Yönet
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {todaysSchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Programlanmış ilaç yok</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Takibe başlamak için ilk ilacınızı ekleyin</p>
                    <Link 
                      to="/medicines"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>İlaç Ekle</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysSchedule.map((item) => (
                      <div 
                        key={`${item.id}-${item.scheduleTime}`}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          item.status === 'taken' 
                            ? 'border-green-200 bg-green-50' 
                            : item.status === 'missed'
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.dosage}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">{item.scheduleTime}</p>
                              <p className={`text-sm ${
                                item.status === 'taken' ? 'text-green-600' :
                                item.status === 'missed' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {item.status === 'taken' ? 'Alındı' :
                                 item.status === 'missed' ? 'Kaçırıldı' :
                                 'Bekliyor'}
                              </p>
                            </div>
                            
                            {item.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleMedicineAction(item.id, item.scheduleTime, 'taken')}
                                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  title="Alındı olarak işaretle"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleMedicineAction(item.id, item.scheduleTime, 'missed')}
                                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  title="Kaçırıldı olarak işaretle"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Medicines */}
          <div>
            <AdvertisementDisplay position="sidebar" />
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Yaklaşan</h2>
              </div>
              
              <div className="p-6">
                {upcomingMedicines.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Yaklaşan ilaç yok</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMedicines.map((medicine) => (
                      <div 
                        key={`${medicine.id}-${medicine.scheduleTime}`}
                        className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: medicine.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{medicine.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{medicine.scheduleTime}</p>
                        </div>
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hızlı İşlemler</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <Link 
                  to="/medicines"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">İlaç Ekle</span>
                </Link>
                
                <Link 
                  to="/notifications"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Bildirimleri Görüntüle</span>
                </Link>
                
                <Link 
                  to="/pharmacies"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Nöbetçi Eczaneler</span>
                </Link>
                
                <Link 
                  to="/barcode"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Camera className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Barkod Okuyucu</span>
                </Link>
                
                <Link 
                  to="/family"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Aile Profilleri</span>
                </Link>
                
                <Link 
                  to="/reports"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <FileText className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Rapor İndir</span>
                </Link>
                
                <Link 
                  to="/gamification"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Başarılarım</span>
                </Link>
                
                <Link 
                  to="/mood"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Ruh Hali Takibi</span>
                </Link>
                
                <Link 
                  to="/education"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Eğitim ve Destek</span>
                </Link>
                
                <Link 
                  to="/health-assistant"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Sağlık Asistanı</span>
                </Link>
                
                <Link 
                  to="/virtual-doctor"
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Sanal Doktor</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;