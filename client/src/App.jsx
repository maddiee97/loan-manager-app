// client/src/App.jsx (Layout Fix)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const token = localStorage.getItem('token');
  
  // This layout removes the centering classes so the dashboard sits at the top
  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="/auth" element={
          <div className="flex items-center justify-center h-screen">
            <Auth />
          </div>
        } />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
      </Routes>
    </div>
  );
}

export default App;