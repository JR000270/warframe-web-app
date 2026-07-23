import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Baro from './components/Baro';
import World from './components/World';
import Login from './components/Login';
import Cetus from './components/Cetus';
import Vallis from './components/Vallis';
import Cambion from './components/Cambion';
import Duviri from './components/Duviri';
import Sidebar from './components/Sidebar';
import Support from './components/Support';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import pageBg from './images/warframe_content_page_background.png';

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

  return (
    <BrowserRouter>
      {/* We use h-screen to make the app exactly the height of the monitor, avoiding double-scrollbars */}
      <div className={"flex h-screen  text-white overflow-hidden bg-cover bg-no-repeat bg-top"}
      style={{ backgroundImage: `url(${pageBg})` }}>
        
        <Sidebar />

        {/* The main content area where pages swap in and out */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* STATIONARY TITLE BLOCK */}
          {/* flex-shrink-0 ensures this box never squishes when the page gets full */}
          <div className="p-15 pt-13 pb-6 shrink-0">
            <h1 className="text-4xl font-display font-bold text-white pl-4">
              Warframe World View
            </h1>
          </div>
          
          {/* scrollable page content */}
          {/* flex-1 lets it fill the rest of the space, and overflow-y-auto makes ONLY this box scroll */}
          <div className="flex-1 overflow-y-auto px-15 pb-12">
            <Routes>
              {/* When the URL is '/', draw Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<World />} />

              <Route path="/baro" element={<Baro />} />
              
              {/* Open Worlds*/}
              <Route path="/cetus" element={<Cetus />} />
              <Route path="/vallis" element={<Vallis />} />
              <Route path="/cambion" element={<Cambion />} />
              <Route path="/duviri" element={<Duviri />} />

              <Route path="/support" element={<Support />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
          
          {/* empty div to keep scrollable content in aesthetic alignment */}
          <div className="p-2"></div>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;