import { useState, useEffect } from 'react';
import Login from './components/Login';
import MediaGallery from './components/MediaGallery';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {!isAuthenticated ? <Login /> : <MediaGallery />}
    </div>
  );
}

export default App;
