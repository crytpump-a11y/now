import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMedicines } from '../hooks/useMedicines';
import { ReportService } from '../services/reportService';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Reports: React.FC = () => {
  const { user, activeProfile, familyProfiles } = useAuth();
  const { medicines, medicineTaken } = useMedicines();

  // Demo data ekleme fonksiyonu
  const addDemoData = () => {
    const currentUserId = activeProfile ? activeProfile.id : user?.id;
    if (!currentUserId) return;

    // Add demo data using Supabase
    const addDemoDataToSupabase = async () => {
      try {
        // First, add demo medicines
        const { data: medicineData, error: medicineError } = await supabase
          .from('medicines')
          .insert([
            {
              user_id: currentUserId,
              name: 'Aspirin 100mg',
              dosage: '1 tablet',
              frequency: 'daily',
              times: ['09:00', '21:00'],
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              notes: 'Demo ilaç',
              color: '#3B82F6',
              is_active: true
            },
            {
              user_id: currentUserId,
              name: 'D Vitamini',
              dosage: '1000 IU',
              frequency: 'daily',
              times: ['12:00'],
              start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              notes: 'Demo vitamin',
              color: '#10B981',
              is_active: true
            }
          ])
          .select();

        if (medicineError) {
          toast.error('Demo ilaçlar eklenirken hata oluştu');
          return;
        }

        // Then add demo medicine taken records
        const demoTaken = [];
        const now = new Date();
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          
          // Aspirin kayıtları
          if (medicineData && medicineData[0]) {
            demoTaken.push({
              medicine_id: medicineData[0].id,
              user_id: currentUserId,
              taken_at: date.toISOString(),
              scheduled_time: '09:00',
              status: Math.random() > 0.2 ? 'taken' : 'missed'
            });
            
            demoTaken.push({
              medicine_id: medicineData[0].id,
              user_id: currentUserId,
              taken_at: date.toISOString(),
              scheduled_time: '21:00',
              status: Math.random() > 0.15 ? 'taken' : 'missed'
            });
          }

          // D Vitamini kayıtları (son 20 gün)
          if (i < 20 && medicineData && medicineData[1]) {
            demoTaken.push({
              medicine_id: medicineData[1].id,
              user_id: currentUserId,
              taken_at: date.toISOString(),
              scheduled_time: '12:00',
              status: Math.random() > 0.1 ? 'taken' : 'missed'
            });
          }
        }

        const { error: takenError } = await supabase
          .from('medicine_taken')
          .insert(demoTaken);

        if (takenError) {
          toast.error('Demo kullanım kayıtları eklenirken hata oluştu');
          return;
        }

        toast.success('Demo veriler başarıyla eklendi!');
        // Sayfayı yenile
        window.location.reload();
      } catch (error) {
        console.error('Error adding demo data:', error);
        toast.error('Demo veriler eklenirken hata oluştu');
      }
    };

    addDemoDataToSupabase();
  };

  const generateReport = async () => {
    try {
      const profileName = activeProfile ? activeProfile.name : user?.username || 'Kullanıcı';
      await ReportService.generateMedicineReport(medicines, medicineTaken, profileName);
      toast.success('Rapor başarıyla oluşturuldu ve indirildi!');
    } catch (error) {
      toast.error('Rapor oluşturulurken hata oluştu');
      console.error('Report generation error:', error);
    }
  };

  const getReportStats = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTaken = (medicineTaken || []).filter(t => {
      const takenDate = new Date(t.takenAt);
      return takenDate >= thirtyDaysAgo && takenDate <= new Date();
    });
    
    const totalTaken = recentTaken.filter(t => t.status === 'taken').length;
    const totalMissed = recentTaken.filter(t => t.status === 'missed').length;
    const totalScheduled = totalTaken + totalMissed;
    const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    return {
      activeMedicines: (medicines || []).filter(m => m.isActive).length,
      totalScheduled,
      totalTaken,
      totalMissed,
      adherenceRate
    };
  };

  const stats = getReportStats();
  const hasData = medicines.length > 0 || medicineTaken.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Raporlar</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">İlaç kullanım geçmişinizi PDF olarak indirin</p>
        </div>

        {/* Current Profile Info */}
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8 transition-colors">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 transition-colors">Rapor Profili</h3>
              <p className="text-blue-800 dark:text-blue-200 transition-colors">
                {activeProfile ? `${activeProfile.name} (${activeProfile.relationship})` : `${user?.username} (Ana Profil)`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Aktif İlaçlar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.activeMedicines}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Uyum Oranı</p>
                <p className="text-2xl font-bold text-green-600">%{stats.adherenceRate}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Son 30 gün: {stats.totalTaken}/{stats.totalScheduled}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Alınan (30 gün)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTaken}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Kaçırılan (30 gün)</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalMissed}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">PDF Rapor Oluştur</h2>
          </div>
          
          <div className="p-6">
            {!hasData ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">Veri bulunamadı</h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">
                  Rapor oluşturmak için ilaç ve kullanım verisi gerekiyor
                </p>
                <div className="mt-6 space-y-4">
                  <button
                    onClick={addDemoData}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Demo Veri Ekle
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Test için örnek ilaç ve kullanım verileri ekler
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Rapor İçeriği</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    <li>• Aktif ilaçların listesi ve detayları</li>
                    <li>• Son 30 günün kullanım geçmişi</li>
                    <li>• İlaç uyum istatistikleri</li>
                    <li>• Kaçırılan ve alınan dozların özeti</li>
                    <li>• Profil bilgileri ve rapor tarihi</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Mevcut Veriler</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Aktif İlaçlar:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{stats.activeMedicines}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Kullanım Kayıtları:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{medicineTaken.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Son 30 Gün Uyum:</span>
                      <span className="ml-2 font-medium text-green-600">%{stats.adherenceRate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Toplam Alınan:</span>
                      <span className="ml-2 font-medium text-blue-600">{stats.totalTaken}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 transition-colors">
                      {activeProfile ? activeProfile.name : user?.username} - İlaç Kullanım Raporu
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 transition-colors">
                      {new Date().toLocaleDateString('tr-TR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} tarihli rapor
                    </p>
                  </div>
                  
                  <button
                    onClick={generateReport}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>PDF İndir</span>
                  </button>
                </div>

                {hasData && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={addDemoData}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      Demo Veri Ekle (Test İçin)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All Profiles Report */}
        {familyProfiles.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Tüm Profiller</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors">
                Diğer aile profilleri için rapor oluşturmak istiyorsanız, önce o profile geçiş yapın.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {familyProfiles.map((profile) => (
                  <div key={profile.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white transition-colors">{profile.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{profile.relationship}</p>
                      </div>
                    </div>
                    
                    {activeProfile?.id === profile.id ? (
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium transition-colors">Aktif Profil</span>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                        Rapor için bu profile geçiş yapın
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 transition-colors">Rapor Hakkında</h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed transition-colors">
                PDF raporlar, ilaç kullanım geçmişinizi doktor ziyaretlerinizde paylaşmak veya 
                kişisel kayıt tutmak için kullanabilirsiniz. Raporlar güvenli bir şekilde 
                cihazınıza indirilir ve hiçbir yerde saklanmaz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;