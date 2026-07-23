import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div 
      className="h-screen w-screen flex flex-col lg:flex-row text-white overflow-hidden bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${pageBg})` }}
    >
      
      {/* 1. MOBILE TOP BAR (Only visible on phones/tablets, hidden on laptop 'lg:') */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-slate-950/80 border-b border-cyan-500/30 backdrop-blur-md shrink-0 z-20">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="py-1 px-3 text-sm font-bold text-cyan-400 border rounded-sm border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_10px_rgba(34,211,238,0.3)] cursor-pointer"
        >
          {isMobileMenuOpen ? 'Close Menu ✕' : 'Menu ☰'}
        </button>

        <span className="text-sm font-display font-bold text-cyan-100 tracking-wider">
          Warframe World View
        </span>

        <Link 
          to="/support"
          className="py-1 px-2.5 text-xs font-semibold text-cyan-400 border border-cyan-500/40 rounded-sm bg-cyan-950/40 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
        >
          Feedback
        </Link>
      </div>

      {/* 2. SIDEBAR 
          - On Mobile: Toggles between hidden and stacked display based on state.
          - On Laptop (lg:): Permanently visible flex block side-by-side.
      */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex shrink-0 z-10`}>
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Desktop Title block (Hidden on mobile since mobile top bar handles branding) */}
        <div className="hidden lg:block p-15 pt-13 pb-6 shrink-0">
          <h1 className="text-4xl font-display font-bold text-white pl-4">
            Warframe World View
          </h1>
        </div>
        
        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-15 py-6 lg:pb-12">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<World />} />
            <Route path="/baro" element={<Baro />} />
            <Route path="/cetus" element={<Cetus />} />
            <Route path="/vallis" element={<Vallis />} />
            <Route path="/cambion" element={<Cambion />} />
            <Route path="/duviri" element={<Duviri />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        {/* empty footer for aesthetic  */}
        <div className="p-5"></div>
        
      </main>
    </div>
  );
}

export default function App(){
  return(
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
};
// export default App;