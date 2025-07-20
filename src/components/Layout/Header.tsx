import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Pill, Bell, User, LogOut, Settings, Home, Users, ChevronDown, Trophy, Heart, BookOpen, Brain, Stethoscope, MapPin } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, activeProfile, familyProfiles, switchProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">DozAsistan</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/medicines"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/medicines') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Pill className="h-4 w-4" />
              <span>Medicines</span>
            </Link>

            <Link 
              to="/pharmacies"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pharmacies') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Eczaneler</span>
            </Link>

            <Link 
              to="/notifications"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isActive('/notifications') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Bildirimler</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {user.isAdmin && (
              <Link 
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Yönetici Paneli</span>
              </Link>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Profile Switcher */}
            {familyProfiles.length > 0 && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {activeProfile ? activeProfile.name : 'Ana Profil'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => switchProfile(null)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        !activeProfile ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Ana Profil ({user?.username})
                    </button>
                    {familyProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => switchProfile(profile.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          activeProfile?.id === profile.id ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {profile.name} ({profile.relationship})
                      </button>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <Link 
                      to="/gamification"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Başarılarım</span>
                    </Link>
                    
                    <Link 
                      to="/mood"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Ruh Hali Takibi</span>
                    </Link>
                    
                    <Link 
                      to="/education"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Eğitim ve Destek</span>
                    </Link>
                    
                    <Link 
                      to="/health-assistant"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Brain className="h-4 w-4" />
                      <span>Sağlık Asistanı</span>
                    </Link>
                    
                    <Link 
                      to="/virtual-doctor"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Stethoscope className="h-4 w-4" />
                      <span>Sanal Doktor</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {activeProfile ? activeProfile.name : user.username}
                </span>
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                  
                  <Link 
                    to="/family"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Users className="h-4 w-4" />
                    <span>Aile Profilleri</span>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link 
                      to="/admin"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Yönetici Paneli</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <Link 
                    to="/education"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Eğitim</span>
                  </Link>
                  
                  <Link 
                    to="/health-assistant"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Sağlık Asistanı</span>
                  </Link>
                  
                  <Link 
                    to="/virtual-doctor"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span>Sanal Doktor</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;