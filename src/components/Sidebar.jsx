import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import sidebarBg from '../images/warframe_sidebar_background.png';

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'World Overview', path: '/' },
    { name: 'Alerts & Fissures', path: '/dashboard' },
    { name: "Baro Ki'Teer", path: '/baro' },
    { name: 'Duviri', path: '/duviri' },
    { name: 'Cetus', path: '/cetus' },
    { name: 'Fortuna', path: '/vallis' },
    { name: 'Deimos', path: '/cambion' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div 
      className="flex flex-col border-r border-slate-800 transition-all duration-300 bg-cover bg-no-repeat bg-top w-64"
      style={{ backgroundImage: `url(${sidebarBg})` }}
    >
      {/* Sidebar Header & Toggle */}
      <div className="px-2.5 pt-8 flex justify-between items-center gap-1">
        <span className="py-1 px-3 text-xl font-bold text-cyan-500  border rounded-sm border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)]">
          Menu
        </span>

        {/* Reach Out Button */}
        <Link 
          to="/support"
          className={`py-1 px-2.5 text-xl font-semibold whitespace-nowrap border rounded-sm transition-all duration-300 backdrop-blur-[2px]
            ${location.pathname === '/support' 
              ? 'text-red-400 border-red-500/80 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:bg-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'
            }`}
        >
          Reach Out
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 pt-9 space-y-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-1 p-3 w-42.5 rounded-sm transition-all hover:scale-103 duration-300 backdrop-blur-[2px]
                ${isActive 
                  ? 'text-red-400 border border-red-500/80 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.5),inset_0_0_10px_rgba(239,68,68,0.3)] hover:bg-red-900/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]' 
                  : 'text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] hover:bg-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                }`}
            >
              <span className="font-semibold whitespace-nowrap tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Sign In / Sign Out Button */}
      <div className="p-4">
        {user ? (
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:bg-red-500/30 hover:border-red-400 hover:text-red-500 transition-all rounded-sm cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        ) : (
          <Link 
            to="/login"
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:bg-red-500/30 hover:border-red-400 transition-all rounded-sm text-center cursor-pointer"
          >
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}