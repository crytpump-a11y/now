import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, MessageSquare, Trash2, Plus, Edit, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { Advertisement } from '../types';
import ImageUpload from '../components/ImageUpload';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'ads'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | undefined>();

  // Clean up expired ads
  useEffect(() => {
    cleanupExpiredAds();
  }, []);

  const cleanupExpiredAds = () => {
    const stored = localStorage.getItem('medireminder_advertisements');
    if (stored) {
      const allAds = JSON.parse(stored);
      const now = new Date();
      const activeAds = allAds.filter((ad: Advertisement) => {
        if (!ad.endDate) return true;
        return new Date(ad.endDate) > now;
      });
      
      if (activeAds.length !== allAds.length) {
        localStorage.setItem('medireminder_advertisements', JSON.stringify(activeAds));
        setAdvertisements(activeAds);
      }
    }
  };

  useEffect(() => {
    loadUsers();
    loadAdvertisements();
  }, []);

  const loadUsers = () => {
    const loadUsersFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    
    loadUsersFromSupabase();
  };

  const loadAdvertisements = () => {
    const loadAdsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          const ads = data.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            content: ad.content,
            imageUrl: ad.image_url,
            targetUrl: ad.target_url,
            position: ad.position,
            isActive: ad.is_active,
            endDate: ad.end_date,
            createdAt: ad.created_at
          }));
          setAdvertisements(ads);
        }
      } catch (error) {
        console.error('Error loading advertisements:', error);
      }
    };
    
    loadAdsFromSupabase();
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Kendi hesabınızı silemezsiniz');
      return;
    }

    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        // Delete user from auth and database
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error('Auth deletion error:', authError);
          // Continue with database deletion even if auth deletion fails
        }
        
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (!error) {
          setUsers(prev => prev.filter(u => u.id !== userId));
          toast.success('Kullanıcı başarıyla silindi');
        } else {
          toast.error('Kullanıcı silinirken hata oluştu');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Kullanıcı silinirken hata oluştu');
      }
    }
  };

  const handleAdSubmit = (adData: Omit<Advertisement, 'id' | 'createdAt'>) => {
    if (adData.endDate && new Date(adData.endDate) <= new Date()) {
      toast.error('Bitiş tarihi gelecekte olmalıdır');
      return;
    }

    const saveAdToSupabase = async () => {
      try {
        if (editingAd) {
          const { error } = await supabase
            .from('advertisements')
            .update({
              title: adData.title,
              content: adData.content,
              image_url: adData.imageUrl,
              target_url: adData.targetUrl,
              position: adData.position,
              is_active: adData.isActive,
              end_date: adData.endDate || null
            })
            .eq('id', editingAd.id);
          
          if (!error) {
            toast.success('Reklam başarıyla güncellendi');
            loadAdvertisements();
          } else {
            toast.error('Reklam güncellenirken hata oluştu');
          }
        } else {
          const { error } = await supabase
            .from('advertisements')
            .insert({
              title: adData.title,
              content: adData.content,
              image_url: adData.imageUrl,
              target_url: adData.targetUrl,
              position: adData.position,
              is_active: adData.isActive,
              end_date: adData.endDate || null
            });
          
          if (!error) {
            toast.success('Reklam başarıyla oluşturuldu');
            loadAdvertisements();
          } else {
            toast.error('Reklam oluşturulurken hata oluştu');
          }
        }
      } catch (error) {
        console.error('Error saving advertisement:', error);
        toast.error('Reklam kaydedilirken hata oluştu');
      }
    };
    
    saveAdToSupabase();
    
    setShowAdForm(false);
    setEditingAd(undefined);
  };

  const deleteAd = (adId: string) => {
    if (window.confirm('Bu reklamı silmek istediğinizden emin misiniz?')) {
      const deleteAdFromSupabase = async () => {
        try {
          const { error } = await supabase
            .from('advertisements')
            .delete()
            .eq('id', adId);
          
          if (!error) {
            toast.success('Reklam başarıyla silindi');
            loadAdvertisements();
          } else {
            toast.error('Reklam silinirken hata oluştu');
          }
        } catch (error) {
          console.error('Error deleting advertisement:', error);
          toast.error('Reklam silinirken hata oluştu');
        }
      };
      
      deleteAdFromSupabase();
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya erişim izniniz yok.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Yönetici Paneli</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Kullanıcıları ve reklamları yönetin</p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Kullanıcılar ({users.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('ads')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ads'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Reklamlar ({advertisements.length})</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' ? (
              <div>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Kullanıcı Yönetimi</h2>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">Kayıtlı kullanıcıları görüntüleyin ve yönetin</p>
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">Kullanıcı bulunamadı</h3>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Oluşturulma
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium">{u.username[0].toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{u.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                u.isAdmin 
                                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}>
                                {u.isAdmin ? 'Yönetici' : 'Kullanıcı'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors">
                              {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => deleteUser(u.id)}
                                disabled={u.id === user?.id}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Reklam Yönetimi</h2>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">Reklamları oluşturun ve yönetin</p>
                  </div>
                  <button
                    onClick={() => setShowAdForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                      <span>Reklam Ekle</span>
                  </button>
                </div>

                {advertisements.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">Reklam yok</h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">Başlamak için ilk reklamınızı oluşturun</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advertisements.map((ad) => (
                      <div key={ad.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">{ad.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">{ad.content}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingAd(ad);
                                setShowAdForm(true);
                              }}
                              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteAd(ad.id)}
                              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 transition-colors">Konum:</span>
                            <span className="font-medium capitalize text-gray-900 dark:text-white transition-colors">{ad.position}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 transition-colors">Bitiş:</span>
                            <span className="font-medium text-gray-900 dark:text-white transition-colors">
                              {ad.endDate ? new Date(ad.endDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 transition-colors">Durum:</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              ad.isActive 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {ad.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ad Form Modal */}
        {showAdForm && (
          <AdFormModal
            editingAd={editingAd}
            onSubmit={handleAdSubmit}
            onCancel={() => {
              setShowAdForm(false);
              setEditingAd(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Separate Ad Form Modal Component
const AdFormModal: React.FC<{
  editingAd?: Advertisement;
  onSubmit: (data: Omit<Advertisement, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}> = ({ editingAd, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: editingAd?.title || '',
    content: editingAd?.content || '',
    imageUrl: editingAd?.imageUrl || '',
    targetUrl: editingAd?.targetUrl || '',
    endDate: editingAd?.endDate || '',
    position: editingAd?.position || 'header' as 'header' | 'sidebar' | 'footer',
    isActive: editingAd?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (imageData: string) => {
    setFormData(prev => ({ ...prev, imageUrl: imageData }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
            {editingAd ? 'Reklamı Düzenle' : 'Reklam Oluştur'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Başlık
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Konum
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as 'header' | 'sidebar' | 'footer' }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <option value="header">Üst Kısım (Header)</option>
                <option value="sidebar">Yan Panel (Sidebar)</option>
                <option value="footer">Alt Kısım (Footer)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              İçerik
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Reklam Görseli
            </label>
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImage={formData.imageUrl}
              position={formData.position}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Hedef URL (isteğe bağlı)
            </label>
            <input
              type="url"
              value={formData.targetUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Bitiş Tarihi (isteğe bağlı)
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
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
              {editingAd ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;