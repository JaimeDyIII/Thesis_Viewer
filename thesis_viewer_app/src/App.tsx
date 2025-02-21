import React from 'react';
import './styles/App.css';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './services/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
