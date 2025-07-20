
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Pharmacies from './pages/Pharmacies';
import BarcodeScanner from './pages/BarcodeScanner';
import FamilyProfiles from './pages/FamilyProfiles';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Gamification from './pages/Gamification';
import MoodTracking from './pages/MoodTracking';
import Education from './pages/Education';
import HealthAssistant from './pages/HealthAssistant';
import VirtualDoctor from './pages/VirtualDoctor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Protected routes */}
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="medicines" 
                element={
                  <ProtectedRoute>
                    <Medicines />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="pharmacies" 
                element={
                  <ProtectedRoute>
                    <Pharmacies />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="barcode" 
                element={
                  <ProtectedRoute>
                    <BarcodeScanner />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="family" 
                element={
                  <ProtectedRoute>
                    <FamilyProfiles />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="gamification" 
                element={
                  <ProtectedRoute>
                    <Gamification />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="mood" 
                element={
                  <ProtectedRoute>
                    <MoodTracking />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="education" 
                element={
                  <ProtectedRoute>
                    <Education />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="health-assistant" 
                element={
                  <ProtectedRoute>
                    <HealthAssistant />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="virtual-doctor" 
                element={
                  <ProtectedRoute>
                    <VirtualDoctor />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="text-sm"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;