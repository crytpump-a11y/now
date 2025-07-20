import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {user && <Header />}
      <main className={user ? 'pt-0' : ''}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;