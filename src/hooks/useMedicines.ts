import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Medicine, MedicineTaken } from '../types';
import { useAuth } from '../context/AuthContext';
import { DrugInteractionService } from '../services/drugInteractionService';
import { useNotifications } from './useNotifications';

export const useMedicines = () => {
  const { user, activeProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineTaken, setMedicineTaken] = useState<MedicineTaken[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentUserId = () => {
    return activeProfile ? activeProfile.id : user?.id;
  };

  useEffect(() => {
    if (user) {
      loadMedicines();
      loadMedicineTaken();
    }
  }, [user, activeProfile]);

  const loadMedicines = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', currentUserId);
      
      if (!error && data) {
        const medicines = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          times: m.times,
          startDate: m.start_date,
          endDate: m.end_date,
          notes: m.notes,
          color: m.color,
          userId: m.user_id,
          isActive: m.is_active
        }));
        setMedicines(medicines);
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const loadMedicineTaken = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('medicine_taken')
        .select('*')
        .eq('user_id', currentUserId);
      
      if (!error && data) {
        const taken = data.map((t: any) => ({
          id: t.id,
          medicineId: t.medicine_id,
          userId: t.user_id,
          takenAt: t.taken_at,
          scheduledTime: t.scheduled_time,
          status: t.status
        }));
        setMedicineTaken(taken);
      }
    } catch (error) {
      console.error('Error loading medicine taken:', error);
    }
  };

  const addMedicine = async (medicine: Omit<Medicine, 'id' | 'userId'>) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          user_id: currentUserId,
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          times: medicine.times,
          start_date: medicine.startDate,
          end_date: medicine.endDate,
          notes: medicine.notes,
          color: medicine.color,
          is_active: medicine.isActive
        })
        .select()
        .single();
      
      if (!error && data) {
        const newMedicine: Medicine = {
          id: data.id,
          name: data.name,
          dosage: data.dosage,
          frequency: data.frequency,
          times: data.times,
          startDate: data.start_date,
          endDate: data.end_date,
          notes: data.notes,
          color: data.color,
          userId: data.user_id,
          isActive: data.is_active
        };
        setMedicines(prev => [...prev, newMedicine]);
        
        // Check for drug interactions
        const existingMedicineNames = medicines
          .filter(m => m.isActive)
          .map(m => m.name);
        
        const allMedicineNames = [...existingMedicineNames, medicine.name];
        const interactions = DrugInteractionService.checkInteractions(allMedicineNames);
        
        if (interactions.length > 0) {
          interactions.forEach(interaction => {
            const severityText = DrugInteractionService.getSeverityText(interaction.severity);
            addNotification({
              title: `⚠️ İlaç Etkileşimi Uyarısı (${severityText})`,
              message: `${interaction.drug1} ve ${interaction.drug2} arasında etkileşim tespit edildi. ${interaction.description}`,
              type: interaction.severity === 'major' ? 'error' : 'warning',
              isRead: false
            });
          });
        }
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
    
    setLoading(false);
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          name: updates.name,
          dosage: updates.dosage,
          frequency: updates.frequency,
          times: updates.times,
          start_date: updates.startDate,
          end_date: updates.endDate,
          notes: updates.notes,
          color: updates.color,
          is_active: updates.isActive
        })
        .eq('id', id);
      
      if (!error) {
        setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
    }
    
    setLoading(false);
  };

  const deleteMedicine = async (id: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setMedicines(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
    
    setLoading(false);
  };

  const markMedicineTaken = async (medicineId: string, scheduledTime: string, status: 'taken' | 'missed') => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('medicine_taken')
        .insert({
          medicine_id: medicineId,
          user_id: currentUserId,
          taken_at: new Date().toISOString(),
          scheduled_time: scheduledTime,
          status: status
        })
        .select()
        .single();
      
      if (!error && data) {
        const taken: MedicineTaken = {
          id: data.id,
          medicineId: data.medicine_id,
          userId: data.user_id,
          takenAt: data.taken_at,
          scheduledTime: data.scheduled_time,
          status: data.status
        };
        setMedicineTaken(prev => [...prev, taken]);
      }
    } catch (error) {
      console.error('Error marking medicine taken:', error);
    }
  };

  const getTodaysMedicines = () => {
    const today = new Date().toISOString().split('T')[0];
    return medicines.filter(medicine => {
      if (!medicine.isActive) return false;
      const startDate = new Date(medicine.startDate).toISOString().split('T')[0];
      const endDate = medicine.endDate ? new Date(medicine.endDate).toISOString().split('T')[0] : null;
      
      return startDate <= today && (!endDate || endDate >= today);
    });
  };

  const getMedicineStatus = (medicineId: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    const taken = medicineTaken.find(t => 
      t.medicineId === medicineId && 
      t.scheduledTime === time &&
      t.takenAt.startsWith(today)
    );
    return taken?.status || 'pending';
  };

  return {
    medicines,
    loading,
    medicineTaken,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    markMedicineTaken,
    getTodaysMedicines,
    getMedicineStatus
  };
};