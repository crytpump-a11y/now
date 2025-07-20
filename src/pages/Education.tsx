import React, { useState } from 'react';
import { BookOpen, Search, Play, FileText, Award, ChevronRight, Clock, Users, Star } from 'lucide-react';

interface EducationContent {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'quiz' | 'infographic';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  views: number;
  content?: string;
}

const EDUCATION_CONTENT: EducationContent[] = [
  {
    id: '1',
    title: 'İlaç Yan Etkileri Nasıl Tanınır?',
    description: 'İlaç kullanırken karşılaşabileceğiniz yan etkileri nasıl fark edebilir ve ne yapmanız gerektiğini öğrenin.',
    category: 'İlaç Güvenliği',
    type: 'article',
    duration: '5 dk',
    difficulty: 'beginner',
    rating: 4.8,
    views: 1250,
    content: `İlaç yan etkileri, ilaçların tedavi edici etkilerinin yanında ortaya çıkabilen istenmeyen etkilerdir. 

**Yaygın Yan Etkiler:**
• Mide bulantısı ve kusma
• Baş ağrısı
• Yorgunluk
• Cilt döküntüleri
• Uyku bozuklukları

**Ciddi Yan Etkiler:**
• Nefes darlığı
• Yüz, dudak, dil şişmesi
• Şiddetli cilt reaksiyonları
• Kalp çarpıntısı
• Bilinç kaybı

**Ne Yapmalısınız:**
1. Hafif yan etkiler için doktorunuza danışın
2. Ciddi yan etkiler durumunda hemen tıbbi yardım alın
3. Yan etkileri not alın ve doktorunuzla paylaşın
4. İlacı kendi başınıza bırakmayın`
  },
  {
    id: '2',
    title: 'Doğru İlaç Saklama Yöntemleri',
    description: 'İlaçlarınızın etkinliğini korumak için doğru saklama koşullarını öğrenin.',
    category: 'İlaç Saklama',
    type: 'video',
    duration: '8 dk',
    difficulty: 'beginner',
    rating: 4.6,
    views: 980,
    content: `İlaçların doğru saklanması, etkinliklerini korumak için çok önemlidir.

**Genel Kurallar:**
• Serin, kuru yerde saklayın
• Direkt güneş ışığından koruyun
• Çocukların ulaşamayacağı yerde tutun
• Orijinal ambalajında saklayın

**Buzdolabında Saklanması Gerekenler:**
• İnsülin
• Bazı antibiyotikler
• Göz damlaları (açıldıktan sonra)

**Saklanmaması Gereken Yerler:**
• Banyo (nem nedeniyle)
• Arabanın torpido gözü (sıcaklık)
• Mutfak tezgahı (ısı ve nem)`
  },
  {
    id: '3',
    title: 'İlaç Etkileşimleri Quiz',
    description: 'İlaç etkileşimleri hakkında bilginizi test edin ve öğrenin.',
    category: 'İlaç Etkileşimleri',
    type: 'quiz',
    duration: '10 dk',
    difficulty: 'intermediate',
    rating: 4.7,
    views: 750,
    content: 'İnteraktif quiz içeriği burada olacak...'
  },
  {
    id: '4',
    title: 'Sağlıklı Yaşam İpuçları',
    description: 'Günlük hayatınızda uygulayabileceğiniz basit sağlık önerileri.',
    category: 'Sağlıklı Yaşam',
    type: 'infographic',
    duration: '3 dk',
    difficulty: 'beginner',
    rating: 4.9,
    views: 1500,
    content: `**Günlük Sağlık Alışkanlıkları:**

🥤 **Su İçin:**
• Günde en az 8 bardak su için
• Sabah kalktığınızda 1 bardak su için
• Yemeklerden 30 dk önce su için

🚶 **Hareket Edin:**
• Günde en az 30 dakika yürüyüş yapın
• Merdivenleri tercih edin
• Her saatte 5 dakika ayağa kalkın

😴 **Kaliteli Uyku:**
• Düzenli uyku saatleri belirleyin
• Yatmadan 2 saat önce yemek yemeyin
• Yatak odanızı serin tutun

🥗 **Dengeli Beslenin:**
• Günde 5 porsiyon meyve-sebze tüketin
• Tam tahıllı ürünleri tercih edin
• İşlenmiş gıdaları sınırlayın`
  },
  {
    id: '5',
    title: 'Kronik Hastalık Yönetimi',
    description: 'Diyabet, hipertansiyon gibi kronik hastalıkları nasıl yönetebileceğinizi öğrenin.',
    category: 'Kronik Hastalıklar',
    type: 'article',
    duration: '12 dk',
    difficulty: 'advanced',
    rating: 4.5,
    views: 650,
    content: `Kronik hastalıklar, uzun süreli tedavi ve yaşam tarzı değişiklikleri gerektirir.

**Diyabet Yönetimi:**
• Düzenli kan şekeri ölçümü
• Karbonhidrat sayımı
• Düzenli egzersiz
• İlaç uyumu

**Hipertansiyon Kontrolü:**
• Tuz tüketimini azaltın
• Düzenli tansiyon ölçümü
• Stres yönetimi
• Kilo kontrolü

**Genel Öneriler:**
• Doktor kontrollerinizi aksatmayın
• İlaçlarınızı düzenli alın
• Yaşam tarzı değişikliklerini uygulayın
• Destek gruplarına katılın`
  }
];

const CATEGORIES = ['Tümü', 'İlaç Güvenliği', 'İlaç Saklama', 'İlaç Etkileşimleri', 'Sağlıklı Yaşam', 'Kronik Hastalıklar'];

const Education: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<EducationContent | null>(null);

  const filteredContent = EDUCATION_CONTENT.filter(content => {
    const matchesCategory = selectedCategory === 'Tümü' || content.category === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      case 'infographic': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-600';
      case 'quiz': return 'bg-purple-100 text-purple-600';
      case 'infographic': return 'bg-green-100 text-green-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedContent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedContent(null)}
            className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Geri Dön</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-3 rounded-lg ${getTypeColor(selectedContent.type)}`}>
                  {getTypeIcon(selectedContent.type)}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                    {selectedContent.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedContent.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedContent.views} görüntülenme</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedContent.rating}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none dark:prose-invert">
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedContent.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">📚 Eğitim ve Destek</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">İlaç kullanımı ve sağlık yönetimi hakkında bilgi edinin</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="İçerik ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content) => (
            <div
              key={content.id}
              onClick={() => setSelectedContent(content)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${getTypeColor(content.type)}`}>
                  {getTypeIcon(content.type)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(content.difficulty)}`}>
                    {content.difficulty === 'beginner' ? 'Başlangıç' : 
                     content.difficulty === 'intermediate' ? 'Orta' : 'İleri'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                {content.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 transition-colors">
                {content.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{content.duration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{content.rating}</span>
                  </span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  Oku →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">İçerik bulunamadı</h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors">Eğitim İçerikleri Hakkında</h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed transition-colors">
                Bu içerikler genel bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez. 
                Sağlık sorunlarınız için mutlaka doktorunuza danışın. İçerikler düzenli olarak 
                güncellenmekte ve uzman doktorlar tarafından gözden geçirilmektedir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;