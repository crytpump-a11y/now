import React, { useState } from 'react';
import { useMoodTracking } from '../hooks/useMoodTracking';
import { Heart, TrendingUp, Calendar, Plus, Smile, Frown, Meh } from 'lucide-react';
import { toast } from 'react-toastify';

const MOOD_OPTIONS = [
  { value: 'very-bad', label: 'Çok Kötü', emoji: '😢', color: 'text-red-600' },
  { value: 'bad', label: 'Kötü', emoji: '😞', color: 'text-orange-600' },
  { value: 'neutral', label: 'Normal', emoji: '😐', color: 'text-yellow-600' },
  { value: 'good', label: 'İyi', emoji: '😊', color: 'text-green-600' },
  { value: 'very-good', label: 'Çok İyi', emoji: '😄', color: 'text-blue-600' }
] as const;

const COMMON_SYMPTOMS = [
  'Baş ağrısı', 'Yorgunluk', 'Bulantı', 'Baş dönmesi', 'Uykusuzluk',
  'Kas ağrısı', 'Karın ağrısı', 'Öksürük', 'Ateş', 'Stres',
  'Anksiyete', 'Depresyon', 'İştahsızlık', 'Konsantrasyon sorunu'
];

const MoodTracking: React.FC = () => {
  const { moodEntries, addMoodEntry, getTodaysMood, getMoodStats, loading } = useMoodTracking();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState({
    mood: 'neutral' as const,
    energy: 3,
    symptoms: [] as string[],
    notes: ''
  });

  const todaysMood = getTodaysMood();
  const stats = getMoodStats(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addMoodEntry({
      date: selectedDate,
      ...formData
    });
    
    toast.success('Ruh hali kaydedildi');
    setShowForm(false);
    setFormData({
      mood: 'neutral',
      energy: 3,
      symptoms: [],
      notes: ''
    });
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const getMoodEmoji = (mood: string) => {
    const option = MOOD_OPTIONS.find(opt => opt.value === mood);
    return option ? option.emoji : '😐';
  };

  const getMoodColor = (mood: string) => {
    const option = MOOD_OPTIONS.find(opt => opt.value === mood);
    return option ? option.color : 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">💭 Ruh Hali Takibi</h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">Günlük ruh halinizi ve semptomlarınızı kaydedin</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ruh Hali Ekle</span>
          </button>
        </div>

        {/* Today's Mood */}
        {todaysMood && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getMoodEmoji(todaysMood.mood)}</div>
              <div>
                <h3 className="text-lg font-semibold">Bugünkü Ruh Haliniz</h3>
                <p className="text-blue-100">
                  {MOOD_OPTIONS.find(opt => opt.value === todaysMood.mood)?.label} - 
                  Enerji: {todaysMood.energy}/5
                </p>
                {todaysMood.symptoms.length > 0 && (
                  <p className="text-blue-100 text-sm mt-1">
                    Semptomlar: {todaysMood.symptoms.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Ortalama Enerji</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.averageEnergy}/5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Kayıt Sayısı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalEntries}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Son 30 gün</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">En Yaygın Ruh Hali</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {Object.entries(stats.moodCounts).reduce((a, b) => stats.moodCounts[a[0] as keyof typeof stats.moodCounts] > stats.moodCounts[b[0] as keyof typeof stats.moodCounts] ? a : b)[0] && 
                     getMoodEmoji(Object.entries(stats.moodCounts).reduce((a, b) => stats.moodCounts[a[0] as keyof typeof stats.moodCounts] > stats.moodCounts[b[0] as keyof typeof stats.moodCounts] ? a : b)[0])}
                  </span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Entries */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Son Kayıtlar</h2>
            </div>
            
            <div className="p-6">
              {stats.recentEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Smile className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 transition-colors">Henüz ruh hali kaydı yok</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors">İlk kaydınızı oluşturun!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white transition-colors">
                            {new Date(entry.date).toLocaleDateString('tr-TR')}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                            Enerji: {entry.energy}/5
                          </span>
                        </div>
                        {entry.symptoms.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                            {entry.symptoms.slice(0, 3).join(', ')}
                            {entry.symptoms.length > 3 && '...'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Common Symptoms */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Yaygın Semptomlar</h2>
            </div>
            
            <div className="p-6">
              {stats.commonSymptoms.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 transition-colors">Henüz semptom kaydı yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.commonSymptoms.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <span className="font-medium text-gray-900 dark:text-white transition-colors">{item.symptom}</span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm transition-colors">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mood Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 transition-colors">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Ruh Hali Kaydet</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors">
                    Ruh Haliniz
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {MOOD_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mood: option.value }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.mood === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors">
                    Enerji Seviyesi: {formData.energy}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.energy}
                    onChange={(e) => setFormData(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-colors"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    <span>Çok Düşük</span>
                    <span>Çok Yüksek</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors">
                    Semptomlar (İsteğe bağlı)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          formData.symptoms.includes(symptom)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    Notlar (İsteğe bağlı)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    rows={3}
                    placeholder="Bugün nasıl hissettiniz?"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracking;