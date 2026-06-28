import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Baro from './components/Baro';
import World from './components/World';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  // If NOT logged in, just show the login screen (no sidebar)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-4">
        <Login />
      </div>
    );
  }

  // If logged in, show the full application layout!
  return (
    <BrowserRouter>
      {/* We use h-screen to make the app exactly the height of the monitor, avoiding double-scrollbars */}
      <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
        
        <Sidebar />

        {/* The main content area where pages swap in and out */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-red-500 mb-8 pl-4">
              Warframe Alert Hub
            </h1>
            
            <Routes>
              {/* When the URL is '/', draw Dashboard */}
              <Route path="/" element={<Dashboard />} />
              {/* When the URL is '/world', draw World */}
              <Route path="/world" element={<World />} />
              {/* When the URL is '/baro', draw Baro */}
              <Route path="/baro" element={<Baro />} />
            </Routes>
            
          </div>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;