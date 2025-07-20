import React, { useState } from 'react';
import { Send, Bot, User, AlertTriangle, Phone, MapPin, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

interface SymptomAssessment {
  symptoms: string[];
  severity: 'mild' | 'emergency'; // Simplified severity levels
  recommendations: string[];
  shouldSeeDoctor: boolean;
  emergencyWarning?: string;
}

const SYMPTOM_DATABASE = {
  'ateş': { severity: 'emergency', keywords: ['ateş', 'yüksek ateş', 'humma'] },
  'baş ağrısı': { severity: 'mild', keywords: ['baş ağrısı', 'migren', 'başım ağrıyor'] },
  'nefes darlığı': { severity: 'emergency', keywords: ['nefes darlığı', 'nefes alamıyorum', 'soluk sıkıntısı'] },
  'göğüs ağrısı': { severity: 'emergency', keywords: ['göğüs ağrısı', 'kalp ağrısı', 'göğsümde ağrı'] },
  'mide bulantısı': { severity: 'mild', keywords: ['bulantı', 'mide bulantısı', 'kusma'] },
  'baş dönmesi': { severity: 'mild', keywords: ['baş dönmesi', 'sersemlik', 'dengesizlik'] },
  'karın ağrısı': { severity: 'moderate', keywords: ['karın ağrısı', 'mide ağrısı', 'karnım ağrıyor'] },
  'ishal': { severity: 'mild', keywords: ['ishal', 'diyare', 'sulu dışkı'] },
  'öksürük': { severity: 'mild', keywords: ['öksürük', 'kuru öksürük', 'balgamlı öksürük'] },
  'boğaz ağrısı': { severity: 'mild', keywords: ['boğaz ağrısı', 'boğazım ağrıyor', 'yutkunamıyorum'] }
};

const EMERGENCY_SYMPTOMS = [
  'göğüs ağrısı', 'nefes darlığı', 'bilinç kaybı', 'felç', 'konuşma bozukluğu', 
  'şiddetli baş ağrısı', 'yüksek ateş', 'şiddetli karın ağrısı', 'kan kusma', 'kanlı dışkı'
];

const VirtualDoctor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Merhaba! Ben DozAsistan Sanal Sağlık Koçunuz. Size nasıl yardımcı olabilirim? Lütfen şikayetlerinizi detaylı bir şekilde anlatın.',
      timestamp: new Date(),
      suggestions: [
        'Ateşim var ve kendimi kötü hissediyorum',
        'Başım ağrıyor ve bulantım var',
        'İlaç yan etkisi yaşıyor olabilirim',
        'Genel sağlık kontrolü istiyorum'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<SymptomAssessment | null>(null);

  const analyzeSymptoms = (message: string): SymptomAssessment => {
    const lowerMessage = message.toLowerCase();
    const detectedSymptoms: string[] = [];
    let maxSeverity: 'mild' | 'emergency' = 'mild';

    // Detect symptoms
    Object.entries(SYMPTOM_DATABASE).forEach(([symptom, data]) => {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedSymptoms.push(symptom);
        if (data.severity === 'emergency') maxSeverity = 'emergency';
      }
    });

    // Check for emergency keywords
    const hasEmergencySymptoms = EMERGENCY_SYMPTOMS.some(symptom => 
      lowerMessage.includes(symptom)
    );

    if (hasEmergencySymptoms) {
      maxSeverity = 'emergency';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    let shouldSeeDoctor = false;
    let emergencyWarning: string | undefined;

    switch (maxSeverity) {
      case 'emergency':
        emergencyWarning = 'ACİL DURUM: Derhal 112\'yi arayın veya en yakın acil servise gidin!';
        recommendations.push('Hemen tıbbi yardım alın');
        recommendations.push('112 Acil Servis: 112');
        shouldSeeDoctor = true;
        break;
      
      case 'mild':
        recommendations.push('Doktor randertvusu alın');
        recommendations.push('Bol sıvı tüketin');
        recommendations.push('Dinlenin ve kendinizi yormayın');
        shouldSeeDoctor = false;
        recommendations.push('Semptomlar devam ederse doktora başvurun');
        break;
    }

    // Add specific recommendations based on symptoms
    if (detectedSymptoms.includes('ateş')) {
      recommendations.push('Ateş düşürücü kullanabilirsiniz (doktor önerisi ile)');
      recommendations.push('Soğuk kompres uygulayın');
    }

    if (detectedSymptoms.includes('baş ağrısı')) {
      recommendations.push('Karanlık ve sessiz bir ortamda dinlenin');
      recommendations.push('Ağrı kesici kullanabilirsiniz (doktor önerisi ile)');
    }

    if (detectedSymptoms.includes('mide bulantısı')) {
      recommendations.push('Az ve sık yemek yiyin');
      recommendations.push('Zencefil çayı içebilirsiniz');
    }

    return {
      symptoms: detectedSymptoms,
      severity: maxSeverity,
      recommendations,
      shouldSeeDoctor,
      emergencyWarning
    };
  };

  const generateBotResponse = (userMessage: string): string => {
    const assessment = analyzeSymptoms(userMessage);
    setCurrentAssessment(assessment);

    if (assessment.emergencyWarning) {
      return assessment.emergencyWarning;
    }

    if (assessment.symptoms.length === 0) {
      return 'Belirttiğiniz semptomları tam olarak anlayamadım. Lütfen daha detaylı açıklayabilir misiniz? Hangi bölgenizde ağrı var, ne kadar süredir devam ediyor?';
    }

    let response = `Belirttiğiniz semptomları analiz ettim:\n\n`;
    response += `🔍 Tespit edilen semptomlar: ${assessment.symptoms.join(', ')}\n`;
    response += `📊 Durum: ${assessment.severity === 'mild' ? 'Hafif' : 'Acil'}\n\n`;
    
    response += `💡 Önerilerim:\n`;
    assessment.recommendations.forEach((rec, index) => {
      response += `${index + 1}. ${rec}\n`;
    });

    if (assessment.shouldSeeDoctor) {
      response += `\n⚠️ Doktora başvurmanızı öneriyorum.`;
    }

    return response;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: botResponse,
        timestamp: new Date(),
        suggestions: currentAssessment?.severity === 'emergency' ? [] : [
          'Başka semptomlarım da var',
          'Bu önerileri uygulayacağım',
          'Doktor randevusu nasıl alabilirim?',
          'Acil durumda ne yapmalıyım?'
        ]
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">🩺 Sanal Sağlık Koçu</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Sağlık sorularınız için 7/24 destek. Acil durumlar için 112'yi arayın.
          </p>
        </div>

        {/* Emergency Info */}
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6 transition-colors">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 transition-colors">Acil Durum Hatırlatması</h3>
              <p className="text-red-800 dark:text-red-200 text-sm transition-colors">
                Hayati tehlike durumunda hemen 112'yi arayın. Bu sistem tıbbi tavsiye yerine geçmez.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                  <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Semptomlarınızı detaylı olarak açıklayın..."
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-colors"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-600 text-white rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Acil Servis</h3>
                <p className="text-red-100">112</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Nöbetçi Eczane</h3>
                <p className="text-blue-100">Yakınımdakiler</p>
              </div>
            </div>
          </div>

          <div className="bg-green-600 text-white rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Sağlık Hattı</h3>
                <p className="text-green-100">184</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 transition-colors">Önemli Uyarı</h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed transition-colors">
                Bu sanal sağlık koçu genel bilgilendirme amaçlıdır ve profesyonel tıbbi tavsiye, 
                teşhis veya tedavi yerine geçmez. Ciddi sağlık sorunları için mutlaka doktorunuza 
                danışın. Acil durumlarda 112'yi arayın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualDoctor;