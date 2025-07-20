import { Pharmacy } from '../types';

export const pharmacyService = {
  async getPharmaciesByCity(city: string): Promise<Pharmacy[]> {
    // Use mock data directly to avoid network errors
    return this.getMockPharmacies(city);
  },

  async getPharmaciesByDistrict(city: string, district: string): Promise<Pharmacy[]> {
    const cityPharmacies = await this.getPharmaciesByCity(city);
    return cityPharmacies.filter(pharmacy => 
      pharmacy.district.toLowerCase().includes(district.toLowerCase())
    );
  },

  async getNearbyPharmacies(latitude: number, longitude: number): Promise<Pharmacy[]> {
    // Return pharmacies from major cities for location-based search
    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
    const allPharmacies = [];
    
    for (const city of cities) {
      const cityPharmacies = this.getMockPharmacies(city);
      allPharmacies.push(...cityPharmacies);
    }
    
    return allPharmacies.slice(0, 10); // Return first 10 for nearby
  },

  async getCities(): Promise<string[]> {
    // Return comprehensive list of Turkish cities
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

  async getDistricts(city: string): Promise<string[]> {
    // Return districts based on city
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
        },
        {
          id: 'ist-4',
          name: 'Boğaziçi Eczanesi',
          address: 'Barbaros Bulvarı No:75 Beşiktaş/İstanbul',
          phone: '0212 555 0404',
          district: 'Beşiktaş',
          city: 'İstanbul',
          latitude: 41.0422,
          longitude: 29.0094
        },
        {
          id: 'ist-5',
          name: 'Şişli Eczanesi',
          address: 'Halaskargazi Cad. No:89 Şişli/İstanbul',
          phone: '0212 555 0505',
          district: 'Şişli',
          city: 'İstanbul',
          latitude: 41.0581,
          longitude: 28.9833
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
        },
        {
          id: 'ank-3',
          name: 'Ulus Eczanesi',
          address: 'Ulus Meydanı No:8 Altındağ/Ankara',
          phone: '0312 555 0303',
          district: 'Altındağ',
          city: 'Ankara',
          latitude: 39.9453,
          longitude: 32.8597
        }
      ],
      'İzmir': [
        {
          id: 'izm-1',
          name: 'Ege Eczanesi',
          address: 'Kordon Boyu No:45 Konak/İzmir',
          phone: '0232 555 0101',
          district: 'Konak',
          city: 'İzmir',
          latitude: 38.4192,
          longitude: 27.1287
        },
        {
          id: 'izm-2',
          name: 'Alsancak Eczanesi',
          address: 'Alsancak Cad. No:67 Konak/İzmir',
          phone: '0232 555 0202',
          district: 'Konak',
          city: 'İzmir',
          latitude: 38.4378,
          longitude: 27.1524
        },
        {
          id: 'izm-3',
          name: 'Bornova Eczanesi',
          address: 'Kazım Dirik Cad. No:123 Bornova/İzmir',
          phone: '0232 555 0303',
          district: 'Bornova',
          city: 'İzmir',
          latitude: 38.4697,
          longitude: 27.2167
        }
      ],
      'Bursa': [
        {
          id: 'bur-1',
          name: 'Yeşil Eczanesi',
          address: 'Atatürk Cad. No:34 Osmangazi/Bursa',
          phone: '0224 555 0101',
          district: 'Osmangazi',
          city: 'Bursa',
          latitude: 40.1826,
          longitude: 29.0669
        },
        {
          id: 'bur-2',
          name: 'Nilüfer Eczanesi',
          address: 'Nilüfer Cad. No:56 Nilüfer/Bursa',
          phone: '0224 555 0202',
          district: 'Nilüfer',
          city: 'Bursa',
          latitude: 40.2297,
          longitude: 28.9864
        }
      ],
      'Antalya': [
        {
          id: 'ant-1',
          name: 'Akdeniz Eczanesi',
          address: 'Cumhuriyet Cad. No:78 Muratpaşa/Antalya',
          phone: '0242 555 0101',
          district: 'Muratpaşa',
          city: 'Antalya',
          latitude: 36.8969,
          longitude: 30.7133
        },
        {
          id: 'ant-2',
          name: 'Kaleiçi Eczanesi',
          address: 'Kaleiçi Sok. No:23 Muratpaşa/Antalya',
          phone: '0242 555 0202',
          district: 'Muratpaşa',
          city: 'Antalya',
          latitude: 36.8841,
          longitude: 30.7056
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
      },
      {
        id: `${city.toLowerCase()}-2`,
        name: 'Sağlık Eczanesi',
        address: `Cumhuriyet Cad. No:42 ${city}`,
        phone: '0212 555 0202',
        district: 'Merkez',
        city: city,
        latitude: 39.9334,
        longitude: 32.8597
      }
    ];
  }
};