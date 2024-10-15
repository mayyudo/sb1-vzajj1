import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TimeTracking from './pages/TimeTracking';
import TimeReport from './pages/TimeReport';
import Profile from './pages/Profile';
import InitialProfileSetup from './pages/InitialProfileSetup';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './components/ErrorBoundary';
import LeaveRequest from './pages/LeaveRequest';

const AppRoutes = () => {
  const { isNewUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute
            element={isNewUser ? <Navigate to="/initial-profile-setup" /> : <Dashboard />}
          />
        }
      />
      <Route
        path="/initial-profile-setup"
        element={<PrivateRoute element={<InitialProfileSetup />} />}
      />
      <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} adminOnly={true} />} />
      <Route path="/time-tracking" element={<PrivateRoute element={<TimeTracking />} />} />
      <Route path="/time-report" element={<PrivateRoute element={<TimeReport />} />} />
      <Route path="/leave-request" element={<PrivateRoute element={<LeaveRequest />} />} />
      <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </I18nextProvider>
  );
}

export default App;