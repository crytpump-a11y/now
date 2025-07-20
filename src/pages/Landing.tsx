import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdvertisementDisplay from '../components/AdvertisementDisplay';
import { Pill, Bell, Shield, Clock, CheckCircle } from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors">DozAsistan</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Giriş Yap
              </Link>
              <Link 
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        {/* Header Advertisements */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <AdvertisementDisplay position="header" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                <span className="text-blue-600">İlaçlarınızı</span> Bir Daha
                Asla Unutmayın
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                DozAsistan ile sağlığınızın kontrolünü elinize alın. 
                Günlük ilaçlarınızı takip edin, yönetin ve kişiselleştirilmiş bildirimlerle asla unutmayın.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-center hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Ücretsiz Başla
                </Link>
                <Link 
                  to="/login"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold text-center"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Pill className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Aspirin 100mg</p>
                          <p className="text-white/80 text-sm">Saat 09:00'da alın</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-400 ml-auto" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">D Vitamini</p>
                          <p className="text-white/80 text-sm">2 saat sonra</p>
                        </div>
                        <Clock className="h-6 w-6 text-yellow-400 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar Advertisements */}
            <div className="mt-12 lg:mt-0">
              <AdvertisementDisplay position="sidebar" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Sağlıklı Kalmak İçin İhtiyacınız Olan Her Şey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
              DozAsistan'ın kapsamlı ilaç yönetim sistemi, akıllı hatırlatmalar ve detaylı takip ile 
              tedavi planınıza mükemmel uyum sağlamanıza yardımcı olur.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Akıllı İlaç Takibi</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                Tüm ilaçlarınızı detaylı zamanlama, doz bilgileri ve rutininize uygun 
                kişiselleştirilmiş hatırlatmalarla kolayca ekleyin ve yönetin.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Akıllı Hatırlatmalar</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                Programınıza uyum sağlayan ve tüm cihazlarınızda zamanında hatırlatmalar 
                gönderen akıllı bildirim sistemimizle hiçbir dozu kaçırmayın.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-teal-100 dark:bg-teal-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Güvenli ve Özel</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                Sağlık verileriniz kurumsal düzeyde güvenlikle korunur. 
                Kişisel bilgilerinizi asla üçüncü taraflarla paylaşmayız.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">İlaç Uyum Oranı</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-blue-100">Aktif Kullanıcı</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-blue-100">Gönderilen Hatırlatma</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 dark:bg-gray-950 transition-colors">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white dark:text-gray-100 mb-6 transition-colors">
            Sağlığınızın Kontrolünü Almaya Hazır mısınız?
          </h2>
          <p className="text-xl text-gray-300 dark:text-gray-400 mb-8 transition-colors">
            İlaçlarını takip etmek için DozAsistan'a güvenen binlerce kullanıcıya katılın.
          </p>
          <Link 
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold inline-block hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Başlayın - Ücretsiz
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Footer Advertisements */}
          <div className="mb-8">
            <AdvertisementDisplay position="footer" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white transition-colors">DozAsistan</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">© 2025 DozAsistan. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;