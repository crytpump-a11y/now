import React, { useState, useEffect } from 'react';
import { pharmacyService } from '../services/pharmacyService';
import { Pharmacy } from '../types';
import { MapPin, Phone, Search, Clock, Navigation, Locate } from 'lucide-react';
import { toast } from 'react-toastify';

const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [useLocation, setUseLocation] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadPharmacies();
      loadDistricts();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity) {
      loadPharmacies();
    }
  }, [selectedDistrict]);

  useEffect(() => {
    // Initialize with first city when cities are loaded
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]);
    }
  }, [cities]);

  const loadCities = async () => {
    try {
      const cityList = await pharmacyService.getCities();
      setCities(cityList);
      // Set default city if none selected
      if (!selectedCity && cityList.length > 0) {
        setSelectedCity(cityList[0]);
      }
    } catch (error) {
      toast.error('Şehir listesi yüklenirken hata oluştu');
    }
  };

  const loadDistricts = async () => {
    try {
      const districtList = await pharmacyService.getDistricts(selectedCity);
      setDistricts(districtList);
      setSelectedDistrict(''); // Reset district when city changes
    } catch (error) {
      toast.error('İlçe listesi yüklenirken hata oluştu');
    }
  };

  const loadPharmacies = async () => {
    setLoading(true);
    try {
      let pharmacies: Pharmacy[] = [];
      if (selectedCity && selectedDistrict) {
        pharmacies = await pharmacyService.getPharmaciesByDistrict(selectedCity, selectedDistrict);
      } else if (selectedCity) {
        pharmacies = await pharmacyService.getPharmaciesByCity(selectedCity);
      }
      setPharmacies(pharmacies);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      toast.error('Eczane listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyPharmacies = () => {
    if (!navigator.geolocation) {
      toast.error('Konum servisi desteklenmiyor');
      return;
    }

    setLoading(true);
    setUseLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        try {
          const { latitude, longitude } = position.coords;
          const nearbyPharmacies: Pharmacy[] = await pharmacyService.getNearbyPharmacies(latitude, longitude);
          setPharmacies(nearbyPharmacies);
          toast.success('Yakınınızdaki eczaneler listelendi');
        } catch (err) {
          console.error('Error loading nearby pharmacies:', err);
          toast.error('Yakın eczaneler yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      },
      (geoError: GeolocationPositionError) => {
        console.error('Geolocation error:', geoError.message);
        toast.error('Konum alınamadı. Lütfen konum izni verin.');
        setLoading(false);
        setUseLocation(false);
      }
    );
  };
  
  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = (pharmacy: Pharmacy) => {
    if (pharmacy.latitude && pharmacy.longitude) {
      window.open(`https://maps.google.com/?q=${pharmacy.latitude},${pharmacy.longitude}`, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(pharmacy.address + ' ' + pharmacy.city)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Nöbetçi Eczaneler</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Size en yakın nöbetçi eczaneleri bulun</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Şehir Seçin
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setUseLocation(false);
                  setSelectedDistrict(''); // Reset district when city changes
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                disabled={useLocation}
              >
                <option value="">Şehir Seçin</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                İlçe Seçin (İsteğe Bağlı)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                disabled={useLocation}
              >
                <option value="">Tüm İlçeler</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Eczane Ara
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Eczane adı, adres veya ilçe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Konum Bazlı
              </label>
              <button
                onClick={loadNearbyPharmacies}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Locate className="h-4 w-4" />
                <span>Yakınımdakiler</span>
              </button>
            </div>
          </div>

          {useLocation && (
            <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-3 transition-colors">
              <p className="text-green-800 dark:text-green-200 text-sm transition-colors">
                📍 Konumunuza göre eczaneler listeleniyor
              </p>
            </div>
          )}
        </div>

        {/* Pharmacies List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 transition-colors">Nöbetçi eczaneler yükleniyor...</p>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                {searchTerm ? 'Eczane bulunamadı' : 'Nöbetçi eczane bulunamadı'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
                {searchTerm 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin' 
                  : `${selectedCity} için şu anda nöbetçi eczane bilgisi bulunmuyor`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                          {pharmacy.name}
                        </h3>
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                          Nöbetçi
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 transition-colors">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{pharmacy.address}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 transition-colors">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{pharmacy.phone}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 transition-colors">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">24 Saat Açık</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleCall(pharmacy.phone)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Ara</span>
                      </button>
                      
                      <button
                        onClick={() => handleDirections(pharmacy)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Yol Tarifi</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors">Nöbetçi Eczane Bilgileri</h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed transition-colors">
                Nöbetçi eczaneler 24 saat hizmet vermektedir. Acil durumlarda ilaç ihtiyacınız için 
                size en yakın nöbetçi eczaneyi bulabilir, telefon ile arayarak stok durumunu 
                öğrenebilirsiniz. Yol tarifi için harita uygulamanız açılacaktır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacies;