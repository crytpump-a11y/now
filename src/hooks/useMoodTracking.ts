import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MoodEntry } from '../types';
import { useAuth } from '../context/AuthContext';

export const useMoodTracking = () => {
  const { user, activeProfile } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentUserId = () => {
    return activeProfile ? activeProfile.id : user?.id;
  };

  useEffect(() => {
    if (user) {
      loadMoodEntries();
    }
  }, [user, activeProfile]);

  const loadMoodEntries = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date', { ascending: false });
      
      if (!error && data) {
        const entries = data.map((entry: any) => ({
          id: entry.id,
          userId: entry.user_id,
          date: entry.date,
          mood: entry.mood,
          energy: entry.energy,
          symptoms: entry.symptoms,
          notes: entry.notes,
          createdAt: entry.created_at
        }));
        setMoodEntries(entries);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  };

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id' | 'userId' | 'createdAt'>) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert({
          user_id: currentUserId,
          date: entry.date,
          mood: entry.mood,
          energy: entry.energy,
          symptoms: entry.symptoms,
          notes: entry.notes
        })
        .select()
        .single();
      
      if (!error && data) {
        const newEntry: MoodEntry = {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          mood: data.mood,
          energy: data.energy,
          symptoms: data.symptoms,
          notes: data.notes,
          createdAt: data.created_at
        };
        
        setMoodEntries(prev => {
          const filtered = prev.filter(e => e.date !== entry.date);
          return [newEntry, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      }
    } catch (error) {
      console.error('Error adding mood entry:', error);
    }
    
    setLoading(false);
  };

  const getTodaysMood = () => {
    const today = new Date().toISOString().split('T')[0];
    return moodEntries.find(entry => entry.date === today);
  };

  const getMoodStats = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = moodEntries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    const moodCounts = {
      'very-bad': 0,
      'bad': 0,
      'neutral': 0,
      'good': 0,
      'very-good': 0
    };

    let totalEnergy = 0;
    const allSymptoms: string[] = [];

    recentEntries.forEach(entry => {
      moodCounts[entry.mood]++;
      totalEnergy += entry.energy;
      allSymptoms.push(...entry.symptoms);
    });

    const averageEnergy = recentEntries.length > 0 ? totalEnergy / recentEntries.length : 0;
    const commonSymptoms = getCommonSymptoms(allSymptoms);

    return {
      totalEntries: recentEntries.length,
      moodCounts,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      commonSymptoms,
      recentEntries: recentEntries.slice(0, 7)
    };
  };

  const getCommonSymptoms = (symptoms: string[]) => {
    const counts: { [key: string]: number } = {};
    symptoms.forEach(symptom => {
      counts[symptom] = (counts[symptom] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));
  };

  return {
    moodEntries,
    loading,
    addMoodEntry,
    getTodaysMood,
    getMoodStats
  };
};