import React, { useState } from 'react';
import { useMedicines } from '../hooks/useMedicines';
import { Medicine } from '../types';
import { Pill, Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const MedicineForm: React.FC<{
  medicine?: Medicine;
  onSubmit: (medicine: Omit<Medicine, 'id' | 'userId'>) => void;
  onCancel: () => void;
}> = ({ medicine, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    dosage: medicine?.dosage || '',
    frequency: medicine?.frequency || 'daily',
    times: medicine?.times || ['09:00'],
    startDate: medicine?.startDate || new Date().toISOString().split('T')[0],
    endDate: medicine?.endDate || '',
    notes: medicine?.notes || '',
    color: medicine?.color || '#3B82F6',
    isActive: medicine?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || formData.times.length === 0) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    onSubmit(formData);
  };

  const addTime = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTime = (index: number, time: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
            {medicine ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              İlaç Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="örn., Aspirin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Doz *
            </label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="e.g., 100mg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Sıklık
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
              <option value="as-needed">Gerektiğinde</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Saatler *
            </label>
            <div className="space-y-2">
              {formData.times.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                + Saat Ekle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Renk
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Bu ilacı tanımlamak için bir renk seçin</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              rows={3}
              placeholder="Ek notlar..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 transition-colors"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Aktif
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              İlacı {medicine ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Medicines: React.FC = () => {
  const { medicines, loading, addMedicine, updateMedicine, deleteMedicine } = useMedicines();
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (medicineData: Omit<Medicine, 'id' | 'userId'>) => {
    if (editingMedicine) {
      await updateMedicine(editingMedicine.id, medicineData);
      toast.success('İlaç başarıyla güncellendi');
    } else {
      await addMedicine(medicineData);
      toast.success('İlaç başarıyla eklendi');
    }
    setShowForm(false);
    setEditingMedicine(undefined);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ilacı silmek istediğinizden emin misiniz?')) {
      await deleteMedicine(id);
      toast.success('İlaç başarıyla silindi');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicine(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">İlaçlarım</h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">İlaç programınızı yönetin</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>İlaç Ekle</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="İlaç ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Medicines List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
                {searchTerm ? 'İlaç bulunamadı' : 'Henüz ilaç eklenmedi'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                {searchTerm 
                  ? 'Arama terimlerinizi ayarlamayı deneyin' 
                  : 'İlaç programınızı takip etmeye başlamak için ilk ilacınızı ekleyin'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>İlaç Ekle</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMedicines.map((medicine) => (
                <div key={medicine.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: medicine.color }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">{medicine.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">{medicine.dosage} • {medicine.frequency}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {medicine.times.map((time, index) => (
                            <span 
                              key={index}
                              className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-300 transition-colors"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                        {medicine.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors">{medicine.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        medicine.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {medicine.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medicine Form Modal */}
        {showForm && (
          <MedicineForm
            medicine={editingMedicine}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default Medicines;