import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Edit, Trash2, User } from 'lucide-react';
import { toast } from 'react-toastify';

const FamilyProfileForm: React.FC<{
  profile?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ profile, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    relationship: profile?.relationship || '',
    birthDate: profile?.birthDate || '',
    isActive: profile?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relationship) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
            {profile ? 'Profili Düzenle' : 'Yeni Aile Profili'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              İsim *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Aile bireyinin adı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Yakınlık Derecesi *
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">Seçiniz</option>
              <option value="Eş">Eş</option>
              <option value="Çocuk">Çocuk</option>
              <option value="Anne">Anne</option>
              <option value="Baba">Baba</option>
              <option value="Kardeş">Kardeş</option>
              <option value="Büyükanne">Büyükanne</option>
              <option value="Büyükbaba">Büyükbaba</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Doğum Tarihi
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
              {profile ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FamilyProfiles: React.FC = () => {
  const { familyProfiles, addFamilyProfile, deleteFamilyProfile, activeProfile, switchProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(undefined);

  const handleSubmit = (data: any) => {
    if (editingProfile) {
      const updateFamilyProfile = async () => {
        try {
          const { error } = await supabase
            .from('family_profiles')
            .update({
              name: data.name,
              relationship: data.relationship,
              birth_date: data.birthDate,
              is_active: data.isActive
            })
            .eq('id', editingProfile.id);
          
          if (!error) {
            // Update local state
            setFamilyProfiles(prev => prev.map(p => 
              p.id === editingProfile.id 
                ? { ...p, ...data }
                : p
            ));
            toast.success('Aile profili başarıyla güncellendi');
          } else {
            toast.error('Profil güncellenirken hata oluştu');
          }
        } catch (error) {
          console.error('Error updating family profile:', error);
          toast.error('Profil güncellenirken hata oluştu');
        }
      };
      
      updateFamilyProfile();
    } else {
      addFamilyProfile(data);
      toast.success('Aile profili başarıyla eklendi');
    }
    setShowForm(false);
    setEditingProfile(undefined);
  };

  const handleEdit = (profile: any) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDelete = (profileId: string) => {
    if (window.confirm('Bu profili silmek istediğinizden emin misiniz?')) {
      deleteFamilyProfile(profileId);
      toast.success('Profil başarıyla silindi');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProfile(undefined);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Aile Profilleri</h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">Aile bireylerinin ilaç takibini yönetin</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Profil Ekle</span>
          </button>
        </div>

        {/* Current Active Profile */}
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8 transition-colors">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 transition-colors">Aktif Profil</h3>
              <p className="text-blue-800 dark:text-blue-200 transition-colors">
                {activeProfile ? `${activeProfile.name} (${activeProfile.relationship})` : 'Ana Profil'}
              </p>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          {familyProfiles.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Henüz aile profili eklenmedi</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                Aile bireylerinin ilaç takibini yapmak için profil oluşturun
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>İlk Profili Ekle</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {familyProfiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                    activeProfile?.id === profile.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => switchProfile(profile.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">{profile.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{profile.relationship}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(profile);
                        }}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(profile.id);
                        }}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {profile.birthDate && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        <span>Yaş: {calculateAge(profile.birthDate)} yaşında</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      <span>Oluşturulma: {new Date(profile.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profile.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {profile.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      
                      {activeProfile?.id === profile.id && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Seçili
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start space-x-3">
            <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 transition-colors">Aile Profilleri Hakkında</h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed transition-colors">
                Aile profilleri sayesinde tek hesapla birden fazla kişinin ilaç takibini yapabilirsiniz. 
                Her profil için ayrı ilaçlar, bildirimler ve raporlar tutulur. Profiller arasında 
                geçiş yapmak için üst menüdeki profil değiştiriciyi kullanabilir veya buradan 
                profil kartlarına tıklayabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Family Profile Form Modal */}
        {showForm && (
          <FamilyProfileForm
            profile={editingProfile}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default FamilyProfiles;