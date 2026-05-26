import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Queues from './pages/Queues';
import QueueDetail from './pages/QueueDetail';
import GenerateToken from './pages/GenerateToken';
import DisplayBoard from './pages/DisplayBoard';
import StaffManagement from './pages/StaffManagement';

const Layout = ({ children }) => (
  <div>
    <Navbar />
    <main>{children}</main>
  </div>
);

const RootRedirect = () => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (role === 'customer') return <Navigate to="/generate" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />

              {/* Display board — fullscreen, no navbar */}
              <Route path="/display" element={
                <ProtectedRoute allowedRoles={['staff', 'customer']}>
                  <DisplayBoard />
                </ProtectedRoute>
              } />

              {/* Staff only */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/queues" element={<ProtectedRoute allowedRoles={['staff']}><Layout><Queues /></Layout></ProtectedRoute>} />
              <Route path="/queues/new" element={<ProtectedRoute allowedRoles={['staff']}><Layout><Queues /></Layout></ProtectedRoute>} />
              <Route path="/queues/:id" element={<ProtectedRoute allowedRoles={['staff']}><Layout><QueueDetail /></Layout></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><Layout><StaffManagement /></Layout></ProtectedRoute>} />

              {/* Customer + Staff can generate tokens */}
              <Route path="/generate" element={<ProtectedRoute allowedRoles={['customer', 'staff']}><Layout><GenerateToken /></Layout></ProtectedRoute>} />

              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;