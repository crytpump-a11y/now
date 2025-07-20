import React, { useState, useEffect } from 'react';
import { BarcodeService, MedicineInfo } from '../services/barcodeService';
import { useMedicines } from '../hooks/useMedicines';
import { Camera, X, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { addMedicine } = useMedicines();
  const navigate = useNavigate();
  const barcodeService = new BarcodeService();

  useEffect(() => {
    return () => {
      barcodeService.stopScanning();
    };
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    setScannedCode('');
    setMedicineInfo(null);

    try {
      await barcodeService.startScanning(
        'qr-reader',
        async (decodedText) => {
          setScannedCode(decodedText);
          setIsScanning(false);
          
          // Try to get medicine info
          const info = await barcodeService.getMedicineInfo(decodedText);
          if (info) {
            setMedicineInfo(info);
            toast.success('İlaç bilgileri bulundu!');
          } else {
            toast.info('İlaç bilgisi bulunamadı. Manuel olarak ekleyebilirsiniz.');
            setShowAddForm(true);
          }
        },
        (error) => {
          console.error('Scanning error:', error);
        }
      );
    } catch (error) {
      toast.error('Kamera erişimi sağlanamadı');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    barcodeService.stopScanning();
    setIsScanning(false);
  };

  const handleAddMedicine = async (formData: any) => {
    const medicineData = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: 'daily',
      times: ['09:00'],
      startDate: new Date().toISOString().split('T')[0],
      notes: `Barkod: ${scannedCode}`,
      color: '#3B82F6',
      isActive: true
    };

    await addMedicine(medicineData);
    toast.success('İlaç başarıyla eklendi!');
    navigate('/medicines');
  };

  const addKnownMedicine = async () => {
    if (!medicineInfo) return;

    const medicineData = {
      name: medicineInfo.name,
      dosage: '1 tablet',
      frequency: 'daily',
      times: ['09:00'],
      startDate: new Date().toISOString().split('T')[0],
      notes: `Barkod: ${scannedCode}\nÜretici: ${medicineInfo.manufacturer || 'Bilinmiyor'}\nEtken Madde: ${medicineInfo.activeIngredient || 'Bilinmiyor'}`,
      color: '#3B82F6',
      isActive: true
    };

    await addMedicine(medicineData);
    toast.success('İlaç başarıyla eklendi!');
    navigate('/medicines');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Barkod Okuyucu</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">İlaç kutusundaki barkodu okutarak hızlıca ekleyin</p>
        </div>

        {/* Scanner Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors">
          <div className="text-center">
            {!isScanning && !scannedCode && (
              <div className="py-12">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Barkod Tarama</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                  İlaç kutusundaki barkodu kamera ile okutun
                </p>
                <button
                  onClick={startScanning}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Camera className="h-5 w-5" />
                  <span>Taramayı Başlat</span>
                </button>
              </div>
            )}

            {isScanning && (
              <div className="py-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Barkod Taranıyor...</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors">
                    Kamerayı ilaç kutusundaki barkoda doğrultun
                  </p>
                </div>
                
                <div id="qr-reader" className="mx-auto max-w-md"></div>
                
                <button
                  onClick={stopScanning}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <X className="h-4 w-4" />
                  <span>Taramayı Durdur</span>
                </button>
              </div>
            )}

            {scannedCode && !isScanning && (
              <div className="py-6">
                <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6 transition-colors">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 transition-colors">Barkod Okundu!</h3>
                  <p className="text-green-800 dark:text-green-200 font-mono text-sm transition-colors">{scannedCode}</p>
                </div>

                {medicineInfo ? (
                  <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6 transition-colors">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 transition-colors">İlaç Bilgileri Bulundu</h4>
                    <div className="text-left space-y-2">
                      <p className="text-blue-800 dark:text-blue-200 transition-colors"><strong>İlaç Adı:</strong> {medicineInfo.name}</p>
                      {medicineInfo.manufacturer && (
                        <p className="text-blue-800 dark:text-blue-200 transition-colors"><strong>Üretici:</strong> {medicineInfo.manufacturer}</p>
                      )}
                      {medicineInfo.activeIngredient && (
                        <p className="text-blue-800 dark:text-blue-200 transition-colors"><strong>Etken Madde:</strong> {medicineInfo.activeIngredient}</p>
                      )}
                    </div>
                    <button
                      onClick={addKnownMedicine}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>İlacı Ekle</span>
                    </button>
                  </div>
                ) : showAddForm && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-6 transition-colors">
                    <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4 transition-colors">İlaç Bilgisi Bulunamadı</h4>
                    <p className="text-yellow-800 dark:text-yellow-200 mb-4 transition-colors">
                      Bu barkod için kayıtlı ilaç bilgisi bulunamadı. Manuel olarak ekleyebilirsiniz.
                    </p>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleAddMedicine({
                          name: formData.get('name'),
                          dosage: formData.get('dosage')
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2 transition-colors">
                          İlaç Adı
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="İlaç adını girin"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2 transition-colors">
                          Doz
                        </label>
                        <input
                          type="text"
                          name="dosage"
                          required
                          className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="örn., 100mg, 1 tablet"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>İlacı Ekle</span>
                      </button>
                    </form>
                  </div>
                )}

                <button
                  onClick={() => {
                    setScannedCode('');
                    setMedicineInfo(null);
                    setShowAddForm(false);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Yeni Tarama
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <Search className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors">Nasıl Kullanılır?</h3>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1 transition-colors">
                <li>• İlaç kutusundaki barkodu bulun</li>
                <li>• "Taramayı Başlat" butonuna tıklayın</li>
                <li>• Kamerayı barkoda doğrultun</li>
                <li>• Sistem otomatik olarak barkodu okuyacak</li>
                <li>• İlaç bilgileri bulunursa otomatik eklenecek</li>
                <li>• Bulunamazsa manuel olarak ekleyebilirsiniz</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;