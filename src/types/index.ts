export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  theme: 'light' | 'dark';
  createdAt: string;
  isAdmin?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  color: string;
  userId: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface MedicineTaken {
  id: string;
  medicineId: string;
  userId: string;
  takenAt: string;
  scheduledTime: string;
  status: 'taken' | 'missed' | 'pending';
}

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetUrl?: string;
  isActive: boolean;
  position: 'header' | 'sidebar' | 'footer';
  createdAt: string;
  endDate?: string;
}

export interface FamilyProfile {
  id: string;
  name: string;
  relationship: string;
  birthDate?: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'total' | 'consistency' | 'milestone';
  requirement: number;
  points: number;
  unlockedAt?: string;
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalMedicinesTaken: number;
  adherenceRate: number;
  level: number;
  achievements: string[];
  lastUpdated: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: 'very-bad' | 'bad' | 'neutral' | 'good' | 'very-good';
  energy: number; // 1-5
  symptoms: string[];
  notes?: string;
  createdAt: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}