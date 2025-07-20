import { Pharmacy } from '../types';

const RAPIDAPI_KEY = '6d5f2b0502msh3e712505ac4bbf1p1ab9dajsna6e11f8b7d4e';
const RAPIDAPI_HOST = 'nobetci-eczaneler-api-turkiye.p.rapidapi.com';

export const pharmacyService = {
  async getPharmaciesByCity(city: string): Promise<Pharmacy[]> {
    try {
      const response = await fetch(`https://${RAPIDAPI_HOST}/api/pharmacies/city/${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // API yanıtını Pharmacy tipine dönüştür
      return this.transformApiResponse(data, city);
    } catch (error) {
      console.error('Error fetching pharmacies by city:', error);
      // Hata durumunda mock veri döndür
      return this.getMockPharmacies(city);
    }
  },

  async getPharmaciesByDistrict(city: string, district: string): Promise<Pharmacy[]> {
    try {
      const response = await fetch(`https://${RAPIDAPI_HOST}/api/pharmacies/district/${encodeURIComponent(city)}/${encodeURIComponent(district)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformApiResponse(data, city, district);
    } catch (error) {
      console.error('Error fetching pharmacies by district:', error);
      // Hata durumunda şehir bazında arama yap ve ilçeye göre filtrele
      const cityPharmacies = await this.getPharmaciesByCity(city);
      return cityPharmacies.filter(pharmacy => 
        pharmacy.district.toLowerCase().includes(district.toLowerCase())
      );
    }
  },

  async getNearbyPharmacies(latitude: number, longitude: number): Promise<Pharmacy[]> {
    try {
      const response = await fetch(`https://${RAPIDAPI_HOST}/api/pharmacies/nearby?lat=${latitude}&lng=${longitude}&radius=5`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformApiResponse(data);
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      // Hata durumunda büyük şehirlerden örnek veri döndür
      const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
      const allPharmacies = [];
      
      for (const city of cities) {
        const cityPharmacies = this.getMockPharmacies(city);
        allPharmacies.push(...cityPharmacies);
      }
      
      return allPharmacies.slice(0, 10);
    }
  },

  async getCities(): Promise<string[]> {
    try {
      const response = await fetch(`https://${RAPIDAPI_HOST}/api/cities`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map(city => typeof city === 'string' ? city : city.name || city.city);
      }
      
      // Fallback to static list
      return this.getStaticCities();
    } catch (error) {
      console.error('Error fetching cities:', error);
      return this.getStaticCities();
    }
  },

  async getDistricts(city: string): Promise<string[]> {
    try {
      const response = await fetch(`https://${RAPIDAPI_HOST}/api/districts/${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map(district => typeof district === 'string' ? district : district.name || district.district);
      }
      
      // Fallback to static districts
      return this.getStaticDistricts(city);
    } catch (error) {
      console.error('Error fetching districts:', error);
      return this.getStaticDistricts(city);
    }
  },

  transformApiResponse(data: any, city?: string, district?: string): Pharmacy[] {
    if (!data) return [];
    
    // API yanıtının farklı formatlarını destekle
    let pharmacies = [];
    
    if (Array.isArray(data)) {
      pharmacies = data;
    } else if (data.pharmacies && Array.isArray(data.pharmacies)) {
      pharmacies = data.pharmacies;
    } else if (data.data && Array.isArray(data.data)) {
      pharmacies = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      pharmacies = data.results;
    }

    return pharmacies.map((pharmacy: any, index: number) => ({
      id: pharmacy.id || `pharmacy-${index}`,
      name: pharmacy.name || pharmacy.eczane_adi || pharmacy.pharmacyName || 'Bilinmeyen Eczane',
      address: pharmacy.address || pharmacy.adres || pharmacy.full_address || 'Adres bilgisi yok',
      phone: pharmacy.phone || pharmacy.telefon || pharmacy.tel || 'Telefon bilgisi yok',
      district: pharmacy.district || pharmacy.ilce || district || 'Bilinmeyen İlçe',
      city: pharmacy.city || pharmacy.il || city || 'Bilinmeyen Şehir',
      latitude: pharmacy.latitude || pharmacy.lat || pharmacy.enlem || undefined,
      longitude: pharmacy.longitude || pharmacy.lng || pharmacy.boylam || undefined
    }));
  },

  getStaticCities(): string[] {
    return [
      'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
      'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
      'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
      'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
      'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
      'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
      'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
      'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
      'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
      'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
    ];
  },

  getStaticDistricts(city: string): string[] {
    const districtMap: Record<string, string[]> = {
      'İstanbul': [
        'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy',
        'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece',
        'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa',
        'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik',
        'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli',
        'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'
      ],
      'Ankara': [
        'Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk',
        'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan',
        'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan',
        'Şereflikoçhisar', 'Yenimahalle'
      ],
      'İzmir': [
        'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca',
        'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun',
        'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere',
        'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'
      ]
    };

    return districtMap[city] || [
      'Merkez', 'Cumhuriyet', 'Atatürk', 'Fatih', 'Yenişehir', 'Kocatepe', 'Bahçelievler'
    ];
  },

  getMockPharmacies(city: string): Pharmacy[] {
    const mockData: Record<string, Pharmacy[]> = {
      'İstanbul': [
        {
          id: 'ist-1',
          name: 'Merkez Eczanesi',
          address: 'Atatürk Cad. No:15 Fatih/İstanbul',
          phone: '0212 555 0101',
          district: 'Fatih',
          city: 'İstanbul',
          latitude: 41.0082,
          longitude: 28.9784
        },
        {
          id: 'ist-2',
          name: 'Sağlık Eczanesi',
          address: 'İstiklal Cad. No:42 Beyoğlu/İstanbul',
          phone: '0212 555 0202',
          district: 'Beyoğlu',
          city: 'İstanbul',
          latitude: 41.0369,
          longitude: 28.9850
        },
        {
          id: 'ist-3',
          name: 'Anadolu Eczanesi',
          address: 'Bağdat Cad. No:128 Kadıköy/İstanbul',
          phone: '0216 555 0303',
          district: 'Kadıköy',
          city: 'İstanbul',
          latitude: 40.9833,
          longitude: 29.0833
        }
      ],
      'Ankara': [
        {
          id: 'ank-1',
          name: 'Başkent Eczanesi',
          address: 'Atatürk Bulvarı No:25 Çankaya/Ankara',
          phone: '0312 555 0101',
          district: 'Çankaya',
          city: 'Ankara',
          latitude: 39.9208,
          longitude: 32.8541
        },
        {
          id: 'ank-2',
          name: 'Kızılay Eczanesi',
          address: 'Kızılay Meydanı No:12 Çankaya/Ankara',
          phone: '0312 555 0202',
          district: 'Çankaya',
          city: 'Ankara',
          latitude: 39.9208,
          longitude: 32.8541
        }
      ]
    };
    
    return mockData[city] || [
      {
        id: `${city.toLowerCase()}-1`,
        name: 'Merkez Eczanesi',
        address: `Atatürk Cad. No:15 ${city}`,
        phone: '0212 555 0101',
        district: 'Merkez',
        city: city,
        latitude: 39.9334,
        longitude: 32.8597
      }
    ];
  }
};