import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMedicines } from '../hooks/useMedicines';
import { useMoodTracking } from '../hooks/useMoodTracking';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Heart, Activity, Calendar } from 'lucide-react';

interface HealthSuggestion {
  id: string;
  type: 'medication' | 'lifestyle' | 'mood' | 'reminder' | 'warning';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
}

const HealthAssistant: React.FC = () => {
  const { user, activeProfile } = useAuth();
  const { medicines, medicineTaken, getTodaysMedicines } = useMedicines();
  const { moodEntries, getMoodStats } = useMoodTracking();
  const [suggestions, setSuggestions] = useState<HealthSuggestion[]>([]);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    generateSuggestions();
    calculateHealthScore();
  }, [medicines, medicineTaken, moodEntries]);

  const generateSuggestions = () => {
    const newSuggestions: HealthSuggestion[] = [];
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Medication adherence analysis
    const recentTaken = medicineTaken.filter(t => new Date(t.takenAt) >= threeDaysAgo);
    const missedCount = recentTaken.filter(t => t.status === 'missed').length;
    const totalCount = recentTaken.length;
    const adherenceRate = totalCount > 0 ? (recentTaken.filter(t => t.status === 'taken').length / totalCount) * 100 : 100;

    if (adherenceRate < 80) {
      newSuggestions.push({
        id: 'low-adherence',
        type: 'medication',
        title: 'İlaç Uyum Oranınız Düşük',
        message: `Son 3 gündür ilaç uyum oranınız %${Math.round(adherenceRate)}. Hatırlatıcılarınızı güncellemek ister misiniz?`,
        priority: 'high',
        actionable: true,
        action: 'Hatırlatıcıları Güncelle'
      });
    }

    if (missedCount >= 3) {
      newSuggestions.push({
        id: 'missed-doses',
        type: 'reminder',
        title: 'Kaçırılan Dozlar',
        message: `Son 3 gün içinde ${missedCount} doz kaçırdınız. Düzenli ilaç alımı için alarm kurmanızı öneririz.`,
        priority: 'medium',
        actionable: true,
        action: 'Alarm Kur'
      });
    }

    // Mood analysis
    const moodStats = getMoodStats(7);
    if (moodStats.totalEntries > 0) {
      const badMoodCount = moodStats.moodCounts['very-bad'] + moodStats.moodCounts['bad'];
      const totalMoodEntries = moodStats.totalEntries;
      
      if (badMoodCount / totalMoodEntries > 0.5) {
        newSuggestions.push({
          id: 'mood-concern',
          type: 'mood',
          title: 'Ruh Hali Takibi',
          message: 'Son hafta ruh haliniz düşük görünüyor. Doktorunuzla konuşmayı düşünebilirsiniz.',
          priority: 'medium',
          actionable: false
        });
      }

      if (moodStats.averageEnergy < 2.5) {
        newSuggestions.push({
          id: 'low-energy',
          type: 'lifestyle',
          title: 'Enerji Seviyesi Düşük',
          message: 'Enerji seviyeniz düşük. Düzenli uyku, egzersiz ve dengeli beslenme önemli.',
          priority: 'low',
          actionable: true,
          action: 'Yaşam Tarzı İpuçları'
        });
      }
    }

    // Medicine interaction warnings
    const activeMedicines = medicines.filter(m => m.isActive);
    if (activeMedicines.length >= 3) {
      newSuggestions.push({
        id: 'multiple-meds',
        type: 'warning',
        title: 'Çoklu İlaç Kullanımı',
        message: `${activeMedicines.length} farklı ilaç kullanıyorsunuz. İlaç etkileşimleri için doktorunuza danışın.`,
        priority: 'medium',
        actionable: false
      });
    }

    // Positive reinforcement
    if (adherenceRate >= 90) {
      newSuggestions.push({
        id: 'good-adherence',
        type: 'medication',
        title: 'Harika İş Çıkarıyorsunuz!',
        message: `İlaç uyum oranınız %${Math.round(adherenceRate)}. Bu başarınızı sürdürün!`,
        priority: 'low',
        actionable: false
      });
    }

    // Lifestyle suggestions
    const todaysMeds = getTodaysMedicines();
    const hasBloodPressureMed = todaysMeds.some(m => 
      m.name.toLowerCase().includes('enalapril') || 
      m.name.toLowerCase().includes('lisinopril') ||
      m.name.toLowerCase().includes('amlodipine')
    );

    if (hasBloodPressureMed) {
      newSuggestions.push({
        id: 'bp-lifestyle',
        type: 'lifestyle',
        title: 'Tansiyon İlaçları İçin Öneriler',
        message: 'Tuz tüketiminizi azaltın, düzenli egzersiz yapın ve stres yönetimine dikkat edin.',
        priority: 'low',
        actionable: true,
        action: 'Yaşam Tarzı Rehberi'
      });
    }

    const hasDiabetesMed = todaysMeds.some(m => 
      m.name.toLowerCase().includes('metformin') || 
      m.name.toLowerCase().includes('insulin') ||
      m.name.toLowerCase().includes('gliclazide')
    );

    if (hasDiabetesMed) {
      newSuggestions.push({
        id: 'diabetes-lifestyle',
        type: 'lifestyle',
        title: 'Diyabet Yönetimi',
        message: 'Kan şekerinizi düzenli ölçün, karbonhidrat alımınıza dikkat edin ve düzenli egzersiz yapın.',
        priority: 'medium',
        actionable: true,
        action: 'Diyabet Rehberi'
      });
    }

    setSuggestions(newSuggestions);
  };

  const calculateHealthScore = () => {
    let score = 100;
    
    // Medication adherence (40% weight)
    const recentTaken = medicineTaken.filter(t => {
      const takenDate = new Date(t.takenAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return takenDate >= sevenDaysAgo;
    });
    
    if (recentTaken.length > 0) {
      const adherenceRate = (recentTaken.filter(t => t.status === 'taken').length / recentTaken.length) * 100;
      score = score * 0.6 + adherenceRate * 0.4;
    }

    // Mood tracking (30% weight)
    const moodStats = getMoodStats(7);
    if (moodStats.totalEntries > 0) {
      const goodMoodCount = moodStats.moodCounts['good'] + moodStats.moodCounts['very-good'];
      const moodScore = (goodMoodCount / moodStats.totalEntries) * 100;
      score = score * 0.7 + moodScore * 0.3;
    }

    // Regular tracking (30% weight)
    const hasRecentMoodEntry = moodEntries.some(entry => {
      const entryDate = new Date(entry.date);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return entryDate >= threeDaysAgo;
    });

    if (hasRecentMoodEntry) {
      score = score * 0.9 + 10;
    } else {
      score = score * 0.9;
    }

    setHealthScore(Math.round(Math.max(0, Math.min(100, score))));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Activity className="h-5 w-5" />;
      case 'lifestyle': return <Heart className="h-5 w-5" />;
      case 'mood': return <Brain className="h-5 w-5" />;
      case 'reminder': return <Calendar className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Mükemmel! Sağlık yönetiminiz çok iyi.';
    if (score >= 80) return 'İyi! Küçük iyileştirmelerle daha da iyi olabilir.';
    if (score >= 60) return 'Orta. Bazı alanlarda gelişim gerekiyor.';
    return 'Dikkat! Sağlık yönetiminizi gözden geçirin.';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">🤖 Kişisel Sağlık Asistanı</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Verilerinize dayalı akıllı öneriler ve sağlık skorunuz
          </p>
        </div>

        {/* Health Score */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Sağlık Skorunuz</h2>
              <p className="text-blue-100">{getScoreMessage(healthScore)}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{healthScore}</div>
              <div className="text-blue-100">/ 100</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {suggestions.length === 0 ? (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">Henüz öneri yok</h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
                Daha fazla veri toplandıkça kişiselleştirilmiş öneriler göreceksiniz
              </p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`rounded-xl border-2 p-6 transition-colors ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getTypeIcon(suggestion.type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                      {suggestion.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 transition-colors">
                      {suggestion.message}
                    </p>
                    
                    {suggestion.actionable && suggestion.action && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        {suggestion.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Health Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">İlaç Uyumu</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 transition-colors">Son 7 gün</span>
                <span className="font-medium text-gray-900 dark:text-white transition-colors">
                  {medicineTaken.filter(t => {
                    const takenDate = new Date(t.takenAt);
                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return takenDate >= sevenDaysAgo && t.status === 'taken';
                  }).length} / {medicineTaken.filter(t => {
                    const takenDate = new Date(t.takenAt);
                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return takenDate >= sevenDaysAgo;
                  }).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">Ruh Hali</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 transition-colors">Ortalama enerji</span>
                <span className="font-medium text-gray-900 dark:text-white transition-colors">
                  {getMoodStats(7).averageEnergy.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">Takip</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 transition-colors">Aktif ilaçlar</span>
                <span className="font-medium text-gray-900 dark:text-white transition-colors">
                  {medicines.filter(m => m.isActive).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <Brain className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 transition-colors">Kişisel Sağlık Asistanı Hakkında</h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed transition-colors">
                Bu öneriler, ilaç kullanım geçmişiniz ve ruh hali verilerinize dayalı olarak oluşturulur. 
                Öneriler genel bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez. Sağlık durumunuzla 
                ilgili kararlar için mutlaka doktorunuza danışın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAssistant;